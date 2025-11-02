import { useState } from 'react';
import { useDecisions, useCreateDecision, useDeleteDecision } from './hooks/useDecisions';
import Header from './components/Header';
import GraphVisualization from './components/GraphVisualization';
import CreateEventForm from './components/CreateEventForm';
import RelatedDecisions from './components/RelatedDecisions';


function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [expandedGraphs, setExpandedGraphs] = useState(new Set());

  // Fetch decisions from database
  const { data: decisions = [], isLoading, error } = useDecisions();
  
  // Create decision mutation
  const createMutation = useCreateDecision();
  
  // Delete decision mutation
  const deleteMutation = useDeleteDecision();

  // Handle create
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      title,
      description: description || null,
      context: context || null,
    });

    // Clear form
    setTitle('');
    setDescription('');
    setContext('');
  };

  // Handle delete
  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const toggleGraph = (decisionId) => {
    const newSet = new Set(expandedGraphs);
    if (newSet.has(decisionId)) {
      newSet.delete(decisionId);
    } else {
      newSet.add(decisionId);
    }
    setExpandedGraphs(newSet);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Create Decision Form - Left Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h2 className="text-xl font-bold mb-4">Create Decision</h2>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        placeholder="Decision title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="What is this about?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
                      <input
                        type="text"
                        placeholder="Where applies?"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createMutation.isPending ? 'Creating...' : 'Create'}
                    </button>
                    {createMutation.error && (
                      <div className="text-red-600 text-sm">Error: {createMutation.error.message}</div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Decisions List - Right Column */}
            <div className="lg:col-span-2">
              <div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading decisions...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-red-700">
                    Error loading decisions
                  </div>
                ) : decisions.length === 0 ? (
                  <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 text-lg font-medium">No decisions yet</p>
                    <p className="text-gray-500 mt-1">Create one to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {decisions.map((decision) => (
                      <div key={decision.id} className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{decision.title}</h3>
                            {decision.description && <p className="text-gray-600 text-sm mt-1">{decision.description}</p>}
                            {decision.context && <p className="text-gray-500 text-xs mt-1">Context: {decision.context}</p>}
                            <p className="text-xs text-gray-400 mt-2">Created: {new Date(decision.created_at).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(decision.id)}
                            disabled={deleteMutation.isPending}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>

                        {/* Graph Toggle Button */}
                        <div className="border-t pt-3">
                          <button
                            onClick={() => toggleGraph(decision.id)}
                            className="text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                          >
                            {expandedGraphs.has(decision.id) ? '📊 Hide Timeline' : '📊 Show Timeline'}
                          </button>

                          {/* Timeline Graph */}
                          {expandedGraphs.has(decision.id) && (
                            <div className="mt-3 mb-4">
                              <GraphVisualization decision_id={decision.id} />
                              <RelatedDecisions decision_id={decision.id} />
                            </div>
                          )}
                          {/* Create Event Form */}
                          <CreateEventForm decision_id={decision.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
