import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import EVENT_TYPES from '../constants/eventTypes';

export default function CreateEventForm({ decision_id, onSuccess }) {
  const [eventType, setEventType] = useState('proposed');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: (eventData) => apiService.createEvent(
      decision_id,
      eventData.event_type,
      eventData.source || null,
      eventData.description || null
    ),
    onSuccess: () => {
      // Reset form
      setEventType('proposed');
      setDescription('');
      setSource('');
      setIsExpanded(false);
      
      // Refetch decisions to update graph
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      
      // Call parent callback if provided
      if (onSuccess) onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventType.trim()) return;

    createEventMutation.mutate({
      event_type: eventType,
      source,
      description,
    });
  };

  // ✅ Generate unique IDs for this form instance
  const formId = `event-form-${decision_id}`;
  const eventTypeId = `event-type-${decision_id}`;
  const descriptionId = `event-description-${decision_id}`;
  const sourceId = `event-source-${decision_id}`;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium"
          aria-label="Add event to decision"
        >
          ➕ Add Event
        </button>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-900 text-sm">Add Event to Decision</h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close event form"
            >
              ✕
            </button>
          </div>

          <form id={formId} onSubmit={handleSubmit} className="space-y-3">
            {/* Event Type Dropdown */}
            <div>
              <label 
                htmlFor={eventTypeId} 
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Event Type *
              </label>
              <select
                id={eventTypeId}
                name="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                required
                aria-label="Event type"
                aria-required="true"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label 
                htmlFor={descriptionId} 
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id={descriptionId}
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened with this event?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                rows="2"
                aria-label="Event description"
              />
            </div>

            {/* Source */}
            <div>
              <label 
                htmlFor={sourceId} 
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Source (e.g., Meeting, Email, Chat)
              </label>
              <input
                type="text"
                id={sourceId}
                name="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Where did this event come from?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                aria-label="Event source"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={createEventMutation.isPending}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                aria-label="Submit event"
              >
                {createEventMutation.isPending ? 'Adding...' : 'Add Event'}
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 text-sm font-medium"
                aria-label="Cancel adding event"
              >
                Cancel
              </button>
            </div>

            {createEventMutation.error && (
              <div 
                role="alert" 
                className="text-red-600 text-xs bg-red-50 p-2 rounded"
              >
                Error: {createEventMutation.error.message}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
