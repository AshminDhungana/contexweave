from sqlalchemy.orm import Session
from . import models, schemas


class DecisionService:
    """
    Business logic for Decision operations.
    Handles all CRUD operations on decisions.
    """
    
    @staticmethod
    def create_decision(db: Session, decision: schemas.DecisionCreate) -> models.Decision:
        """
        Create a new decision in the database.
        
        Args:
            db: Database session
            decision: Decision data from schema
            
        Returns:
            Created Decision object
        """
        db_decision = models.Decision(
            title=decision.title,
            description=decision.description,
            context=decision.context
        )
        db.add(db_decision)
        db.commit()
        db.refresh(db_decision)
        return db_decision
    
    
    @staticmethod
    def get_decision(db: Session, decision_id: int) -> models.Decision:
        """
        Retrieve a single decision by ID.
        Only returns active decisions.
        
        Args:
            db: Database session
            decision_id: The decision's ID
            
        Returns:
            Decision object or None if not found
        """
        return db.query(models.Decision).filter(
            models.Decision.id == decision_id,
            models.Decision.is_active == True
        ).first()
    
    
    @staticmethod
    def get_all_decisions(
        db: Session, 
        skip: int = 0, 
        limit: int = 10
    ) -> list[models.Decision]:
        """
        Retrieve all active decisions with pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip (for pagination)
            limit: Maximum records to return
            
        Returns:
            List of Decision objects
        """
        return db.query(models.Decision).filter(
            models.Decision.is_active == True
        ).offset(skip).limit(limit).all()
    
    
    @staticmethod
    def update_decision(
        db: Session, 
        decision_id: int, 
        decision: schemas.DecisionUpdate
    ) -> models.Decision:
        """
        Update an existing decision.
        Only updates provided fields (partial update).
        
        Args:
            db: Database session
            decision_id: The decision's ID
            decision: New data for the decision
            
        Returns:
            Updated Decision object or None if not found
        """
        # Find the decision
        db_decision = DecisionService.get_decision(db, decision_id)
        if not db_decision:
            return None
        
        # Update only provided fields
        update_data = decision.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_decision, field, value)
        
        # Save to database
        db.add(db_decision)
        db.commit()
        db.refresh(db_decision)
        return db_decision
    
    
    @staticmethod
    def delete_decision(db: Session, decision_id: int) -> bool:
        """
        Soft delete a decision (mark as inactive).
        Does not remove from database, just marks is_active=False.
        
        Args:
            db: Database session
            decision_id: The decision's ID
            
        Returns:
            True if deleted, False if not found
        """
        db_decision = DecisionService.get_decision(db, decision_id)
        if not db_decision:
            return False
        
        # Soft delete - mark as inactive
        db_decision.is_active = False
        db.add(db_decision)
        db.commit()
        return True


class EventService:
    """
    Business logic for Event operations.
    Handles all CRUD operations on events.
    """
    
    @staticmethod
    def create_event(db: Session, event: schemas.EventCreate) -> models.Event:
        """
        Create a new event in the database.
        
        Args:
            db: Database session
            event: Event data from schema
            
        Returns:
            Created Event object
        """
        db_event = models.Event(
            decision_id=event.decision_id,
            event_type=event.event_type,
            source=event.source,
            description=event.description
        )
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
    
    
    @staticmethod
    def get_events(
        db: Session, 
        skip: int = 0, 
        limit: int = 10
    ) -> list[models.Event]:
        """
        Retrieve all events with pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip (for pagination)
            limit: Maximum records to return
            
        Returns:
            List of Event objects
        """
        return db.query(models.Event).offset(skip).limit(limit).all()
    
    
    @staticmethod
    def get_recent_events(
        db: Session, 
        limit: int = 10
    ) -> list[models.Event]:
        """
        Retrieve the most recent events.
        Ordered by created_at descending.
        
        Args:
            db: Database session
            limit: Maximum records to return
            
        Returns:
            List of Event objects ordered by newest first
        """
        return db.query(models.Event).order_by(
            models.Event.created_at.desc()
        ).limit(limit).all()
    
    @staticmethod
    def get_events_by_decision(
        db: Session, 
        decision_id: int,
        skip: int = 0, 
        limit: int = 50
    ) -> list[models.Event]:
        """
        Retrieve all events for a specific decision.
        Ordered by created_at (oldest to newest).
        
        Args:
            db: Database session
            decision_id: The decision's ID
            skip: Number of records to skip (for pagination)
            limit: Maximum records to return
            
        Returns:
            List of Event objects for this decision
        """
        return db.query(models.Event).filter(
            models.Event.decision_id == decision_id
        ).order_by(models.Event.created_at).offset(skip).limit(limit).all()

