def get_auth_headers(client, email="search_user@example.com"):
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Searcher"},
    )
    login_res = client.post(
        "/api/auth/login",
        data={"username": email, "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_search_listings(client):
    headers = get_auth_headers(client)
    # Create test listings
    client.post(
        "/api/listings",
        json={"title": "iPhone 13", "price": 45000, "category": "Electronics", "location": "Mumbai"},
        headers=headers
    )
    client.post(
        "/api/listings",
        json={"title": "Dining Table", "price": 8000, "category": "Furniture", "location": "Pune"},
        headers=headers
    )
    
    # 1. Search by title keyword
    res = client.get("/api/search?q=iPhone")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "iPhone 13"
    
    # 2. Search by category
    res = client.get("/api/search?category=Furniture")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "Dining Table"
    
    # 3. Search by location
    res = client.get("/api/search?location=Pune")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "Dining Table"
