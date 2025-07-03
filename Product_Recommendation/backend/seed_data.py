from sqlalchemy.orm import Session
from database import SessionLocal, create_tables
from models import Product
from data_utils import get_products_data

def seed_database():
    """Seed the database with sample products from JSON file"""
    # Create tables
    create_tables()
    
    # Load mock data
    products_data = get_products_data()
    if not products_data:
        print("Failed to load mock data. Exiting.")
        return
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if products already exist
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print(f"Database already has {existing_products} products. Skipping seed.")
            return
        
        # Add products to database
        
        for product_data in products_data:
            product = Product(**product_data)
            db.add(product)
        
        db.commit()
        print(f"Successfully seeded database with {len(products_data)} products!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 