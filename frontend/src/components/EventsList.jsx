import { useDecisionEvents, useDeleteEvent } from '../hooks/useDecisions';

export default function EventsList({ decision_id }) {
  const { data: events = [], isLoading, error } = useDecisionEvents(decision_id);
  const deleteEventMutation = useDeleteEvent();

  if (isLoading) return <div className="text-sm text-gray-500">Loading events...</div>;
  if (error) return <div className="text-sm text-red-600">Error loading events</div>;

  if (events.length === 0) {
    return <div className="text-sm text-gray-400 italic">No events yet</div>;
  }

  return (
    <div className="space-y-2 mb-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-gray-50 rounded p-3 flex justify-between items-start"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                {event.event_type}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(event.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{event.description}</p>
            {event.source && (
              <p className="text-xs text-gray-500 mt-1">Source: {event.source}</p>
            )}
          </div>
          <button
            onClick={() => deleteEventMutation.mutate(event.id)}
            disabled={deleteEventMutation.isPending}
            className="ml-2 text-red-600 hover:text-red-700 text-xs font-medium"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
