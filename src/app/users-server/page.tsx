import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users (Server)',
  description: 'Server-side data fetching with JSONPlaceholder',
};

interface User {
  id: number;
  name: string;
  email: string;
}

async function getUsers(): Promise<User[]> {
  const API = process.env.JSON_PLACEHOLDER_USERS;

  if (!API || API === 'xxx') return [];

  const response = await fetch(API, { cache: 'no-store' });

  if (!response.ok) return [];

  return response.json();
}

export default async function UsersServer() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Users</h1>
        <p className="text-lg text-gray-500">Server-side data fetching</p>
      </section>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No users found. Set <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">JSON_PLACEHOLDER_USERS</code> in your .env file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 mb-3">
                {user.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
