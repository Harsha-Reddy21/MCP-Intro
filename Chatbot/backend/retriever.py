
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def get_top_k_matches(query_vec, kb_embeddings, kb, k=3):
    similarities = cosine_similarity([query_vec], kb_embeddings)[0]
    top_indices = similarities.argsort()[::-1][:k]
    return [kb[i] for i in top_indices]