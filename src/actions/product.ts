'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { captureException } from '@sentry/nextjs';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
export async function deleteProduct(formData: FormData) {
  try {
    await requireAuth();

    const id = Number(formData.get('id'));
    if (Number.isNaN(id)) return;

    await db.delete(products).where(eq(products.id, id));

    // Two ways to invalidate the listing cache (both are called for reference):
    //   1. revalidatePath — clears all cache entries for the given route
    //   2. revalidateTag  — clears only entries tagged with 'products'
    // The matching cacheTag('products') call is in getProducts() in the listing page.
    revalidatePath('/products');
    revalidateTag('products', { expire: 3600 });
  } catch (error) {
    captureException(error);
    throw error;
  }

  redirect('/products');
}

// Server Action: deleteProductById
// Intended for onClick calls from client components — requires JavaScript.
// Accepts a numeric id directly (no FormData parsing needed).
// Deletes from DB and revalidates, but does NOT redirect — the client
// component handles navigation (router.refresh or router.push).
export async function deleteProductById(id: number) {
  try {
    await requireAuth();

    await db.delete(products).where(eq(products.id, id));

    revalidatePath('/products');
    revalidateTag('products', { expire: 3600 });
  } catch (error) {
    captureException(error);
    throw error;
  }

  // No redirect here — the calling client component decides navigation.
}
