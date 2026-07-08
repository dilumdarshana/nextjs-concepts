'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Create product

// Update product

// Delete product
export async function deleteProduct(formData: FormData) {
  const id = Number(formData.get('id'));
  if (Number.isNaN(id)) return;

  await db.delete(products).where(eq(products.id, id));
  revalidatePath('/products');
  redirect('/products');
}
