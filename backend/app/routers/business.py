from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from backend.app.database import get_db
from backend.app.services.auth_service import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/business", tags=["Business Operating System"])

@router.get("/stores")
def get_user_stores(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [
        {"id": 1, "name": "Ayush Electronics", "category": "Electronics", "followers": 1420},
        {"id": 2, "name": "Ayush Rentals", "category": "Rentals", "followers": 890}
    ]

@router.post("/stores")
def create_store(payload: Dict[str, Any], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    name = payload.get("name", "New Store")
    category = payload.get("category", "General")
    return {
        "id": 3,
        "name": name,
        "category": category,
        "followers": 0,
        "status": "Created"
    }

@router.patch("/stores/{id}")
def update_store(id: int, payload: Dict[str, Any], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"id": id, "updated": True, "changes": payload}

@router.get("", response_model=Dict[str, Any])
def get_business_info(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "business_name": "Ayush Enterprise Ltd",
        "gst_number": "27AAAAA1111A1Z1",
        "verification_status": "Verified",
        "website": "https://ayush.enterprise"
    }

@router.post("")
def create_business_account(payload: Dict[str, Any], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "business_name": payload.get("business_name"),
        "gst_number": payload.get("gst_number"),
        "verification_status": "Pending"
    }

@router.get("/collections")
def get_collections(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [
        {"id": 501, "name": "Gaming Setup", "items_count": 8},
        {"id": 502, "name": "Photography Kit", "items_count": 4}
    ]

@router.post("/collections")
def create_collection(payload: Dict[str, Any], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "id": 503,
        "name": payload.get("name", "New Collection"),
        "items_count": 0
    }

@router.get("/followers")
def get_followers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [
        {"user_id": 201, "name": "Rahul Verma", "loyalty_tier": "VIP"},
        {"user_id": 202, "name": "Neha Joshi", "loyalty_tier": "Regular"}
    ]
