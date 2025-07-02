
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

# Simple TF-IDF based embeddings instead of OpenAI
vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')

def embed_question(text):
    """Create a simple TF-IDF embedding for the text"""
    # For single text, we need to fit and transform
    # This is a simple approach - in production you'd want to fit once
    return vectorizer.transform([text]).toarray()[0]

def flatten_knowledge_base(nested_kb):
    """Flatten the nested knowledge base structure into a list of Q&A pairs."""
    flat_kb = []
    
    def extract_qa_pairs(obj, path=""):
        if isinstance(obj, dict):
            if "question" in obj and "answer" in obj:
                # This is a Q&A pair
                qa_pair = {
                    "question": obj["question"],
                    "answer": obj["answer"],
                    "category": path
                }
                if "key_points" in obj:
                    qa_pair["key_points"] = obj["key_points"]
                if "code_example" in obj:
                    qa_pair["code_example"] = obj["code_example"]
                flat_kb.append(qa_pair)
            else:
                # Continue traversing the nested structure
                for key, value in obj.items():
                    new_path = f"{path}.{key}" if path else key
                    extract_qa_pairs(value, new_path)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                extract_qa_pairs(item, f"{path}[{i}]")
    
    for item in nested_kb:
        extract_qa_pairs(item)
    
    return flat_kb

def load_kb_embeddings(path):
    """Load knowledge base and create TF-IDF embeddings"""
    global vectorizer
    
    with open(path, "r") as f:
        nested_kb = json.load(f)
    
    # Flatten the nested structure
    kb = flatten_knowledge_base(nested_kb)
    
    # Prepare all texts for TF-IDF
    all_texts = []
    for entry in kb:
        text = entry["question"] + " " + entry["answer"]
        # Also include key points if available
        if "key_points" in entry:
            text += " " + " ".join(entry["key_points"])
        all_texts.append(text)
        entry["text"] = text
    
    # Fit the vectorizer on all texts
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    # Store embeddings
    for i, entry in enumerate(kb):
        entry["embedding"] = tfidf_matrix[i].toarray()[0]
    
    embeddings = np.array([entry["embedding"] for entry in kb])
    return kb, embeddings

def embed_query(text, fitted_vectorizer=None):
    """Embed a query using the fitted vectorizer"""
    global vectorizer
    if fitted_vectorizer:
        return fitted_vectorizer.transform([text]).toarray()[0]
    else:
        # Use the global vectorizer (assuming it's already fitted)
        return vectorizer.transform([text]).toarray()[0]