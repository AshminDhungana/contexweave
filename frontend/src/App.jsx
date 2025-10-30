import { useEffect, useState } from 'react';
import { apiService } from './services/api';
import { useAppStore } from './store/appStore';
import DecisionsList from './components/DecisionsList';
import CreateDecisionForm from './components/CreateDecisionForm';
import Header from './components/Header';

function App() {
  const { decisions, setDecisions, loading, setLoading } = useAppStore();
  const [apiHealthy, setApiHealthy] = useState(false);

  useEffect(() => {
    // Check API health
    const checkHealth = async () => {
      try {
        const health = await apiService.getHealth();
        setApiHealthy(health.status === 'healthy');
      } catch (error) {
        console.error('API not available:', error);
        setApiHealthy(false);
      }
    };

    checkHealth();

    // Load decisions
    const loadDecisions = async () => {
      setLoading(true);
      try {
        const data = await apiService.getDecisions();
        setDecisions(data.decisions || []);
      } catch (error) {
        console.error('Failed to load decisions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDecisions();
  }, [setDecisions, setLoading]);

return (
  <div className="min-h-screen w-full flex flex-col bg-gray-50">
    <Header apiHealthy={apiHealthy} />
    
    <main className="flex-1 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Create Decision Form - Left Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <CreateDecisionForm />
            </div>
          </div>

          {/* Decisions List - Right Column */}
          <div className="lg:col-span-2">
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading decisions...</p>
                  </div>
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
                <DecisionsList decisions={decisions} />
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
