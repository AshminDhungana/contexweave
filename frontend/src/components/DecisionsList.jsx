export default function DecisionsList({ decisions }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Decisions</h2>
      {decisions.map((decision) => (
        <div
          key={decision.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">{decision.title}</h3>
          {decision.description && (
            <p className="text-gray-600 mt-2">{decision.description}</p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            ID: {decision.id}
          </div>
        </div>
      ))}
    </div>
  );
}
