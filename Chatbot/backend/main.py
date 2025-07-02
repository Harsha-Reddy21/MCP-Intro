import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from embedder import embed_query, load_kb_embeddings
from retriever import get_top_k_matches
from llm_groq import query_llama
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MCP Knowledge Base API", description="RAG system for Model Context Protocol questions using Groq")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check for required environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print('GROQ_API_KEY', GROQ_API_KEY)

if not GROQ_API_KEY:
    print("⚠️  WARNING: GROQ_API_KEY environment variable not set!")
    print("   Please set your Groq API key: export GROQ_API_KEY=your_key_here")
    print("\n📋 To set environment variables in PowerShell:")
    print("   $env:GROQ_API_KEY='your_groq_key_here'")
    print("\n🚀 Then restart the application with: python -m uvicorn main:app --reload")

# Try to load knowledge base and embeddings
try:
    print("📚 Loading knowledge base and generating TF-IDF embeddings...")
    kb, kb_embeddings = load_kb_embeddings("knowledge_base.json")
    print(f"✅ Successfully loaded {len(kb)} Q&A pairs from knowledge base")
except Exception as e:
    print(f"❌ Error loading knowledge base: {e}")
    kb, kb_embeddings = None, None

class QuestionRequest(BaseModel):
    question: str

@app.get("/")
def root():
    return {
        "message": "MCP Knowledge Base API - Powered by Groq",
        "status": "running",
        "groq_configured": bool(GROQ_API_KEY),
        "knowledge_base_loaded": kb is not None,
        "embedding_type": "TF-IDF (no external API required)",
        "endpoints": {
            "ask": "POST /ask - Ask questions about Model Context Protocol",
            "docs": "GET /docs - API documentation",
            "health": "GET /health - Health check"
        }
    }

@app.post("/ask")
def ask_question(request: QuestionRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="Groq API key not configured")
    
    if kb is None or kb_embeddings is None:
        raise HTTPException(status_code=503, detail="Knowledge base not loaded")
    
    try:
        # Generate TF-IDF embedding for the question
        query_embedding = embed_query(request.question)
        
        # Retrieve relevant context
        top_entries = get_top_k_matches(query_embedding, kb_embeddings, kb, k=3)
        context = "\n\n".join([f"Q: {e['question']}\nA: {e['answer']}" for e in top_entries])

        # Generate response using Groq's Llama
        prompt = f"""
You are an expert in Model Context Protocol (MCP). Use the context below to answer the question.

Context:
{context}

User Question: {request.question}
Answer:
"""

        answer = query_llama(prompt)
        
        return {
            "answer": answer,
            "context_sources": len(top_entries),
            "categories": [entry.get('category', 'Unknown') for entry in top_entries],
            "embedding_method": "TF-IDF"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "groq_api_configured": bool(GROQ_API_KEY),
        "knowledge_base_ready": kb is not None,
        "embedding_method": "TF-IDF (sklearn)"
    }