interface User {
  id: number;
  name: string;
  email: string;
}

export default async function UsersServer () {
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock API request
  const API = process.env.JSON_PLACEHOLDER_USERS as string;

  const response = await fetch(API);
  const users: User[] = await response.json();

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
}
