from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from core import models

class AnalyticsService:
    """Analytics and metrics for decisions."""

    @staticmethod
    def get_decision_metrics(db: Session, decision_id: int):
        """Get metrics for a single decision."""
        decision = db.query(models.Decision).filter(
            models.Decision.id == decision_id,
            models.Decision.is_active == True
        ).first()

        if not decision:
            return None

        events = db.query(models.Event).filter(
            models.Event.decision_id == decision_id
        ).all()

        return {
            "decision_id": decision_id,
            "title": decision.title,
            "created_at": decision.created_at,
            "event_count": len(events),
            "event_types": AnalyticsService._count_event_types(events),
            "days_active": AnalyticsService._days_since(decision.created_at),
            "last_update": max([e.created_at for e in events], default=decision.created_at)
        }

    @staticmethod
    def get_all_decisions_metrics(db: Session):
        """Get aggregate metrics for all decisions."""
        decisions = db.query(models.Decision).filter(
            models.Decision.is_active == True
        ).all()

        total_events = db.query(func.count(models.Event.id)).scalar() or 0

        decision_metrics = []
        for d in decisions:
            events = db.query(models.Event).filter(
                models.Event.decision_id == d.id
            ).all()
            decision_metrics.append({
                "id": d.id,
                "title": d.title,
                "event_count": len(events),
                "created_at": d.created_at
            })

        return {
            "total_decisions": len(decisions),
            "total_events": total_events,
            "avg_events_per_decision": round(total_events / len(decisions), 1) if decisions else 0,
            "decisions": sorted(decision_metrics, key=lambda x: x['event_count'], reverse=True)
        }

    @staticmethod
    def get_event_type_distribution(db: Session):
        """Get distribution of event types."""
        result = db.query(
            models.Event.event_type,
            func.count(models.Event.id).label('count')
        ).group_by(models.Event.event_type).all()

        return {
            "event_types": [
                {"type": r[0], "count": r[1]} for r in result
            ],
            "total": sum([r[1] for r in result])
        }

    @staticmethod
    def get_decision_timeline_stats(db: Session, days: int = 30):
        """Get decision creation timeline for last N days."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        decisions = db.query(
            func.date(models.Decision.created_at).label('date'),
            func.count(models.Decision.id).label('count')
        ).filter(
            models.Decision.created_at >= cutoff_date
        ).group_by(func.date(models.Decision.created_at)).all()

        return {
            "period_days": days,
            "timeline": [
                {"date": str(d[0]), "decisions_created": d[1]} for d in decisions
            ]
        }

    @staticmethod
    def get_decision_status_summary(db: Session):
        """Get summary of decision statuses."""
        events = db.query(models.Event).all()
        decisions = db.query(models.Decision).filter(
            models.Decision.is_active == True
        ).all()

        # Group by last event type
        decision_status = {}
        for d in decisions:
            last_event = db.query(models.Event).filter(
                models.Event.decision_id == d.id
            ).order_by(desc(models.Event.created_at)).first()

            status = last_event.event_type if last_event else "pending"
            decision_status[d.id] = status

        status_counts = {}
        for status in decision_status.values():
            status_counts[status] = status_counts.get(status, 0) + 1

        return {
            "statuses": status_counts,
            "total_decisions": len(decisions)
        }

    @staticmethod
    def _count_event_types(events):
        """Count event types."""
        counts = {}
        for e in events:
            counts[e.event_type] = counts.get(e.event_type, 0) + 1
        return counts

    @staticmethod
    def _days_since(date):
        """Calculate days since date."""
        return (datetime.utcnow() - date).days
