export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Product {id}</h1>
        <p className="text-lg text-gray-500">Details for product #{id}</p>
      </section>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg mx-auto">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Product ID</span>
            <span className="font-mono text-sm font-medium text-gray-900">{id}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Name</span>
            <span className="text-sm font-medium text-gray-900">Product {id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Price</span>
            <span className="text-sm font-medium text-gray-900">$29.99</span>
          </div>
        </div>
      </div>
    </div>
  );
}
