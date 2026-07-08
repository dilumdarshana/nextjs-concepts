'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Server Action: deleteProduct
// Intended for <form action={deleteProduct}> — works without JavaScript.
// Takes FormData, reads the product id, deletes from DB,
// then revalidates the cache and redirects to the listing page.
export async function deleteProduct(formData: FormData) {
  const id = Number(formData.get('id'));
  if (Number.isNaN(id)) return;

  await db.delete(products).where(eq(products.id, id));

  // Two ways to invalidate the listing cache (both are called for reference):
  //   1. revalidatePath — clears all cache entries for the given route
  //   2. revalidateTag  — clears only entries tagged with 'products'
  // The matching cacheTag('products') call is in getProducts() in the listing page.
  revalidatePath('/products');
  revalidateTag('products', { expire: 3600 });

  redirect('/products');
}

// Server Action: deleteProductById
// Intended for onClick calls from client components — requires JavaScript.
// Accepts a numeric id directly (no FormData parsing needed).
// Deletes from DB and revalidates, but does NOT redirect — the client
// component handles navigation (router.refresh or router.push).
export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));

  revalidatePath('/products');
  revalidateTag('products', { expire: 3600 });

  // No redirect here — the calling client component decides navigation.
}
