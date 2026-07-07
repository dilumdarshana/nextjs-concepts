'use server';
import { revalidatePath } from 'next/cache';

const API = process.env.MOCK_API_USERS;

export async function addUserAction(formData: FormData) {
  'use server';
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
