from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from sqlalchemy import text
from datetime import datetime
from core.schemas import DecisionCreate, DecisionUpdate, EventCreate
import os

from core.database import engine, Base, get_db
from core.init_db import init_db  # ✨ NEW
from core.auth import (
    UserRegister, UserLogin, Token, UserResponse,
    hash_password, verify_password, create_access_token,
    decode_access_token, extract_token_from_header
)
from core.models import User
from core import models, schemas, service

load_dotenv()

# ✨ AUTO-INITIALIZE DATABASE AND ADMIN
print("🚀 Initializing ContextWeave...")
init_db()

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ContextWeave API",
    description="Real-time temporal knowledge graph platform",
    version="0.4.0"
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
        "version": "0.4.0",
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
        "version": "0.4.0",
        "database": db_status
    }

# ==================== DEPENDENCY: GET CURRENT USER ====================

def get_current_user_from_token(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    """Dependency function to extract current user from JWT token"""
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

def check_is_admin(current_user: User = Depends(get_current_user_from_token)) -> User:
    """Dependency to check if user is admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/api/auth/signup", response_model=Token)
def signup(user_data: UserRegister, db: Session = Depends(get_db)):
    """User signup endpoint - creates new account"""
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    password_hash = hash_password(user_data.password)
    
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=password_hash,
        role="user",
        status="pending"  # ✨ NEW: Requires admin approval
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Return pending status info
    return {"access_token": "pending_approval", "token_type": "pending"}

@app.post("/api/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """User login endpoint"""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # ✨ NEW: Check approval status
    if user.status == "pending":
        raise HTTPException(
            status_code=403, 
            detail="Your account is pending admin approval. Please wait for email confirmation."
        )
    
    if user.status == "rejected":
        raise HTTPException(
            status_code=403, 
            detail="Your account has been rejected. Please contact support."
        )
    
    access_token = create_access_token(user.id, user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get current user information from token"""
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token_data = decode_access_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# ==================== PROTECTED DECISION ENDPOINTS ====================

@app.post("/api/decisions", response_model=schemas.DecisionResponse)
async def create_decision(
    decision: schemas.DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Create a new decision (requires authentication)"""
    new_decision = models.Decision(
        **decision.dict(),
        user_id=current_user.id
    )
    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)
    return new_decision

@app.get("/api/decisions/{decision_id}", response_model=schemas.DecisionResponse)
async def get_decision(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get a decision by ID (must own it)"""
    decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision

@app.get("/api/decisions", response_model=list[schemas.DecisionResponse])
async def list_decisions(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """List all decisions for current user"""
    decisions = db.query(models.Decision).filter(
        models.Decision.user_id == current_user.id,
        models.Decision.is_active == True
    ).offset(skip).limit(limit).all()
    
    return decisions

@app.put("/api/decisions/{decision_id}", response_model=schemas.DecisionResponse)
async def update_decision(
    decision_id: int,
    decision: schemas.DecisionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Update a decision (must own it)"""
    db_decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
    if not db_decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    for key, value in decision.dict(exclude_unset=True).items():
        setattr(db_decision, key, value)
    
    db.commit()
    db.refresh(db_decision)
    return db_decision

@app.delete("/api/decisions/{decision_id}")
async def delete_decision(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Delete a decision (must own it)"""
    db_decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
    if not db_decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    db_decision.is_active = False
    db.commit()
    return {"message": "Decision deleted successfully"}

# ==================== PROTECTED EVENT ENDPOINTS ====================

@app.post("/api/events", response_model=schemas.EventResponse)
async def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Create a new event (decision must be yours)"""
    decision = db.query(models.Decision).filter(
        models.Decision.id == event.decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found or not owned by you")
    
    new_event = models.Event(**event.dict())
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@app.get("/api/events", response_model=list[schemas.EventResponse])
async def list_events(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """List events for current user's decisions"""
    user_decision_ids = db.query(models.Decision.id).filter(
        models.Decision.user_id == current_user.id
    ).all()
    decision_ids = [d[0] for d in user_decision_ids]
    
    events = db.query(models.Event).filter(
        models.Event.decision_id.in_(decision_ids)
    ).offset(skip).limit(limit).all()
    
    return events

@app.get("/api/decisions/{decision_id}/events", response_model=list[schemas.EventResponse])
async def get_decision_events(
    decision_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get all events for a decision (must own it)"""
    decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    events = db.query(models.Event).filter(
        models.Event.decision_id == decision_id
    ).offset(skip).limit(limit).all()
    
    return events

@app.delete("/api/events/{event_id}")
async def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Delete an event (decision must be yours)"""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    decision = db.query(models.Decision).filter(
        models.Decision.id == event.decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
    if not decision:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
    
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

# ==================== GRAPH ENDPOINTS ====================

@app.get("/api/graph/timeline/{decision_id}")
async def get_decision_timeline(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get temporal timeline for a decision"""
    
    decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    events = db.query(models.Event).filter(
        models.Event.decision_id == decision_id
    ).all()
    
    print(f"📊 Timeline query: decision_id={decision_id}, found {len(events)} events")
    
    return {
        "decision_id": decision_id,
        "decision_title": decision.title,
        "timeline": [
            {
                "event_id": e.id,
                "event_type": e.event_type,
                "description": e.description,
                "source": e.source,
                "timestamp": e.created_at.isoformat() if e.created_at else None
            }
            for e in events
        ],
        "event_count": len(events)
    }

@app.get("/api/graph/stats")
async def get_graph_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get statistics about the knowledge graph"""
    user_decisions = db.query(models.Decision).filter(
        models.Decision.user_id == current_user.id
    ).count()
    
    user_decision_ids = db.query(models.Decision.id).filter(
        models.Decision.user_id == current_user.id
    ).all()
    decision_ids = [d[0] for d in user_decision_ids]
    
    user_events = 0
    if decision_ids:
        user_events = db.query(models.Event).filter(
            models.Event.decision_id.in_(decision_ids)
        ).count()
    
    return {
        "status": "healthy",
        "decisions_in_graph": user_decisions,
        "events_in_graph": user_events,
        "relationships": user_events * 2  
    }

@app.get("/api/graph/related-decisions/{decision_id}")
async def get_related_decisions(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get decisions related through the graph"""
    decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    return {
        "decision_id": decision_id,
        "related_decisions": [],
        "count": 0
    }

# ==================== LLM ANALYSIS ENDPOINTS ====================

@app.get("/api/llm/summarize/{decision_id}")
async def summarize_decision(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Generate AI summary of decision timeline"""
    from core.llm_service import LLMService
    from core.graph_service import GraphService
    
    decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
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
async def analyze_decision_risks(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Identify risks and opportunities in decision"""
    from core.llm_service import LLMService
    from core.graph_service import GraphService
    
    decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
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
async def generate_next_steps(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Generate recommended next steps"""
    from core.llm_service import LLMService
    from core.graph_service import GraphService
    
    decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
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
async def evaluate_decision_quality(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Score decision-making quality"""
    from core.llm_service import LLMService
    from core.graph_service import GraphService
    
    decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
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
async def get_decision_metrics(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get metrics for a specific decision"""
    from core.analytics_service import AnalyticsService
    
    decision = db.query(models.Decision).filter(
        models.Decision.id == decision_id,
        models.Decision.user_id == current_user.id
    ).first()
    
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    metrics = AnalyticsService.get_decision_metrics(db, decision_id)
    return metrics

@app.get("/api/analytics/overview")
async def get_all_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get analytics overview for current user"""
    decisions = db.query(models.Decision).filter(
        models.Decision.user_id == current_user.id,
        models.Decision.is_active == True
    ).all()
    
    total_decisions = len(decisions)
    total_events = sum(len(d.events) for d in decisions)
    avg_events = total_events / total_decisions if total_decisions > 0 else 0
    
    return {
        "total_decisions": total_decisions,
        "total_events": total_events,
        "avg_events_per_decision": avg_events,
        "decisions": [
            {
                "id": d.id,
                "title": d.title,
                "event_count": len(d.events),
                "created_at": d.created_at
            }
            for d in decisions
        ]
    }

@app.get("/api/analytics/event-types")
async def get_event_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get event type distribution for current user"""
    user_decision_ids = db.query(models.Decision.id).filter(
        models.Decision.user_id == current_user.id
    ).all()
    decision_ids = [d[0] for d in user_decision_ids]
    
    events = db.query(models.Event).filter(
        models.Event.decision_id.in_(decision_ids) if decision_ids else False
    ).all()
    
    distribution = {}
    for event in events:
        distribution[event.event_type] = distribution.get(event.event_type, 0) + 1
    
    return {
        "event_type_distribution": distribution,
        "total_events": len(events)
    }

@app.get("/api/analytics/timeline")
async def get_timeline_stats(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get decision creation timeline for current user"""
    decisions = db.query(models.Decision).filter(
        models.Decision.user_id == current_user.id
    ).all()
    
    timeline = {}
    for decision in decisions:
        date = decision.created_at.date()
        timeline[str(date)] = timeline.get(str(date), 0) + 1
    
    return {
        "timeline": timeline,
        "total_decisions": len(decisions),
        "days": days
    }

@app.get("/api/analytics/status-summary")
async def get_status_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get decision status summary for current user"""
    decisions = db.query(models.Decision).filter(
        models.Decision.user_id == current_user.id
    ).all()
    
    active = sum(1 for d in decisions if d.is_active)
    inactive = len(decisions) - active
    
    return {
        "active_decisions": active,
        "inactive_decisions": inactive,
        "total_decisions": len(decisions)
    }

# ==================== ADMIN ENDPOINTS ====================

@app.get("/api/admin/pending-users")
def get_pending_users(
    db: Session = Depends(get_db),
    admin: User = Depends(check_is_admin)
):
    """Get all pending user approvals"""
    pending = db.query(User).filter(User.status == "pending").all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "created_at": u.created_at
        }
        for u in pending
    ]

@app.post("/api/admin/approve-user/{user_id}")
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(check_is_admin)
):
    """Approve a pending user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.status != "pending":
        raise HTTPException(status_code=400, detail="User is not pending approval")
    
    user.status = "approved"
    user.approved_at = datetime.utcnow()
    user.approved_by_id = admin.id
    db.commit()
    
    return {
        "message": f"User {user.email} approved",
        "user_id": user.id,
        "status": user.status
    }

@app.post("/api/admin/reject-user/{user_id}")
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(check_is_admin)
):
    """Reject a pending user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.status != "pending":
        raise HTTPException(status_code=400, detail="User is not pending approval")
    
    user.status = "rejected"
    db.commit()
    
    return {
        "message": f"User {user.email} rejected",
        "user_id": user.id,
        "status": user.status
    }

@app.get("/api/admin/all-users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(check_is_admin)
):
    """Get all users with their status"""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "status": u.status,
            "role": u.role,
            "created_at": u.created_at,
            "approved_at": u.approved_at
        }
        for u in users
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
