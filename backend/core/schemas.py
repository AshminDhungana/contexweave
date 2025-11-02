from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ==================== DECISION SCHEMAS ====================

class DecisionCreate(BaseModel):
    """
    Schema for creating a decision.
    Used when client sends POST /api/decisions request.
    """
    title: str
    description: Optional[str] = None
    context: Optional[str] = None


class DecisionUpdate(BaseModel):
    """
    Schema for updating a decision.
    Used when client sends PUT /api/decisions/{id} request.
    """
    title: Optional[str] = None
    description: Optional[str] = None
    context: Optional[str] = None
    is_active: Optional[bool] = None


class DecisionResponse(BaseModel):
    """
    Schema for returning a decision.
    Used when server sends decision data to client.
    """
    id: int
    title: str
    description: Optional[str] = None
    context: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True  # Allow reading from ORM objects


# ==================== EVENT SCHEMAS ====================

class EventCreate(BaseModel):
    """
    Schema for creating an event.
    Used when client sends POST /api/events request.
    """
    event_type: str
    source: Optional[str] = None
    description: Optional[str] = None


class EventResponse(BaseModel):
    """
    Schema for returning an event.
    Used when server sends event data to client.
    """
    id: int
    event_type: str
    source: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
