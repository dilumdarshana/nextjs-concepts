'use client';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

const UsersClient = () => {
  const [users, setUsers] = useState<User[]>([]);
  const[loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        setUsers(users);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-medium mb-2">Failed to load users</p>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Users</h1>
        <p className="text-lg text-gray-500">Client-side data fetching</p>
      </section>

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
    </div>
  )
};

export default UsersClient;
