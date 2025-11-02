from sqlalchemy.orm import Session
from . import models
from .neo4j_db import get_neo4j_driver


class GraphService:
    """
    Service for managing temporal knowledge graph in Neo4j.
    Syncs data from PostgreSQL and provides graph queries.
    """
    
    @staticmethod
    def sync_decision_to_graph(db: Session, decision_id: int) -> bool:
        """
        Sync a decision from PostgreSQL to Neo4j graph.
        
        Args:
            db: Database session
            decision_id: Decision ID to sync
            
        Returns:
            True if successful
        """
        try:
            # Get decision from PostgreSQL
            decision = db.query(models.Decision).filter(
                models.Decision.id == decision_id
            ).first()
            
            if not decision:
                return False
            
            # Create/update in Neo4j
            neo4j = get_neo4j_driver()
            neo4j.create_decision_node(
                decision_id=decision.id,
                title=decision.title,
                description=decision.description or ""
            )
            return True
        except Exception as e:
            print(f"Error syncing decision to graph: {e}")
            return False
    
    @staticmethod
    def sync_event_to_graph(db: Session, event_id: int) -> bool:
        """
        Sync an event from PostgreSQL to Neo4j graph.
        Also creates relationship to parent decision.
        
        Args:
            db: Database session
            event_id: Event ID to sync
            
        Returns:
            True if successful
        """
        try:
            # Get event from PostgreSQL
            event = db.query(models.Event).filter(
                models.Event.id == event_id
            ).first()
            
            if not event:
                return False
            
            # Make sure decision exists in graph
            GraphService.sync_decision_to_graph(db, event.decision_id)
            
            # Create/update event in Neo4j
            neo4j = get_neo4j_driver()
            neo4j.create_event_node(
                event_id=event.id,
                decision_id=event.decision_id,
                event_type=event.event_type,
                description=event.description or ""
            )
            return True
        except Exception as e:
            print(f"Error syncing event to graph: {e}")
            return False
    
    @staticmethod
    def get_decision_timeline(decision_id: int) -> list:
        """
        Get decision timeline from Neo4j graph.
        Shows all events in chronological order.
        
        Args:
            decision_id: Decision ID
            
        Returns:
            List of events in temporal order
        """
        try:
            neo4j = get_neo4j_driver()
            results = neo4j.get_decision_timeline(decision_id)
            
            # Format results
            timeline = []
            for record in results:
                timeline.append({
                    "event_id": record["e"]["id"],
                    "event_type": record["e"]["event_type"],
                    "description": record["e"]["description"],
                    "timestamp": record["e"]["created_at"]
                })
            return timeline
        except Exception as e:
            print(f"Error getting timeline: {e}")
            return []
    
    @staticmethod
    def get_related_decisions(decision_id: int) -> list:
        """
        Find decisions related through events (shared stakeholders, similar types, etc).
        
        Args:
            decision_id: Decision ID
            
        Returns:
            List of related decision IDs
        """
        try:
            neo4j = get_neo4j_driver()
            results = neo4j.get_related_decisions(decision_id)
            
            related = []
            for record in results:
                related.append({
                    "decision_id": record["d2"]["id"],
                    "title": record["d2"]["title"],
                    "description": record["d2"]["description"]
                })
            return related
        except Exception as e:
            print(f"Error getting related decisions: {e}")
            return []
    
    @staticmethod
    def get_event_causality_chain(event_id: int) -> dict:
        """
        Get what events/decisions led to this event.
        Shows causality chain for temporal reasoning.
        
        Args:
            event_id: Event ID
            
        Returns:
            Causality chain information
        """
        try:
            neo4j = get_neo4j_driver()
            results = neo4j.get_event_causality(event_id)
            
            causality = {
                "event_id": event_id,
                "chain": []
            }
            
            for record in results:
                causality["chain"].append({
                    "decision_id": record["d"]["id"],
                    "decision_title": record["d"]["title"],
                    "previous_event_id": record["prev_e"]["id"],
                    "previous_event_type": record["prev_e"]["event_type"]
                })
            
            return causality
        except Exception as e:
            print(f"Error getting causality chain: {e}")
            return {"event_id": event_id, "chain": []}
