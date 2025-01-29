import { addUserAction } from '../actions/submitForm';

interface User {
  id: number;
  name: string;
  email: string;
}

const API = 'https://63fed78dc5c800a7238698ea.mockapi.io/api/v1/users';

export default async function UsersForm () {
  const response = await fetch(API);
  const users: User[] = await response.json();

  return (
    <div className="py-10">
      <form className="mb-10" action={addUserAction}>
        <input className="border rounded p-2 mr-2" type="text" name="name" required />
        <input className="border rounded p-2 mr-2" type="email" name="email" required />
        <button className="bg-blue-500 rounded px-4 py-2" type="submit">Add User</button>
      </form>
      <div className="grid grid-cols-4 gap-4 py-10">
      {
        users.map(user => (
          <div
            className="p-4 bg-white rounded-md shadow-md text-gray-700"
            key={user.id}
          >
            {user.name} ({user.email})
          </div>
        ))
      }
      </div>
    </div>
  )
}
