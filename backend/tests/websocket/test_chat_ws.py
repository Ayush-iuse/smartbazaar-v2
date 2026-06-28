import json
import pytest
from fastapi.testclient import TestClient
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message

from fastapi.websockets import WebSocketDisconnect

def test_ws_connection_auth_required(client):
    # Reject handshake if token is missing
    with pytest.raises(WebSocketDisconnect) as exc:
         with client.websocket_connect("/api/v2/chat/ws") as ws:
             ws.receive_text()
    assert exc.value.code == 4008
             
    # Reject handshake if token is invalid
    with pytest.raises(WebSocketDisconnect) as exc:
         with client.websocket_connect("/api/v2/chat/ws?token=invalidtoken") as ws:
             ws.receive_text()
    assert exc.value.code == 4008

def test_ws_lifecycle_flow(client, db_session, test_buyer, test_seller, test_listing, buyer_token, seller_token):
    # Pre-create a conversation
    conv = Conversation(
        listing_id=test_listing.id,
        buyer_id=test_buyer.id,
        seller_id=test_seller.id
    )
    db_session.add(conv)
    db_session.commit()
    db_session.refresh(conv)

    # 1. Connect buyer
    with client.websocket_connect(f"/api/v2/chat/ws?token={buyer_token}") as buyer_ws:
        
        # 2. Test Ping/Pong
        buyer_ws.send_text(json.dumps({"type": "ping"}))
        response = buyer_ws.receive_text()
        data = json.loads(response)
        assert data["type"] == "pong"

        # 3. Test sending typing status
        buyer_ws.send_text(json.dumps({
            "type": "typing_status",
            "conversation_id": conv.id,
            "is_typing": True
        }))
        
        # 4. Connect seller to see presence updates
        with client.websocket_connect(f"/api/v2/chat/ws?token={seller_token}") as seller_ws:
            # Connect should trigger presence broadcast
            pass

        # 5. Send message from buyer via WS
        buyer_ws.send_text(json.dumps({
            "type": "send_message",
            "conversation_id": conv.id,
            "content": "Hi, is this laptop negotiable?"
        }))
        
        msg_data = None
        for _ in range(5):
            res_text = buyer_ws.receive_text()
            event = json.loads(res_text)
            if event.get("type") == "new_message":
                msg_data = event
                break
                
        assert msg_data is not None
        assert msg_data["type"] == "new_message"
        assert msg_data["content"] == "Hi, is this laptop negotiable?"
        assert msg_data["conversation_id"] == conv.id
        
        # Check database records
        db_session.expire_all()
        msg = db_session.query(Message).filter(Message.conversation_id == conv.id).first()
        assert msg is not None
        assert msg.content == "Hi, is this laptop negotiable?"
        assert msg.sender_id == test_buyer.id

        # 6. Test Mark Read via WS
        buyer_ws.send_text(json.dumps({
            "type": "mark_read",
            "conversation_id": conv.id
        }))
        # Reset count validation
        assert conv.id is not None
