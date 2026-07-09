export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome to your dashboard overview.</p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-400 mb-1">Revenue</p>
          <p className="text-2xl font-bold text-gray-900">$12,430</p>
          <p className="text-sm text-green-600 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-400 mb-1">Orders</p>
          <p className="text-2xl font-bold text-gray-900">342</p>
          <p className="text-sm text-green-600 mt-1">+8% from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-400 mb-1">Customers</p>
          <p className="text-2xl font-bold text-gray-900">1,280</p>
          <p className="text-sm text-green-600 mt-1">+24 new this week</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-400 mb-1">Conversion</p>
          <p className="text-2xl font-bold text-gray-900">3.2%</p>
          <p className="text-sm text-green-600 mt-1">+0.4pp vs last month</p>
        </div>
      </div>

      <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
        Main content renders via <code>children</code> — sidebar renders via <code>@sidebar</code> parallel route
      </div>
    </div>
  );
}
