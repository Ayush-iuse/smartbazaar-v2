def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "Password123!", "full_name": "Test User"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_login_user(client):
    # Register user first
    client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "Password123!", "full_name": "Test User"},
    )
    # Login (FastAPI OAuth2 login receives urlencoded form data)
    response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "Password123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_get_me(client):
    # Register and Login
    client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "Password123!", "full_name": "Test User"},
    )
    login_res = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    
    # Retrieve profile using Bearer token header
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
