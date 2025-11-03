from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from sqlalchemy import text
import os

from core.database import engine, Base, get_db
from core.auth import (
    UserRegister, UserLogin, Token, UserResponse,
    hash_password, verify_password, create_access_token,
    decode_access_token, extract_token_from_header
)
from core.models import User

from core.database import engine, Base, get_db
from core import models, schemas, service

load_dotenv()

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ContextWeave API",
    description="Real-time temporal knowledge graph platform",
    version="0.2.0"
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
        "version": "0.2.0",
        "status": "ready"
    }

@app.get("/health")
async def health(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        print(f"Health check failed: {e}")
        db_status = "unhealthy"
    
    return {
        "status": "healthy",
        "version": "0.2.0",
        "database": db_status
    }


# ==================== DECISION ENDPOINTS ====================

@app.post("/api/decisions", response_model=schemas.DecisionResponse)
async def create_decision(
    decision: schemas.DecisionCreate,
    db: Session = Depends(get_db)
):
    """Create a new decision"""
    return service.DecisionService.create_decision(db, decision)

@app.get("/api/decisions/{decision_id}", response_model=schemas.DecisionResponse)
async def get_decision(
    decision_id: int,
    db: Session = Depends(get_db)
):
    """Get a decision by ID"""
    decision = service.DecisionService.get_decision(db, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision

@app.get("/api/decisions", response_model=list[schemas.DecisionResponse])
async def list_decisions(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """List all active decisions"""
    return service.DecisionService.get_all_decisions(db, skip, limit)

@app.put("/api/decisions/{decision_id}", response_model=schemas.DecisionResponse)
async def update_decision(
    decision_id: int,
    decision: schemas.DecisionUpdate,
    db: Session = Depends(get_db)
):
    """Update a decision"""
    updated = service.DecisionService.update_decision(db, decision_id, decision)
    if not updated:
        raise HTTPException(status_code=404, detail="Decision not found")
    return updated

@app.delete("/api/decisions/{decision_id}")
async def delete_decision(
    decision_id: int,
    db: Session = Depends(get_db)
):
    """Delete a decision (soft delete)"""
    success = service.DecisionService.delete_decision(db, decision_id)
    if not success:
        raise HTTPException(status_code=404, detail="Decision not found")
    return {"message": "Decision deleted successfully"}

# ==================== EVENT ENDPOINTS ====================

@app.post("/api/events", response_model=schemas.EventResponse)
async def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db)
):
    """Create a new event"""
    return service.EventService.create_event(db, event)

@app.get("/api/events", response_model=list[schemas.EventResponse])
async def list_events(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """List all events"""
    return service.EventService.get_events(db, skip, limit)


@app.get("/api/decisions/{decision_id}/events", response_model=list[schemas.EventResponse])
async def get_decision_events(
    decision_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all events for a specific decision (temporal timeline)"""
    # First verify decision exists
    decision = service.DecisionService.get_decision(db, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    # Return all events for this decision
    return service.EventService.get_events_by_decision(db, decision_id, skip, limit)


@app.delete("/api/events/{event_id}")
async def delete_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Delete an event"""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

 # ==================== GRAPH ENDPOINTS ====================

@app.get("/api/graph/timeline/{decision_id}")
async def get_decision_timeline(decision_id: int, db: Session = Depends(get_db)):
    """Get temporal timeline for a decision from Neo4j."""
    from core.graph_service import GraphService
    
    decision = service.DecisionService.get_decision(db, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    timeline = GraphService.get_decision_timeline(decision_id)
    return {
        "decision_id": decision_id,
        "decision_title": decision.title,
        "timeline": timeline,
        "event_count": len(timeline)
    }


@app.get("/api/graph/stats")
async def get_graph_stats():
    """Get statistics about the knowledge graph."""
    from core.neo4j_db import get_neo4j_driver
    try:
        neo4j = get_neo4j_driver()
        decisions = neo4j.execute_query("MATCH (d:Decision) RETURN count(d) as count")
        events = neo4j.execute_query("MATCH (e:Event) RETURN count(e) as count")
        relationships = neo4j.execute_query("MATCH ()-[r:HAS_EVENT]->() RETURN count(r) as count")
        
        return {
            "status": "healthy",
            "decisions_in_graph": decisions[0].get("count", 0),
            "events_in_graph": events[0].get("count", 0),
            "relationships": relationships[0].get("count", 0)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/graph/related-decisions/{decision_id}")
async def get_related_decisions(decision_id: int, db: Session = Depends(get_db)):
    """Get decisions related through the graph."""
    decision = service.DecisionService.get_decision(db, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    # TODO: Implement Neo4j related decisions query
    return {
        "decision_id": decision_id,
        "related_decisions": [],
        "count": 0
    }

# ==================== LLM ANALYSIS ENDPOINTS ====================

@app.get("/api/llm/summarize/{decision_id}")
async def summarize_decision(decision_id: int, db: Session = Depends(get_db)):
    """Generate AI summary of decision timeline."""
    from core.llm_service import LLMService
    from core.graph_service import GraphService
    
    decision = service.DecisionService.get_decision(db, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    events = GraphService.get_decision_timeline(decision_id)
    llm = LLMService()
    summary = llm.summarize_decision_timeline(decision.title, events)
    
    return {
        "decision_id": decision_id,
        "decision_title": decision.title,
        "summary": summary
    }


@app.get("/api/llm/analyze-risks/{decision_id}")
async def analyze_decision_risks(decision_id: int, db: Session = Depends(get_db)):
    """Identify risks and opportunities in decision."""
    from core.llm_service import LLMService
    from core.graph_service import GraphService
    
    decision = service.DecisionService.get_decision(db, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    events = GraphService.get_decision_timeline(decision_id)
    llm = LLMService()
    analysis = llm.analyze_decision_risks(decision.title, events)
    
    return {
        "decision_id": decision_id,
        "decision_title": decision.title,
        "analysis": analysis
    }


@app.get("/api/llm/next-steps/{decision_id}")
async def generate_next_steps(decision_id: int, db: Session = Depends(get_db)):
    """Generate recommended next steps."""
    from core.llm_service import LLMService
    from core.graph_service import GraphService
    
    decision = service.DecisionService.get_decision(db, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    events = GraphService.get_decision_timeline(decision_id)
    llm = LLMService()
    steps = llm.generate_next_steps(decision.title, events)
    
    return {
        "decision_id": decision_id,
        "next_steps": steps
    }


@app.get("/api/llm/quality-score/{decision_id}")
async def evaluate_decision_quality(decision_id: int, db: Session = Depends(get_db)):
    """Score decision-making quality."""
    from core.llm_service import LLMService
    from core.graph_service import GraphService
    
    decision = service.DecisionService.get_decision(db, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    events = GraphService.get_decision_timeline(decision_id)
    llm = LLMService()
    evaluation = llm.evaluate_decision_quality(decision.title, events)
    
    return {
        "decision_id": decision_id,
        "evaluation": evaluation
    }
# ==================== ANALYTICS ENDPOINTS ====================

@app.get("/api/analytics/decision/{decision_id}")
async def get_decision_metrics(decision_id: int, db: Session = Depends(get_db)):
    """Get metrics for a specific decision."""
    from core.analytics_service import AnalyticsService
    metrics = AnalyticsService.get_decision_metrics(db, decision_id)
    if not metrics:
        raise HTTPException(status_code=404, detail="Decision not found")
    return metrics

@app.get("/api/analytics/overview")
async def get_all_metrics(db: Session = Depends(get_db)):
    """Get overall analytics overview."""
    from core.analytics_service import AnalyticsService
    return AnalyticsService.get_all_decisions_metrics(db)

@app.get("/api/analytics/event-types")
async def get_event_distribution(db: Session = Depends(get_db)):
    """Get event type distribution."""
    from core.analytics_service import AnalyticsService
    return AnalyticsService.get_event_type_distribution(db)

@app.get("/api/analytics/timeline")
async def get_timeline_stats(days: int = 30, db: Session = Depends(get_db)):
    """Get decision creation timeline."""
    from core.analytics_service import AnalyticsService
    return AnalyticsService.get_decision_timeline_stats(db, days)

@app.get("/api/analytics/status-summary")
async def get_status_summary(db: Session = Depends(get_db)):
    """Get decision status summary."""
    from core.analytics_service import AnalyticsService
    return AnalyticsService.get_decision_status_summary(db)



# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/api/auth/signup", response_model=Token)
def signup(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    User signup endpoint.
    
    Creates a new user account with email, username, and password.
    Returns JWT access token for immediate login.
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Create user
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=password_hash
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    access_token = create_access_token(new_user.id, new_user.email)
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    User login endpoint.
    
    Authenticates user with email and password.
    Returns JWT access token.
    """
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate token
    access_token = create_access_token(user.id, user.email)
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """
    Get current user information.
    
    Requires: Authorization header with Bearer token
    Returns: Current user details
    """
    # Extract token from header
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    # Decode token
    token_data = decode_access_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get user from database
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


# ==================== DEPENDENCY: GET CURRENT USER ====================

def get_current_user_from_token(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    """
    Dependency function to extract current user from JWT token.
    
    Use this to protect routes:
        @app.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user_from_token)):
            ...
    """
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token_data = decode_access_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
