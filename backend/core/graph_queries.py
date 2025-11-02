from neo4j import Session
from datetime import datetime
from typing import List, Dict, Optional

class GraphQueries:
    """Advanced Neo4j graph queries for decision analysis."""

    @staticmethod
    def get_decision_timeline(session: Session, decision_id: int) -> List[Dict]:
        """Get all events for a decision in chronological order."""
        query = """
        MATCH (d:Decision {id: $decision_id})-[:HAS_EVENT]->(e:Event)
        RETURN e.id as event_id, 
               e.event_type as event_type, 
               e.description as description,
               e.timestamp as timestamp,
               e.source as source
        ORDER BY e.timestamp ASC
        """
        result = session.run(query, decision_id=decision_id)
        return [dict(record) for record in result]

    @staticmethod
    def get_related_decisions(session: Session, decision_id: int, depth: int = 2) -> List[Dict]:
        """Find decisions related through shared events or sequential decisions."""
        query = """
        MATCH path = (d1:Decision {id: $decision_id})-[:HAS_EVENT*1..{depth}]-(d2:Decision)
        WHERE d1 <> d2
        WITH d2, path, length(path) as distance
        RETURN DISTINCT d2.id as decision_id, 
                        d2.title as title,
                        d2.description as description,
                        distance,
                        path
        ORDER BY distance ASC
        LIMIT 10
        """.format(depth=depth)
        
        result = session.run(query, decision_id=decision_id)
        return [dict(record) for record in result]

    @staticmethod
    def get_event_causality_chain(session: Session, event_id: int, depth: int = 3) -> Dict:
        """Trace the cause-effect chain of an event."""
        query = """
        MATCH (e:Event {id: $event_id})
        OPTIONAL MATCH (cause:Event)-[:CAUSES]->(e)
        OPTIONAL MATCH (e)-[:CAUSES]->(effect:Event)
        RETURN e.id as event_id,
               e.event_type as event_type,
               e.description as description,
               collect({id: cause.id, type: cause.event_type, desc: cause.description}) as causes,
               collect({id: effect.id, type: effect.event_type, desc: effect.description}) as effects
        """
        result = session.run(query, event_id=event_id)
        record = result.single()
        return dict(record) if record else None

    @staticmethod
    def get_decision_impact(session: Session, decision_id: int) -> Dict:
        """Analyze the impact of a decision across the graph."""
        query = """
        MATCH (d:Decision {id: $decision_id})-[:HAS_EVENT]->(e:Event)
        WITH d, collect(e) as events
        OPTIONAL MATCH (d)-[:HAS_EVENT]->(e1:Event)-[:CAUSES]->(e2:Event)
        OPTIONAL MATCH (d)-[:PREDECESSOR]->(d2:Decision)
        OPTIONAL MATCH (d)-[:SUCCESSOR]->(d3:Decision)
        RETURN d.id as decision_id,
               d.title as title,
               size(events) as event_count,
               count(DISTINCT e2) as downstream_events,
               count(DISTINCT d2) as predecessor_decisions,
               count(DISTINCT d3) as successor_decisions
        """
        result = session.run(query, decision_id=decision_id)
        record = result.single()
        return dict(record) if record else None

    @staticmethod
    def search_decisions_by_pattern(session: Session, pattern: str) -> List[Dict]:
        """Search decisions by title or description pattern."""
        query = """
        MATCH (d:Decision)
        WHERE d.title CONTAINS $pattern OR d.description CONTAINS $pattern
        OPTIONAL MATCH (d)-[:HAS_EVENT]->(e:Event)
        RETURN d.id as decision_id,
               d.title as title,
               d.description as description,
               count(e) as event_count
        LIMIT 20
        """
        result = session.run(query, pattern=pattern)
        return [dict(record) for record in result]

    @staticmethod
    def get_decision_stats() -> Dict:
        """Get overall graph statistics."""
        from core.neo4j_db import get_neo4j_driver
        driver = get_neo4j_driver()
        
        with driver.session() as session:
            decisions = session.run("MATCH (d:Decision) RETURN count(d) as count").single()["count"]
            events = session.run("MATCH (e:Event) RETURN count(e) as count").single()["count"]
            relationships = session.run("MATCH ()-[r:HAS_EVENT]->() RETURN count(r) as count").single()["count"]
            
        return {
            "decisions": decisions,
            "events": events,
            "relationships": relationships
        }
