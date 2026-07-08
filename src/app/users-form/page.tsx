import type { Metadata } from 'next';
import { auth, currentUser } from '@clerk/nextjs/server';
import { addUserAction } from '@/actions/submitForm';

export const metadata: Metadata = {
  title: 'Users (Form)',
  description: 'Server action form with Clerk authentication',
};

interface User {
  id: number;
  first_name: string;
  email: string;
}

export const dynamic = 'force-dynamic';

async function getUsers(): Promise<User[]> {
  const API = process.env.MOCK_API_USERS;
  if (!API || API === 'xxx') return [];

  try {
    const response = await fetch(API, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function UsersForm() {
  const users = await getUsers();
  const clerkAuth = await auth();
  const user = await currentUser();

  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Users</h1>
        <p className="text-lg text-gray-500">Manage users with a server action form</p>
      </section>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg mx-auto">
        <h2 className="font-semibold text-gray-900 mb-4">Add User</h2>
        <form className="space-y-4" action={addUserAction}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Add User
          </button>
        </form>
      </div>

      {clerkAuth.userId && user && (
        <div className="text-center text-sm text-gray-400">
          Signed in as <span className="font-medium text-gray-600">{user.emailAddresses[0]?.emailAddress}</span>
        </div>
      )}

      {users.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 mb-3">
                  {user.first_name?.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900">{user.first_name}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
