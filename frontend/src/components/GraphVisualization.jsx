import { useEffect, useState } from 'react';
import graphApiService from '../services/graphApi';

export default function GraphVisualization({ decision_id }) {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!decision_id) return;

    const loadTimeline = async () => {
      try {
        setLoading(true);
        const data = await graphApiService.getDecisionTimeline(decision_id);
        setTimeline(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, [decision_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        Error: {error}
      </div>
    );
  }

  if (!timeline || !timeline.timeline || timeline.timeline.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-sm">
        No events in timeline
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4 pb-4 border-b">
        <h4 className="font-semibold text-gray-900 text-sm">Decision: {timeline.decision_title}</h4>
        <p className="text-xs text-gray-500 mt-1">({timeline.event_count} events)</p>
      </div>

      {/* Timeline Visualization */}
      <div className="space-y-4">
        {timeline.timeline.map((event, index) => (
          <div key={event.event_id} className="flex gap-4">
            {/* Timeline Dot and Line */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-blue-100"></div>
              {index < timeline.timeline.length - 1 && (
                <div className="w-1 h-12 bg-blue-200 mt-2"></div>
              )}
            </div>

            {/* Event Card */}
            <div className="flex-1 pb-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-1 bg-blue-200 text-blue-900 rounded text-xs font-semibold">
                      {event.event_type}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mt-2">{event.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 pt-4 border-t text-xs text-gray-600">
        <p>✓ Timeline generated from Neo4j graph</p>
        <p>✓ {timeline.event_count} events in chronological order</p>
      </div>
    </div>
  );
}

