'use client';
import Counter from "@/components/counter";
import Greet from "@/components/greet";

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Next.js Concepts</h1>
        <p className="text-lg text-gray-500">A demo app exploring Next.js features</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Server Component</h2>
          <Greet />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Component</h2>
          <Counter />
        </div>
      </div>
    </div>
  );
}
