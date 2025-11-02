import { useState } from 'react';
import { useCreateEvent } from '../hooks/useDecisions';

export default function CreateEventForm({ decision_id }) {
  const [eventType, setEventType] = useState('proposed');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const createEventMutation = useCreateEvent();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    createEventMutation.mutate({
      decision_id,
      event_type: eventType,
      description,
      source,
    });

    // Reset form
    setEventType('proposed');
    setDescription('');
    setSource('');
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Event</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="proposed">Proposed</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="implemented">Implemented</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="submit"
            disabled={createEventMutation.isPending || !description.trim()}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createEventMutation.isPending ? 'Adding...' : 'Add'}
          </button>
        </div>

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened? (e.g., 'Reviewed by team')"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Source (optional, e.g., 'team_meeting')"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
    </div>
  );
}
