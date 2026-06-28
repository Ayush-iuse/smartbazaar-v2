def get_auth_headers(client, email="chat_user@example.com"):
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Chatter"},
    )
    login_res = client.post(
        "/api/auth/login",
        data={"username": email, "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_send_and_get_messages(client):
    owner_headers = get_auth_headers(client, email="owner@example.com")
    buyer_headers = get_auth_headers(client, email="buyer@example.com")
    
    # Create listing
    res = client.post(
        "/api/listings",
        json={"title": "iPhone 13", "price": 45000, "category": "Electronics", "location": "Mumbai"},
        headers=owner_headers
    )
    listing_id = res.json()["id"]
    
    # Buyer starts conversation
    conv_res = client.post(
        "/api/conversations",
        json={"listing_id": listing_id},
        headers=buyer_headers
    )
    assert conv_res.status_code == 200
    conversation_id = conv_res.json()["id"]
    
    # Buyer sends message
    msg_res = client.post(
        "/api/messages",
        json={"conversation_id": conversation_id, "content": "Hello! Is this still available?"},
        headers=buyer_headers
    )
    assert msg_res.status_code == 201
    assert msg_res.json()["content"] == "Hello! Is this still available?"
    
    # Buyer gets conversation history
    history_res = client.get(
        f"/api/messages?conversation_id={conversation_id}",
        headers=buyer_headers
    )
    assert history_res.status_code == 200
    messages = history_res.json()
    assert len(messages) >= 1
    assert messages[0]["content"] == "Hello! Is this still available?"
