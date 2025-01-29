import { auth, currentUser } from '@clerk/nextjs/server';
import { addUserAction } from '../actions/submitForm';

interface User {
  id: number;
  name: string;
  email: string;
}

const API = process.env.MOCK_API_USERS as string;

export default async function UsersForm () {
  const response = await fetch(API);
  const users: User[] = await response.json();

  const authObj = await auth();
  const userObj = await currentUser();

  // console.log('Clerk user', authObj, userObj);

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
