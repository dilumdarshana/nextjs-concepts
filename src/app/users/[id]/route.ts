import { users } from '../route';

export async function GET(request: Request, { params }: { params: { id: string }}) {
  const { id } = await params;

  const user = users.find(user => user.id === parseInt(id));

  if (!user) {
    return Response.json({ status: 404, message: 'User not found' });
  }
  return Response.json(user);
}
