import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import graphApiService from '../services/graphApi';

export default function AIInsights({ decision_id }) {
  const [activeTab, setActiveTab] = useState('summary');

  // Fetch all AI insights
  const { data: summary } = useQuery({
    queryKey: ['summary', decision_id],
    queryFn: () => graphApiService.getDecisionSummary(decision_id),
    enabled: !!decision_id,
  });

  const { data: risks } = useQuery({
    queryKey: ['risks', decision_id],
    queryFn: () => graphApiService.analyzeDecisionRisks(decision_id),
    enabled: !!decision_id,
  });

  const { data: nextSteps } = useQuery({
    queryKey: ['nextSteps', decision_id],
    queryFn: () => graphApiService.generateNextSteps(decision_id),
    enabled: !!decision_id,
  });

  const { data: quality } = useQuery({
    queryKey: ['quality', decision_id],
    queryFn: () => graphApiService.evaluateDecisionQuality(decision_id),
    enabled: !!decision_id,
  });

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
      <h4 className="font-bold text-purple-900 mb-3">🤖 AI Insights</h4>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {[
          { id: 'summary', label: '📝 Summary', data: summary },
          { id: 'risks', label: '⚠️ Risks', data: risks },
          { id: 'steps', label: '📋 Next Steps', data: nextSteps },
          { id: 'quality', label: '⭐ Quality', data: quality },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={!tab.data}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 disabled:opacity-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white p-3 rounded border border-purple-100 min-h-20">
        {activeTab === 'summary' && summary && (
          <div>
            <p className="text-sm text-gray-700">{summary.summary}</p>
          </div>
        )}

        {activeTab === 'risks' && risks && (
          <div className="space-y-3">
            {risks.analysis?.risks?.length > 0 && (
              <div>
                <div className="font-semibold text-red-700 text-sm mb-2">🚨 Risks:</div>
                <ul className="list-disc list-inside space-y-1">
                  {risks.analysis.risks.map((r, i) => (
                    <li key={i} className="text-sm text-red-600">{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {risks.analysis?.opportunities?.length > 0 && (
              <div>
                <div className="font-semibold text-green-700 text-sm mb-2">💡 Opportunities:</div>
                <ul className="list-disc list-inside space-y-1">
                  {risks.analysis.opportunities.map((o, i) => (
                    <li key={i} className="text-sm text-green-600">{o}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'steps' && nextSteps && (
          <ol className="list-decimal list-inside space-y-1">
            {nextSteps.next_steps?.map((step, i) => (
              <li key={i} className="text-sm text-gray-700">{step}</li>
            ))}
          </ol>
        )}

        {activeTab === 'quality' && quality && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-purple-600">
                {quality.evaluation?.score ?? 0}/10
              </span>
              <span className="text-sm text-gray-600">{quality.evaluation?.reason}</span>
            </div>
            {quality.evaluation?.strengths && (
              <div className="mt-2">
                <div className="font-semibold text-green-700 text-xs mb-1">Strengths:</div>
                <ul className="list-disc list-inside text-xs text-green-600 space-y-0.5">
                  {quality.evaluation.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {quality.evaluation?.improvements && (
              <div className="mt-2">
                <div className="font-semibold text-orange-700 text-xs mb-1">To Improve:</div>
                <ul className="list-disc list-inside text-xs text-orange-600 space-y-0.5">
                  {quality.evaluation.improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
