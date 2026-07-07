'use client';
import { useRouter } from 'next/navigation';

const About = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">About</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          This is a demo project built with Next.js to explore modern React patterns,
          routing, authentication, and data fetching.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'App Router', desc: 'File-based routing with layouts, nested routes, and loading states.' },
          { title: 'Server Components', desc: 'React Server Components for reduced client-side JavaScript.' },
          { title: 'Authentication', desc: 'Clerk integration for authentication and user management.' },
        ].map(({ title, desc }) => (
          <div key={title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm">{desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default About;
