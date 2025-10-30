export default function Header({ apiHealthy }) {
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
              {apiHealthy ? '✓ API Healthy' : '✗ API Down'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
