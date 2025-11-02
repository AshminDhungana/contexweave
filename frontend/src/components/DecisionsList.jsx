import { useState } from 'react';
import { useDecisionEvents } from '../hooks/useDecisions';
import EventsList from './EventsList';
import CreateEventForm from './CreateEventForm';
import GraphVisualization from './GraphVisualization';

export default function DecisionsList({ decisions }) {
  const [expandedGraphs, setExpandedGraphs] = useState([]);

  const toggleGraph = (decision_id) => {
    setExpandedGraphs((prev) =>
      prev.includes(decision_id)
        ? prev.filter((id) => id !== decision_id)
        : [...prev, decision_id]
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Decisions</h2>
      {decisions.map((decision) => (
        <div
          key={decision.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">{decision.title}</h3>
          {decision.description && (
            <p className="text-gray-600 mt-2">{decision.description}</p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            ID: {decision.id}
          </div>

          {/* ✨ NEW: Events section with graph */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">Timeline Events</h4>
              <button
                onClick={() => toggleGraph(decision.id)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {expandedGraphs.includes(decision.id) ? '📊 Hide Graph' : '📊 Show Graph'}
              </button>
            </div>

            {/* Graph Visualization */}
            {expandedGraphs.includes(decision.id) && (
              <div className="mb-4">
                <GraphVisualization decision_id={decision.id} />
              </div>
            )}

            {/* Events List */}
            <EventsList decision_id={decision.id} />
            <CreateEventForm decision_id={decision.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
