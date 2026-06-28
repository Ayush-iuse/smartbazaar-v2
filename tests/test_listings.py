def get_auth_headers(client, email="seller@example.com"):
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Seller Name"},
    )
    login_res = client.post(
        "/api/auth/login",
        data={"username": email, "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_listing(client):
    headers = get_auth_headers(client)
    payload = {
        "title": "Vintage Bicycle",
        "description": "Retro vintage road bike.",
        "price": 5000.0,
        "category": "Vehicles",
        "location": "Mumbai",
        "image_urls": ["/uploads/img1.jpg"]
    }
    response = client.post("/api/listings", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Vintage Bicycle"
    assert data["price"] == 5000.0
    assert data["fraud_level"] == "Low"  # Default fallback level for safe title

def test_get_listings_feed(client):
    headers = get_auth_headers(client)
    payload = {
        "title": "Table",
        "price": 1200.0,
        "category": "Furniture",
        "location": "Delhi",
        "image_urls": []
    }
    client.post("/api/listings", json=payload, headers=headers)
    
    response = client.get("/api/listings")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["title"] == "Table"

def test_listing_detail(client):
    headers = get_auth_headers(client)
    payload = {
        "title": "Chair",
        "price": 500.0,
        "category": "Furniture",
        "location": "Delhi",
        "image_urls": []
    }
    res = client.post("/api/listings", json=payload, headers=headers)
    listing_id = res.json()["id"]
    
    response = client.get(f"/api/listings/{listing_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Chair"

def test_update_listing_owner(client):
    headers = get_auth_headers(client)
    payload = {
        "title": "Chair",
        "price": 500.0,
        "category": "Furniture",
        "location": "Delhi",
        "image_urls": []
    }
    res = client.post("/api/listings", json=payload, headers=headers)
    listing_id = res.json()["id"]
    
    update_payload = {"price": 600.0}
    response = client.put(f"/api/listings/{listing_id}", json=update_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["price"] == 600.0

def test_update_listing_non_owner(client):
    owner_headers = get_auth_headers(client, email="owner@example.com")
    payload = {
        "title": "Chair",
        "price": 500.0,
        "category": "Furniture",
        "location": "Delhi",
        "image_urls": []
    }
    res = client.post("/api/listings", json=payload, headers=owner_headers)
    listing_id = res.json()["id"]
    
    other_headers = get_auth_headers(client, email="other@example.com")
    update_payload = {"price": 600.0}
    response = client.put(f"/api/listings/{listing_id}", json=update_payload, headers=other_headers)
    assert response.status_code == 403

def test_delete_listing_owner(client):
    headers = get_auth_headers(client, email="deleter@example.com")
    payload = {
        "title": "Camera",
        "price": 15000.0,
        "category": "Electronics",
        "location": "Kolkata",
        "image_urls": []
    }
    res = client.post("/api/listings", json=payload, headers=headers)
    listing_id = res.json()["id"]
    
    # Delete listing by owner
    response = client.delete(f"/api/listings/{listing_id}", headers=headers)
    assert response.status_code == 204
    
    # Confirm it cannot be retrieved
    get_res = client.get(f"/api/listings/{listing_id}")
    assert get_res.status_code == 404

def test_delete_listing_non_owner(client):
    owner_headers = get_auth_headers(client, email="l_owner@example.com")
    payload = {
        "title": "Camera",
        "price": 15000.0,
        "category": "Electronics",
        "location": "Kolkata",
        "image_urls": []
    }
    res = client.post("/api/listings", json=payload, headers=owner_headers)
    listing_id = res.json()["id"]
    
    other_headers = get_auth_headers(client, email="l_other@example.com")
    
    # Attempt delete by non-owner -> Forbidden
    response = client.delete(f"/api/listings/{listing_id}", headers=other_headers)
    assert response.status_code == 403
