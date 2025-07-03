import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app
from models import User
from auth import get_password_hash

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123"
    }

def test_register_user(client, test_user):
    """Test user registration"""
    response = client.post("/auth/register", json=test_user)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]
    assert data["username"] == test_user["username"]
    assert "id" in data

def test_register_duplicate_email(client, test_user):
    """Test registering with duplicate email"""
    # Register user first time
    client.post("/auth/register", json=test_user)
    
    # Try to register again with same email
    response = client.post("/auth/register", json=test_user)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_login_success(client, test_user):
    """Test successful login"""
    # Register user first
    client.post("/auth/register", json=test_user)
    
    # Login
    login_data = {
        "email": test_user["email"],
        "password": test_user["password"]
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client, test_user):
    """Test login with invalid credentials"""
    # Register user first
    client.post("/auth/register", json=test_user)
    
    # Try login with wrong password
    login_data = {
        "email": test_user["email"],
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_login_nonexistent_user(client):
    """Test login with non-existent user"""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "password123"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 401

def test_protected_endpoint_without_token(client):
    """Test accessing protected endpoint without token"""
    response = client.get("/recommendations")
    assert response.status_code == 403  # No Authorization header

def test_protected_endpoint_with_token(client, test_user):
    """Test accessing protected endpoint with valid token"""
    # Register and login
    client.post("/auth/register", json=test_user)
    login_response = client.post("/auth/login", json={
        "email": test_user["email"],
        "password": test_user["password"]
    })
    token = login_response.json()["access_token"]
    
    # Access protected endpoint
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/recommendations", headers=headers)
    assert response.status_code == 200 