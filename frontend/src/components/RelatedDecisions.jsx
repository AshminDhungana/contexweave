import { useQuery } from '@tanstack/react-query';
import graphApiService from '../services/graphApi';

export default function RelatedDecisions({ decision_id }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['relatedDecisions', decision_id],
    queryFn: () => graphApiService.getRelatedDecisions(decision_id),
    enabled: !!decision_id,
  });

  if (isLoading) return <div className="text-sm text-gray-600">Loading related decisions...</div>;
  if (error) return <div className="text-sm text-red-600">Error loading related decisions</div>;
  if (!data?.related_decisions?.length) return <div className="text-sm text-gray-500">No related decisions found</div>;

  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <h5 className="font-semibold text-blue-900 text-sm mb-2">🔗 Related Decisions ({data.count})</h5>
      <div className="space-y-2">
        {data.related_decisions.map((d) => (
          <div key={d.decision_id} className="text-sm p-2 bg-white rounded border border-blue-100">
            <div className="font-medium text-gray-900">{d.title}</div>
            {d.description && <div className="text-gray-600 text-xs mt-1">{d.description}</div>}
            <div className="text-xs text-gray-500 mt-1">Distance: {d.distance}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
