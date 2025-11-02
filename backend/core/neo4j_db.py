from neo4j import GraphDatabase
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Neo4j connection settings
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

def _init_neo4j_driver():
    """Initialize driver with environment variables"""
    uri = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
    user = os.getenv("NEO4J_USER", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "password")
    
    print(f"[NEO4J] Connecting to: {uri}")
    print(f"[NEO4J] User: {user}")
    
    return GraphDatabase.driver(uri, auth=(user, password))

class Neo4jDriver:
    """
    Neo4j Graph Database connection manager.
    Handles graph queries for temporal relationships.
    """
    
    def __init__(self):
        self.driver = _init_neo4j_driver()
    
    def close(self):
        """Close the Neo4j connection"""
        self.driver.close()
    
    def execute_query(self, query: str, parameters: dict = None):
        """
        Execute a Cypher query and return results.
        
        Args:
            query: Cypher query string
            parameters: Query parameters
            
        Returns:
            Query results
        """
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return result.data()
    
    def create_decision_node(self, decision_id: int, title: str, description: str):
        """
        Create a Decision node in Neo4j.
        
        Args:
            decision_id: Decision ID from PostgreSQL
            title: Decision title
            description: Decision description
        """
        query = """
        MERGE (d:Decision {id: $decision_id})
        SET d.title = $title,
            d.description = $description,
            d.created_at = timestamp()
        RETURN d
        """
        return self.execute_query(query, {
            "decision_id": decision_id,
            "title": title,
            "description": description
        })
    
    def create_event_node(self, event_id: int, decision_id: int, event_type: str, description: str):
        """
        Create an Event node and link to Decision.
        
        Args:
            event_id: Event ID from PostgreSQL
            decision_id: Parent Decision ID
            event_type: Type of event
            description: Event description
        """
        query = """
        MERGE (e:Event {id: $event_id})
        SET e.event_type = $event_type,
            e.description = $description,
            e.created_at = timestamp()
        
        WITH e
        MATCH (d:Decision {id: $decision_id})
        MERGE (d)-[rel:HAS_EVENT]->(e)
        SET rel.created_at = timestamp()
        
        RETURN e, d, rel
        """
        return self.execute_query(query, {
            "event_id": event_id,
            "decision_id": decision_id,
            "event_type": event_type,
            "description": description
        })
    
    def get_decision_timeline(self, decision_id: int):
        """
        Get all events for a decision in chronological order (temporal timeline).
        
        Args:
            decision_id: Decision ID
            
        Returns:
            Ordered list of events
        """
        query = """
        MATCH (d:Decision {id: $decision_id})-[rel:HAS_EVENT]->(e:Event)
        RETURN d, e, rel
        ORDER BY e.created_at ASC
        """
        return self.execute_query(query, {"decision_id": decision_id})
    
    def get_related_decisions(self, decision_id: int):
        """
        Find decisions that are related through events or dependencies.
        
        Args:
            decision_id: Decision ID
            
        Returns:
            List of related decisions
        """
        query = """
        MATCH (d1:Decision {id: $decision_id})-[rel]->(e:Event)
        MATCH (e)<-[rel2]-(d2:Decision)
        WHERE d1.id <> d2.id
        RETURN DISTINCT d2
        LIMIT 10
        """
        return self.execute_query(query, {"decision_id": decision_id})
    
    def get_event_causality(self, event_id: int):
        """
        Find what decisions/events caused this event.
        
        Args:
            event_id: Event ID
            
        Returns:
            Causality chain
        """
        query = """
        MATCH (e:Event {id: $event_id})<-[rel1]-(d:Decision)-[rel2]->(prev_e:Event)
        RETURN d, prev_e, rel1, rel2
        ORDER BY prev_e.created_at DESC
        """
        return self.execute_query(query, {"event_id": event_id})


# Global Neo4j driver instance
neo4j_driver: Optional[Neo4jDriver] = None

def get_neo4j_driver() -> Neo4jDriver:
    """Get or create Neo4j driver instance"""
    global neo4j_driver
    if neo4j_driver is None:
        neo4j_driver = Neo4jDriver()
    return neo4j_driver

def close_neo4j():
    """Close Neo4j connection"""
    global neo4j_driver
    if neo4j_driver:
        neo4j_driver.close()
