'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';

const API = process.env.MOCK_API_USERS as string;

// Server Action: addUserAction
// Posts name + email to the mock API, then revalidates the users-form page.
//
// Sentry: wrapped with startSpan instead of withServerActionInstrumentation.
// This is the "traditional" tracing API — it creates a named transaction
// ("addUserAction") with timing and auto error capture, just like the
// server-action-specific wrapper, but without the automatic client→server
// trace linking that withServerActionInstrumentation provides via headers().
// Use this pattern when you don't need distributed tracing or want a simpler
// wrapper for non-server-action contexts.
//
// Unlike withServerActionInstrumentation, startSpan does NOT have the
// redirect() quirk — it only captures real errors, not NEXT_REDIRECT.
export async function addUserAction(formData: FormData) {
  return Sentry.startSpan(
    { name: 'addUserAction', op: 'server-action' },
    async () => {
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
      revalidatePath('/users-form');
    },
  );
}
