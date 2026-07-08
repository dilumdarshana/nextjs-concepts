'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Create product

// Update product

// Delete product (from <form> — progressive enhancement, works without JS)
export async function deleteProduct(formData: FormData) {
  const id = Number(formData.get('id'));
  if (Number.isNaN(id)) return;

  await db.delete(products).where(eq(products.id, id));
  revalidatePath('/products');
  revalidateTag('products', { expire: 3600 });
  redirect('/products');
}

// Delete product (from onClick — JS required, no FormData needed)
export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath('/products');
  revalidateTag('products', { expire: 3600 });
}
