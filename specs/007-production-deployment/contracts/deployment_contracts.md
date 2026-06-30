# Interface Contracts: Production Deployment Platform

This document describes the API and connection contracts exposed by the SmartBazaar V2 platform.

---

## 1. SYSTEM MONITORING ENDPOINTS

### Endpoint: `GET /health`
Exposes application health status.

**Response (JSON)**:
- **HTTP Status**: `200 OK`
- **Payload**:
  ```json
  {
    "status": "healthy",
    "version": "1.0.0"
  }
  ```

---

### Endpoint: `GET /metrics`
Exposes telemetry data and memory utilization indices.

**Response (JSON)**:
- **HTTP Status**: `200 OK`
- **Payload**:
  ```json
  {
    "status": "online",
    "timestamp": "2026-06-30T00:00:00Z",
    "process": {
      "memory_rss_mb": 42.5,
      "cpu_percent": 1.2
    }
  }
  ```

---

## 2. WEBSOCKET HANDSHAKE PROTOCOL

### Path: `/api/v2/chat/ws`
Established connection route between client browser and chat gateway.

**Query Parameters**:
- **`token`** (String, Mandatory): Valid OAuth2 JWT access token.

**Handshake Failure Codes**:
- **`4008`**: Authentication token missing or invalid. Connection closed immediately.

---

## 3. WEBSOCKET MESSAGE LAYOUTS

### Ping-Pong Heartbeat

**Client Ping (JSON)**:
```json
{
  "type": "ping"
}
```

**Server Pong (JSON)**:
```json
{
  "type": "pong"
}
```
