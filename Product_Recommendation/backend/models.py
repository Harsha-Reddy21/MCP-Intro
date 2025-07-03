from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class InteractionType(enum.Enum):
    VIEW = "view"
    LIKE = "like"
    PURCHASE = "purchase"
    SEARCH = "search"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    interactions = relationship("UserInteraction", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    price = Column(Float, nullable=False)
    description = Column(Text)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    interactions = relationship("UserInteraction", back_populates="product")

class UserInteraction(Base):
    __tablename__ = "user_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    interaction_type = Column(Enum(InteractionType), nullable=False)
    rating = Column(Float, nullable=True)  # For purchase/like interactions
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="interactions")
    product = relationship("Product", back_populates="interactions")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    score = Column(Float, nullable=False)
    algorithm_type = Column(String, nullable=False)  # 'collaborative' or 'content_based'
    created_at = Column(DateTime, default=datetime.utcnow) 