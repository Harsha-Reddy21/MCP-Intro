import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app
from models import User, Product, UserInteraction, InteractionType
from auth import get_password_hash
from recommendation_engine import RecommendationEngine
from data_utils import get_products_data

# Use in-memory SQLite for testing
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
def auth_headers(client):
    """Create a user and return auth headers"""
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123"
    }
    client.post("/auth/register", json=user_data)
    login_response = client.post("/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def load_mock_data():
    """Load mock data from JSON file"""
    products = get_products_data()
    if products:
        return products[:3]  # Return first 3 products for testing
    
    # Fallback to hardcoded data if JSON file not found
    return [
        {
            "name": "Test Product 1",
            "category": "Electronics",
            "price": 99.99,
            "description": "A test electronic product",
            "rating": 4.5,
            "rating_count": 100
        },
        {
            "name": "Test Product 2",
            "category": "Clothing",
            "price": 29.99,
            "description": "A test clothing product",
            "rating": 4.0,
            "rating_count": 50
        },
        {
            "name": "Test Product 3",
            "category": "Electronics",
            "price": 199.99,
            "description": "Another electronic product",
            "rating": 4.8,
            "rating_count": 200
        }
    ]

@pytest.fixture
def sample_products():
    """Create sample products for testing from JSON data"""
    return load_mock_data()

def test_get_products(client, sample_products):
    """Test getting products"""
    # First, we need to add products to the database
    db = next(override_get_db())
    for product_data in sample_products:
        product = Product(**product_data)
        db.add(product)
    db.commit()
    db.close()
    
    response = client.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == len(sample_products)

def test_get_products_by_category(client, sample_products):
    """Test filtering products by category"""
    # Add products to database
    db = next(override_get_db())
    for product_data in sample_products:
        product = Product(**product_data)
        db.add(product)
    db.commit()
    db.close()
    
    response = client.get("/products?category=Electronics")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Should return 2 electronics products
    for product in data:
        assert product["category"] == "Electronics"

def test_track_interaction(client, auth_headers, sample_products):
    """Test tracking user interactions"""
    # Add products to database
    db = next(override_get_db())
    for product_data in sample_products:
        product = Product(**product_data)
        db.add(product)
    db.commit()
    product_id = db.query(Product).first().id
    db.close()
    
    interaction_data = {
        "product_id": product_id,
        "interaction_type": "view"
    }
    
    response = client.post("/interactions", json=interaction_data, headers=auth_headers)
    assert response.status_code == 200
    assert "Interaction tracked successfully" in response.json()["message"]

def test_track_interaction_with_rating(client, auth_headers, sample_products):
    """Test tracking interaction with rating"""
    # Add products to database
    db = next(override_get_db())
    for product_data in sample_products:
        product = Product(**product_data)
        db.add(product)
    db.commit()
    product_id = db.query(Product).first().id
    db.close()
    
    interaction_data = {
        "product_id": product_id,
        "interaction_type": "purchase",
        "rating": 5.0
    }
    
    response = client.post("/interactions", json=interaction_data, headers=auth_headers)
    assert response.status_code == 200

def test_get_recommendations_new_user(client, auth_headers):
    """Test getting recommendations for new user (should return empty or popular items)"""
    response = client.get("/recommendations", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    # New user should get empty recommendations or popular products
    assert isinstance(data, list)

def test_recommendation_engine_collaborative_filtering():
    """Test collaborative filtering algorithm"""
    engine = RecommendationEngine()
    
    # Create mock database session
    class MockDB:
        def query(self, model):
            return MockQuery()
    
    class MockQuery:
        def filter(self, *args):
            return self
        
        def all(self):
            return []
    
    # Test with empty interactions (new user)
    recommendations = engine._get_collaborative_recommendations(1, MockDB(), 5)
    assert isinstance(recommendations, list)

def test_recommendation_engine_content_based():
    """Test content-based filtering algorithm"""
    engine = RecommendationEngine()
    
    class MockDB:
        def query(self, model):
            return MockQuery()
    
    class MockQuery:
        def filter(self, *args):
            return self
        
        def all(self):
            return []
    
    # Test with empty interactions
    recommendations = engine._get_content_based_recommendations(1, MockDB(), 5)
    assert isinstance(recommendations, list)

def test_get_categories(client, sample_products):
    """Test getting product categories"""
    # Add products to database
    db = next(override_get_db())
    for product_data in sample_products:
        product = Product(**product_data)
        db.add(product)
    db.commit()
    db.close()
    
    response = client.get("/categories")
    assert response.status_code == 200
    data = response.json()
    assert "Electronics" in data
    assert "Clothing" in data

def test_invalid_product_interaction(client, auth_headers):
    """Test tracking interaction with non-existent product"""
    interaction_data = {
        "product_id": 999999,  # Non-existent product
        "interaction_type": "view"
    }
    
    response = client.post("/interactions", json=interaction_data, headers=auth_headers)
    assert response.status_code == 404
    assert "Product not found" in response.json()["detail"] 