export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
      <p className="text-gray-500">Site analytics and metrics.</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-400 mb-1">Page Views</p>
          <p className="text-2xl font-bold text-gray-900">45,230</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-400 mb-1">Unique Visitors</p>
          <p className="text-2xl font-bold text-gray-900">12,847</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-400 mb-1">Bounce Rate</p>
          <p className="text-2xl font-bold text-gray-900">34.2%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-400 mb-1">Avg. Session</p>
          <p className="text-2xl font-bold text-gray-900">3m 42s</p>
        </div>
      </div>
    </div>
  );
}