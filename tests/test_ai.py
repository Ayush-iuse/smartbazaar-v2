def get_auth_headers(client, email="ai_user@example.com"):
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "AI Tester"},
    )
    login_res = client.post(
        "/api/auth/login",
        data={"username": email, "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_ai_description(client):
    headers = get_auth_headers(client)
    res = client.post(
        "/api/ai/description",
        json={"title": "iPhone 13", "keywords": ["128GB", "blue"]},
        headers=headers
    )
    assert res.status_code == 200
    assert "description" in res.json()
    assert res.json()["is_fallback"] is True  # No OpenAI key in tests -> fallback returns True

def test_ai_category(client):
    headers = get_auth_headers(client)
    res = client.post(
        "/api/ai/category",
        json={"title": "Dining table and chairs"},
        headers=headers
    )
    assert res.status_code == 200
    assert res.json()["category"] == "Furniture"

def test_ai_price(client):
    headers = get_auth_headers(client)
    res = client.post(
        "/api/ai/price",
        json={"title": "iPhone 13", "condition": "used"},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["suggested_min"] == 3000.0
    assert data["suggested_max"] == 12000.0

def test_ai_fraud(client):
    headers = get_auth_headers(client)
    res = client.post(
        "/api/ai/fraud",
        json={"title": "iPhone 13", "description": "Urgent transfer advance payment only Western Union"},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["fraud_score"] >= 95.0  # Matches 3 keywords -> 5 + 3*30 = 95
    assert data["fraud_level"] == "High"
    assert "western union" in data["flagged_phrases"]
