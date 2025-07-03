import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Tuple
from models import User, Product, UserInteraction, InteractionType
from schemas import RecommendationResponse, ProductResponse
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

class RecommendationEngine:
    def __init__(self):
        self.content_vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.content_similarity_matrix = None
        self.last_update = None
        
    def get_recommendations(self, user_id: int, db: Session, limit: int = 10) -> List[RecommendationResponse]:
        """Get recommendations using hybrid approach (collaborative + content-based)"""
        # Get collaborative filtering recommendations
        collaborative_recs = self._get_collaborative_recommendations(user_id, db, limit // 2)
        
        # Get content-based recommendations
        content_recs = self._get_content_based_recommendations(user_id, db, limit // 2)
        
        # Combine and deduplicate recommendations
        all_recs = {}
        
        # Add collaborative recommendations with higher weight
        for rec in collaborative_recs:
            all_recs[rec['product_id']] = {
                'product': rec['product'],
                'score': rec['score'] * 0.7,  # Weight collaborative filtering higher
                'algorithm_type': 'collaborative'
            }
        
        # Add content-based recommendations
        for rec in content_recs:
            if rec['product_id'] in all_recs:
                # Combine scores if product already recommended by collaborative filtering
                all_recs[rec['product_id']]['score'] += rec['score'] * 0.3
                all_recs[rec['product_id']]['algorithm_type'] = 'hybrid'
            else:
                all_recs[rec['product_id']] = {
                    'product': rec['product'],
                    'score': rec['score'] * 0.3,
                    'algorithm_type': 'content_based'
                }
        
        # Sort by score and return top recommendations
        sorted_recs = sorted(all_recs.values(), key=lambda x: x['score'], reverse=True)[:limit]
        
        return [
            RecommendationResponse(
                product=rec['product'],
                score=rec['score'],
                algorithm_type=rec['algorithm_type']
            )
            for rec in sorted_recs
        ]
    
    def _get_collaborative_recommendations(self, user_id: int, db: Session, limit: int) -> List[Dict]:
        """Collaborative filtering based on user similarities"""
        # Get user's interactions
        user_interactions = db.query(UserInteraction).filter(
            UserInteraction.user_id == user_id
        ).all()
        
        if not user_interactions:
            # New user - return popular products
            return self._get_popular_products(db, limit)
        
        # Get products the user has interacted with
        user_products = {interaction.product_id for interaction in user_interactions}
        
        # Find similar users based on common product interactions
        similar_users = self._find_similar_users(user_id, user_products, db)
        
        # Get recommendations from similar users
        recommendations = {}
        
        for similar_user_id, similarity_score in similar_users[:10]:  # Top 10 similar users
            similar_user_interactions = db.query(UserInteraction).filter(
                UserInteraction.user_id == similar_user_id,
                UserInteraction.product_id.notin_(user_products)  # Exclude products user already knows
            ).all()
            
            for interaction in similar_user_interactions:
                product_id = interaction.product_id
                
                # Calculate recommendation score
                base_score = similarity_score
                if interaction.interaction_type == InteractionType.PURCHASE:
                    base_score *= 3.0
                elif interaction.interaction_type == InteractionType.LIKE:
                    base_score *= 2.0
                elif interaction.interaction_type == InteractionType.VIEW:
                    base_score *= 1.0
                
                if interaction.rating:
                    base_score *= (interaction.rating / 5.0)
                
                if product_id in recommendations:
                    recommendations[product_id] += base_score
                else:
                    recommendations[product_id] = base_score
        
        # Get product details and format recommendations
        product_recs = []
        for product_id, score in sorted(recommendations.items(), key=lambda x: x[1], reverse=True)[:limit]:
            product = db.query(Product).filter(Product.id == product_id).first()
            if product:
                product_recs.append({
                    'product_id': product_id,
                    'product': ProductResponse.from_orm(product),
                    'score': score
                })
        
        return product_recs
    
    def _find_similar_users(self, user_id: int, user_products: set, db: Session) -> List[Tuple[int, float]]:
        """Find users with similar product interactions"""
        # Get all user interactions
        all_interactions = db.query(UserInteraction).filter(
            UserInteraction.user_id != user_id
        ).all()
        
        # Group by user
        user_product_sets = {}
        for interaction in all_interactions:
            if interaction.user_id not in user_product_sets:
                user_product_sets[interaction.user_id] = set()
            user_product_sets[interaction.user_id].add(interaction.product_id)
        
        # Calculate Jaccard similarity
        similarities = []
        for other_user_id, other_products in user_product_sets.items():
            if len(other_products) > 0:
                intersection = len(user_products & other_products)
                union = len(user_products | other_products)
                similarity = intersection / union if union > 0 else 0
                
                if similarity > 0.1:  # Minimum similarity threshold
                    similarities.append((other_user_id, similarity))
        
        return sorted(similarities, key=lambda x: x[1], reverse=True)
    
    def _get_content_based_recommendations(self, user_id: int, db: Session, limit: int) -> List[Dict]:
        """Content-based filtering using product features"""
        # Get user's interaction history
        user_interactions = db.query(UserInteraction).filter(
            UserInteraction.user_id == user_id
        ).all()
        
        if not user_interactions:
            return []
        
        # Get liked/purchased products
        liked_products = []
        for interaction in user_interactions:
            if interaction.interaction_type in [InteractionType.LIKE, InteractionType.PURCHASE]:
                product = db.query(Product).filter(Product.id == interaction.product_id).first()
                if product:
                    liked_products.append(product)
        
        if not liked_products:
            return []
        
        # Build or update content similarity matrix
        self._update_content_similarity_matrix(db)
        
        # Get all products
        all_products = db.query(Product).all()
        product_id_to_index = {product.id: idx for idx, product in enumerate(all_products)}
        
        # Calculate content-based scores
        recommendations = {}
        interacted_product_ids = {interaction.product_id for interaction in user_interactions}
        
        for liked_product in liked_products:
            if liked_product.id in product_id_to_index:
                liked_idx = product_id_to_index[liked_product.id]
                
                # Get similar products based on content
                similarities = self.content_similarity_matrix[liked_idx]
                
                for idx, similarity in enumerate(similarities):
                    product = all_products[idx]
                    
                    # Skip products user already interacted with
                    if product.id in interacted_product_ids:
                        continue
                    
                    if similarity > 0.1:  # Minimum similarity threshold
                        if product.id in recommendations:
                            recommendations[product.id] = max(recommendations[product.id], similarity)
                        else:
                            recommendations[product.id] = similarity
        
        # Format recommendations
        product_recs = []
        for product_id, score in sorted(recommendations.items(), key=lambda x: x[1], reverse=True)[:limit]:
            product = db.query(Product).filter(Product.id == product_id).first()
            if product:
                product_recs.append({
                    'product_id': product_id,
                    'product': ProductResponse.from_orm(product),
                    'score': score
                })
        
        return product_recs
    
    def _update_content_similarity_matrix(self, db: Session):
        """Update content similarity matrix if needed"""
        # Check if we need to update (simple time-based check)
        import time
        current_time = time.time()
        
        if (self.last_update is None or 
            current_time - self.last_update > 3600 or  # Update every hour
            self.content_similarity_matrix is None):
            
            # Get all products
            products = db.query(Product).all()
            
            # Create content features (category + description)
            content_features = []
            for product in products:
                feature_text = f"{product.category} {product.description or ''}"
                content_features.append(feature_text)
            
            # Calculate TF-IDF and similarity matrix
            if content_features:
                tfidf_matrix = self.content_vectorizer.fit_transform(content_features)
                self.content_similarity_matrix = cosine_similarity(tfidf_matrix)
                self.last_update = current_time
    
    def _get_popular_products(self, db: Session, limit: int) -> List[Dict]:
        """Get popular products for new users"""
        # Get products with most interactions
        popular_products = db.query(
            Product.id,
            func.count(UserInteraction.id).label('interaction_count')
        ).join(
            UserInteraction, Product.id == UserInteraction.product_id
        ).group_by(
            Product.id
        ).order_by(
            func.count(UserInteraction.id).desc()
        ).limit(limit).all()
        
        product_recs = []
        for product_id, interaction_count in popular_products:
            product = db.query(Product).filter(Product.id == product_id).first()
            if product:
                product_recs.append({
                    'product_id': product_id,
                    'product': ProductResponse.from_orm(product),
                    'score': float(interaction_count)
                })
        
        return product_recs 