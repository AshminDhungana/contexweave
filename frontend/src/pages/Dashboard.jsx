import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Analytics Dashboard</h1>
        <p className="text-gray-600 mb-8">Overview of your decisions and events</p>
        
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
