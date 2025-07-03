# AI-Powered Product Recommendation System

A full-stack web application that provides personalized product recommendations using advanced AI algorithms including collaborative filtering and content-based filtering.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login system with JWT tokens
- **Product Catalog**: Browse products across multiple categories with search and filtering
- **AI Recommendations**: Personalized product suggestions using hybrid algorithms:
  - **Collaborative Filtering**: Recommendations based on similar users' preferences
  - **Content-Based Filtering**: Recommendations based on product features and user preferences
  - **Hybrid Approach**: Combines both methods for optimal results
- **User Interaction Tracking**: Tracks views, likes, purchases, and ratings to improve recommendations
- **Real-time Analytics**: Algorithm performance indicators and recommendation scores

### Technical Features
- **Modern React Frontend**: Responsive UI with styled-components
- **FastAPI Backend**: High-performance Python API with automatic documentation
- **PostgreSQL Database**: Robust data storage with SQLAlchemy ORM
- **Machine Learning**: Scikit-learn powered recommendation algorithms
- **Comprehensive Testing**: Unit tests for authentication and recommendation logic





### AI/ML Components
- **TF-IDF Vectorization** - Content analysis
- **Cosine Similarity** - Product similarity calculation
- **Hybrid Recommendation Engine** - Combines multiple algorithms



1. **Set up Python environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure database**
```bash
# Create PostgreSQL database
createdb recommendation_db

# Update .env file with your database credentials
cp .env.example .env
# Edit .env with your database URL and secret key
```

3. **Initialize database and seed data**
```bash
python seed_data.py
```

4. **Run the backend server**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start the development server**
```bash
npm start
```

The frontend will be available at `http://localhost:3000`