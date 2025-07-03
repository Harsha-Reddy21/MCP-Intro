from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from models import InteractionType

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Product schemas
class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float
    description: Optional[str]
    rating: float
    rating_count: int
    image_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Interaction schemas
class InteractionCreate(BaseModel):
    product_id: int
    interaction_type: InteractionType
    rating: Optional[float] = None

# Recommendation schemas
class RecommendationResponse(BaseModel):
    product: ProductResponse
    score: float
    algorithm_type: str
    
    class Config:
        from_attributes = True 