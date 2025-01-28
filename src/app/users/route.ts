/**
 * How this works: Response - Route handler return a Response object. We can customise
 * it as we want.
 * Eg. return new Response('Some message', { status: 200}) OR can return JSON object
 *  return Response.json({ data: 'Some message})
 */

type User = {
  id: number;
  name: string;
  email: string;
}

// replicate data base
export const users: User[] = [
  {
    id: 1,
    name: 'John',
    email: 'john@example.com',
  },
  {
    id: 2,
    name: 'Jane',
    email: 'jane@example.com',
  },
];

// fetch users from user table
export async function GET() {
  return Response.json(users);
}

// add new user to user table
export async function POST(reqeust: Request) {
  const { name, email } = await reqeust.json();
  const newUser = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);

  return new Response(JSON.stringify(newUser), {
    headers: { 'Content-Type': 'application/json' },
    status: 201,
  });
}
