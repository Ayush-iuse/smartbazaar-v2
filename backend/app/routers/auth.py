from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.auth import UserCreate, UserResponse, Token
from backend.app.services.auth_service import create_user, authenticate_user, get_current_user, get_user_by_email, record_login_attempt
from backend.app.services.trust_service import TrustService
from backend.app.utils.jwt import create_access_token
from backend.app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
seller_router = APIRouter(prefix="/seller", tags=["Seller Credibility"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user_in)

@router.post("/login", response_model=Token)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    ip_address = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "unknown")

    user = get_user_by_email(db, form_data.username)
    if user and user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is suspended"
        )

    authenticated_user = authenticate_user(db, form_data.username, form_data.password)
    if not authenticated_user:
        if user:
            record_login_attempt(db, user, ip_address, user_agent, "failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    record_login_attempt(db, authenticated_user, ip_address, user_agent, "success")
    access_token = create_access_token(data={"sub": authenticated_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@seller_router.get("/trust-score/{seller_id}")
def read_seller_trust_score(seller_id: int, db: Session = Depends(get_db)):
    score_details = TrustService.get_seller_score_precalculated(db, seller_id)
    return score_details
