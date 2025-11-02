from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from sqlalchemy import text
import os

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




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
