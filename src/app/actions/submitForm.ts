'use server';
import { revalidatePath } from 'next/cache';

const API = 'https://63fed78dc5c800a7238698ea.mockapi.io/api/v1/users';

export async function addUserAction(formData: FormData) {
  'use server';
  const name = formData.get('name');
  const email = formData.get('email');

  const response = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email }),
  });

  const newUser = await response.json();
  console.log('New user', newUser);
  revalidatePath('/users-form')
}
