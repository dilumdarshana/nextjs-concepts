import { NextRequest } from 'next/server';
import { users } from '../route';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = users.find(user => user.id === parseInt(id));

  if (!user) {
    return Response.json({ status: 404, message: 'User not found' });
  }
  return Response.json(user);
}
