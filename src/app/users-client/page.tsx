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

  if (loading) { return <div>Loading...</div> }
  if (error) { return <div>Error: {error}</div> }

  return (
    <ul className="space-y-4 p-4">
      {
        users.map(user => (
          <li
            className="p-4 bg-white rounded-md shadow-md text-gray-700"
            key={user.id}
          >
            {user.name} ({user.email})
          </li>
        ))
      }
    </ul>
  )
};

export default UsersClient;
