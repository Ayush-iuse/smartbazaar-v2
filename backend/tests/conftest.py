import os
os.environ["APP_ENV"] = "testing"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.utils.jwt import create_access_token
from backend.app.models.user import User
from backend.app.models.listing import Listing

# Use PostgreSQL for testing to isolate and remove SQLite completely
# If a specific TEST_DATABASE_URL is provided in env, use that, otherwise default to local Postgres
from backend.app.database import sanitize_db_url
SQLALCHEMY_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://postgres:postgres_secure_pass@localhost:5432/smartbazaar"
)
SQLALCHEMY_DATABASE_URL = sanitize_db_url(SQLALCHEMY_DATABASE_URL)

is_sqlite_test = SQLALCHEMY_DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite_test else {"connect_timeout": 10}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_buyer(db_session):
    user = User(
        email="buyer@example.com",
        full_name="Test Buyer",
        hashed_password="hashedpassword"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def test_seller(db_session):
    user = User(
        email="seller@example.com",
        full_name="Test Seller",
        hashed_password="hashedpassword"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def test_listing(db_session, test_seller):
    listing = Listing(
        title="Test Laptop",
        description="A great laptop in good condition.",
        price=45000.0,
        category="Electronics",
        location="Mumbai",
        image_urls="[]",
        seller_id=test_seller.id,
        fraud_score=0.0,
        fraud_level="Low"
    )
    db_session.add(listing)
    db_session.commit()
    db_session.refresh(listing)
    return listing

@pytest.fixture(scope="function")
def buyer_token(test_buyer):
    return create_access_token(data={"sub": test_buyer.email})

@pytest.fixture(scope="function")
def seller_token(test_seller):
    return create_access_token(data={"sub": test_seller.email})
