export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mx-auto mb-3" />
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
      </section>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg mx-auto">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
