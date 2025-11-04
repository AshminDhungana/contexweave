import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
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
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="hover:opacity-80 transition">
            <h1 className="text-3xl font-bold text-gray-900">ContextWeave</h1>
            <p className="text-gray-600 text-sm">Temporal Knowledge Graph Platform</p>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-8 mx-8">
            <Link 
              to="/decisions"
              className="text-gray-700 hover:text-blue-600 font-medium transition flex items-center gap-2"
            >
              🏠 Decisions
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition flex items-center gap-2"
                >
                  📊 Analytics
                </Link>
                
                {/*  Admin Panel Link */}
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-red-600 hover:text-red-800 font-bold transition flex items-center gap-2"
                  >
                    🔐 Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side: Auth Status + Health */}
          <div className="flex items-center gap-4">
            {/* Health Status */}
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              apiHealthy 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {loading ? '⏳ Checking...' : (apiHealthy ? '✓ API Healthy' : '✗ API Down')}
            </span>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">
                  👤 <strong>{user?.username}</strong>
                  {/* ✨ Show admin badge if admin */}
                  {user?.role === 'admin' && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-bold">
                      ADMIN
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
