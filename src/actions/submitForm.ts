'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

const API = process.env.MOCK_API_USERS as string;

export async function addUserAction(formData: FormData) {
  if (process.env.NODE_ENV === 'production') {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');
  }

  const name = formData.get('name');
  const email = formData.get('email');

  const response = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ first_name: name, email }),
  });

  const newUser = await response.json();
  console.log('New user', newUser);
  revalidatePath('/users-form')
}
