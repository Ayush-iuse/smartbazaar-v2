import json
import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class WebSocketConnectionManager:
    def __init__(self):
        # Maps user_id -> List of active WebSockets (allows multi-tab session sync)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connected for user_id={user_id}. Total connections: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: int, websocket: WebSocket) -> None:
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                logger.info(f"WebSocket disconnected for user_id={user_id}.")
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                logger.info(f"All connections closed for user_id={user_id}.")

    async def send_personal_message(self, message: dict, user_id: int) -> None:
        """Send a real-time message to all active WebSocket sessions of a specific user."""
        if user_id in self.active_connections:
            closed_sockets = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error sending message to user_id={user_id}: {e}")
                    closed_sockets.append(connection)
            
            # Prune closed sockets
            for socket in closed_sockets:
                self.disconnect(user_id, socket)

    async def broadcast_to_participants(self, participant_ids: List[int], event: dict) -> None:
        """Broadcast a chat event to all active conversation participants."""
        for user_id in participant_ids:
            await self.send_personal_message(event, user_id)

# Global connection manager instance
manager = WebSocketConnectionManager()
