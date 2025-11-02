import { useQuery } from '@tanstack/react-query';
import graphApiService from '../services/graphApi';

export default function AnalyticsDashboard() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: () => graphApiService.getAnalyticsOverview(),
  });

  const { data: eventTypes } = useQuery({
    queryKey: ['eventTypeDistribution'],
    queryFn: () => graphApiService.getEventTypeDistribution(),
  });

  const { data: statusSummary } = useQuery({
    queryKey: ['statusSummary'],
    queryFn: () => graphApiService.getStatusSummary(),
  });

  if (overviewLoading) {
    return <div className="p-4 text-center text-gray-600">Loading analytics...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Decisions */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-700 font-medium">Total Decisions</div>
        <div className="text-3xl font-bold text-blue-900 mt-2">
          {overview?.total_decisions || 0}
        </div>
      </div>

      {/* Total Events */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
        <div className="text-sm text-green-700 font-medium">Total Events</div>
        <div className="text-3xl font-bold text-green-900 mt-2">
          {overview?.total_events || 0}
        </div>
      </div>

      {/* Avg Events per Decision */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
        <div className="text-sm text-purple-700 font-medium">Avg Events/Decision</div>
        <div className="text-3xl font-bold text-purple-900 mt-2">
          {overview?.avg_events_per_decision || 0}
        </div>
      </div>

      {/* Top Status */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
        <div className="text-sm text-orange-700 font-medium">Top Status</div>
        <div className="text-2xl font-bold text-orange-900 mt-2">
          {statusSummary?.statuses 
            ? Object.entries(statusSummary.statuses).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
            : 'N/A'
          }
        </div>
      </div>

      {/* Event Type Distribution */}
      {eventTypes && (
        <div className="col-span-full bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Event Type Distribution</h3>
          <div className="flex flex-wrap gap-3">
            {eventTypes.event_types?.map((et) => (
              <div key={et.type} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-600 font-medium">{et.type}</div>
                  <div className="text-lg font-bold text-gray-900">{et.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Decisions */}
      {overview?.decisions && (
        <div className="col-span-full bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">📊 Decisions by Activity</h3>
          <div className="space-y-2">
            {overview.decisions.slice(0, 5).map((d) => (
              <div key={d.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="text-sm font-medium text-gray-900">{d.title}</div>
                  <div className="text-xs text-gray-500">ID: {d.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{d.event_count}</div>
                  <div className="text-xs text-gray-500">events</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
