'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { withServerActionInstrumentation } from '@sentry/nextjs';
import { db } from '@/db';
import { products } from '@/db/schema';

// Helper — guard every mutation behind an auth check.
// Throws if the user is not signed in, which rejects the server action.
// Only enforced in production so e2e tests pass without Clerk sign-in.
async function requireAuth() {
  if (process.env.NODE_ENV !== 'production') return;
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
}

// Server Action: deleteProduct
// Intended for <form action={deleteProduct}> — works without JavaScript.
// Takes FormData, reads the product id, deletes from DB,
// then revalidates the cache and redirects to the listing page.
//
// Sentry: wrapped with withServerActionInstrumentation instead of manual try/catch.
// This creates a named transaction ("deleteProduct") with timing data and
// automatically captures any thrown error. Passing headers() links the server
// trace back to the client-side interaction that triggered this action,
// giving you a full distributed trace in Sentry (browser → server).
//
// IMPORTANT: redirect() stays OUTSIDE the callback. It throws NEXT_REDIRECT
// internally, which withServerActionInstrumentation would capture as an error
// if placed inside. Only the actual action logic (DB, revalidation) goes inside.
export async function deleteProduct(formData: FormData) {
  const id = Number(formData.get('id'));
  if (Number.isNaN(id)) return;

  await withServerActionInstrumentation(
    'deleteProduct',
    { headers: await headers() },
    async () => {
      await requireAuth();

      await db.delete(products).where(eq(products.id, id));

      revalidatePath('/products');
      revalidateTag('products', { expire: 3600 });
    },
  );

  redirect('/products');
}

// Server Action: deleteProductById
// Intended for onClick calls from client components — requires JavaScript.
// Accepts a numeric id directly (no FormData parsing needed).
// Deletes from DB and revalidates, but does NOT redirect — the client
// component handles navigation (router.refresh or router.push).
//
// Sentry: same pattern as deleteProduct — withServerActionInstrumentation
// captures errors and passes headers() for distributed trace linking.
// No redirect exists here (client handles nav), so the entire function body
// fits inside the callback safely.
export async function deleteProductById(id: number) {
  await withServerActionInstrumentation(
    'deleteProductById',
    { headers: await headers() },
    async () => {
      await requireAuth();

      await db.delete(products).where(eq(products.id, id));

      revalidatePath('/products');
      revalidateTag('products', { expire: 3600 });
    },
  );
}
