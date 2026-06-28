from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import UserCreate
from backend.app.utils.jwt import hash_password, verify_password, create_access_token, decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate):
    # Ensure email is unique
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed = hash_password(user_in.password)
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
        
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    
    if user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is suspended"
        )
    return user

def get_current_user_optional(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User or None:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if payload is None:
            return None
        email: str = payload.get("sub")
        if email is None:
            return None
        user = get_user_by_email(db, email)
        if user and user.is_suspended:
            return None
        return user
    except Exception:
        return None

def record_login_attempt(db: Session, user: User, ip_address: str, user_agent: str, status_str: str):
    from backend.app.models.enterprise import LoginHistory
    from backend.app.services.audit_service import AuditService
    from backend.app.services.notification_service import NotificationService
    
    history = LoginHistory(
        user_id=user.id,
        ip_address=ip_address,
        user_agent=user_agent,
        device_info=user_agent.split()[0] if user_agent else "Unknown",
        status=status_str
    )
    db.add(history)
    db.commit()
    db.refresh(history)

    if status_str == "success":
        # Check last 3 successful logins (excluding the current one)
        previous_logins = db.query(LoginHistory).filter(
            LoginHistory.user_id == user.id,
            LoginHistory.status == "success",
            LoginHistory.id != history.id
        ).order_by(LoginHistory.created_at.desc()).limit(3).all()

        if previous_logins:
            previous_ips = {l.ip_address for l in previous_logins}
            if ip_address not in previous_ips:
                # Suspicious login
                NotificationService.create_notification(
                    db=db,
                    user_id=user.id,
                    type="security_event",
                    title="Suspicious Login Detected",
                    message=f"A login from a new IP address ({ip_address}) was detected on your account.",
                    link="/profile"
                )
                AuditService.log_action(
                    db=db,
                    user_id=user.id,
                    action="suspicious_login",
                    entity_type="user",
                    entity_id=user.id,
                    details={"ip_address": ip_address, "user_agent": user_agent},
                    ip_address=ip_address,
                    user_agent=user_agent
                )
        
        # Audit log successful login
        AuditService.log_action(
            db=db,
            user_id=user.id,
            action="login",
            entity_type="user",
            entity_id=user.id,
            details={},
            ip_address=ip_address,
            user_agent=user_agent
        )
    else:
        # Audit log failed login
        AuditService.log_action(
            db=db,
            user_id=user.id,
            action="failed_login",
            entity_type="user",
            entity_id=user.id,
            details={},
            ip_address=ip_address,
            user_agent=user_agent
        )

