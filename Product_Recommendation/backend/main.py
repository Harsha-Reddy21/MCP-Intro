from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn

from database import get_db
from models import User, Product, UserInteraction, Recommendation
from schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    ProductResponse, InteractionCreate, RecommendationResponse
)
from auth import create_access_token, verify_token, get_password_hash, verify_password
from recommendation_engine import RecommendationEngine

app = FastAPI(title="AI Product Recommendation System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
recommendation_engine = RecommendationEngine()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

@app.post("/auth/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse(
        id=db_user.id,
        email=db_user.email,
        username=db_user.username,
        created_at=db_user.created_at
    )

@app.post("/auth/login", response_model=Token)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token, token_type="bearer")

@app.get("/products", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get products with optional category filtering"""
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    
    products = query.offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get specific product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@app.post("/interactions")
def track_interaction(
    interaction: InteractionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track user interaction with products"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == interaction.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Create interaction record
    db_interaction = UserInteraction(
        user_id=current_user.id,
        product_id=interaction.product_id,
        interaction_type=interaction.interaction_type,
        rating=interaction.rating
    )
    db.add(db_interaction)
    db.commit()
    
    return {"message": "Interaction tracked successfully"}

@app.get("/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Get AI-powered product recommendations for user"""
    recommendations = recommendation_engine.get_recommendations(
        user_id=current_user.id,
        db=db,
        limit=limit
    )
    return recommendations

@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Get all product categories"""
    categories = db.query(Product.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 