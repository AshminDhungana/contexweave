from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


# ==================== USER MODEL ====================

class User(Base):
    """
    Represents a user account in the system.
    Users can create decisions and associated events.
    """
    __tablename__ = "users"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # User Info
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    
    # Password (hashed with bcrypt)
    password_hash = Column(String(255), nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # ✨ Relationship: One User → Many Decisions
    decisions = relationship(
        "Decision",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', username='{self.username}')>"


# ==================== DECISION MODEL ====================

class Decision(Base):
    """
    Represents a decision made by the organization.
    This is a core entity in the temporal knowledge graph.
    
    Relationships:
    - One Decision → Many Events (tracks its lifecycle)
    - One User → Many Decisions (user created the decision)
    """
    __tablename__ = "decisions"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # ✨ NEW: Foreign Key to User (WHO created this decision)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Core Fields
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    context = Column(String(500), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # ✨ Relationships
    events = relationship(
        "Event",
        back_populates="decision",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    user = relationship("User", back_populates="decisions")
    
    def __repr__(self):
        return f"<Decision(id={self.id}, title='{self.title}', user_id={self.user_id})>"


# ==================== EVENT MODEL ====================

class Event(Base):
    """
    Represents events in the system.
    Used for audit trail and triggering real-time updates.
    """
    __tablename__ = "events"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
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
    
    # Relationship
    decision = relationship("Decision", back_populates="events")
    
    def __repr__(self):
        return f"<Event(id={self.id}, type='{self.event_type}', decision_id={self.decision_id})>"
