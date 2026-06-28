from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.services.saved_search_service import SavedSearchService

router = APIRouter(prefix="/saved-searches", tags=["Saved Searches"])

class SavedSearchCreate(BaseModel):
    query: str
    filters: Optional[dict] = None

class SavedSearchResponse(BaseModel):
    id: int
    user_id: int
    query: str
    filters: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[SavedSearchResponse])
def get_saved_searches(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SavedSearchService.get_user_searches(db, current_user.id)

@router.post("", response_model=SavedSearchResponse, status_code=status.HTTP_201_CREATED)
def create_saved_search(payload: SavedSearchCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SavedSearchService.save_search(db, current_user.id, payload.query, payload.filters)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_search(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted = SavedSearchService.delete_search(db, current_user.id, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Saved search not found or not owned by user")
    return None
