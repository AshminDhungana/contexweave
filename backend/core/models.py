from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Decision(Base):
    """
    Represents a decision made by the organization.
    This is a core entity in the temporal knowledge graph.
    
    Relationships:
    - One Decision → Many Events (tracks its lifecycle)
    """
    __tablename__ = "decisions"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Core Fields
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    context = Column(String(500), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # ✨ NEW: Relationship to Events
    # This allows: decision.events (get all events for this decision)
    # cascade="all, delete-orphan" = if decision deleted, all events deleted
    events = relationship(
        "Event",
        back_populates="decision",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    def __repr__(self):
        return f"<Decision(id={self.id}, title='{self.title}')>"


class Event(Base):
    """
    Represents events in the system.
    Used for audit trail and triggering real-time updates.
    
    Each event is linked to a Decision, creating a temporal record of
    when decisions were made, reviewed, approved, implemented, etc.
    """
    __tablename__ = "events"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # ✨ NEW: Foreign Key to Decision (THE CRITICAL LINK)
    # This links every event to its parent decision
    # nullable=False = every event MUST belong to a decision
    # ForeignKey("decisions.id", ondelete="CASCADE") = if decision deleted, event deleted
    decision_id = Column(
        Integer,
        ForeignKey("decisions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Core Fields
    event_type = Column(String(100), nullable=False, index=True)
    source = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # ✨ NEW: Relationship back to Decision
    # This allows: event.decision (get parent decision)
    # back_populates="events" = creates bidirectional access
    decision = relationship("Decision", back_populates="events")
    
    def __repr__(self):
        return f"<Event(id={self.id}, type='{self.event_type}', decision_id={self.decision_id})>"
