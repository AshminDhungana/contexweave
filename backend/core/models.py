from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Decision(Base):
    """
    Represents a decision made by the organization.
    This is a core entity in the temporal knowledge graph.
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
    
    def __repr__(self):
        return f"<Decision(id={self.id}, title='{self.title}')>"


class Event(Base):
    """
    Represents events in the system.
    Used for audit trail and triggering real-time updates.
    """
    __tablename__ = "events"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Core Fields
    event_type = Column(String(100), nullable=False, index=True)
    source = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Event(id={self.id}, type='{self.event_type}')>"
