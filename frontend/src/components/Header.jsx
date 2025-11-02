import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

export default function Header() {
  const [apiHealthy, setApiHealthy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          const data = await response.json();
          setApiHealthy(data.database === 'healthy');
        } else {
          setApiHealthy(false);
        }
      } catch (error) {
        console.error('Health check failed:', error);
        setApiHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    // Check every 5 seconds
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ContextWeave</h1>
            <p className="text-gray-600 mt-1">Temporal Knowledge Graph Platform</p>
          </div>
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              apiHealthy 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {loading ? '⏳ Checking...' : (apiHealthy ? '✓ API Healthy' : '✗ API Down')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
