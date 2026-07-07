export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto mb-3" />
        <div className="h-5 w-64 bg-gray-200 rounded animate-pulse mx-auto" />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
