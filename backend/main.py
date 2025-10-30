from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="ContextWeave API",
    description="Real-time temporal knowledge graph platform",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "ContextWeave API is running! 🚀",
        "version": "0.1.0",
        "status": "ready"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "version": "0.1.0"
    }

@app.post("/api/decisions")
async def create_decision(title: str, description: str = None):
    """Create a new decision (simplified)"""
    return {
        "id": 1,
        "title": title,
        "description": description,
        "status": "created"
    }

@app.get("/api/decisions")
async def list_decisions():
    """List all decisions (simplified)"""
    return {
        "decisions": [],
        "total": 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
