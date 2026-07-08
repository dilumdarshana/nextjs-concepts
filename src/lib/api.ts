// Shared API layer — both pages and route handlers import from here.
// The `'use cache'` directive caches the DB result so all callers share the same cache entry.

import { cacheLife } from 'next/cache';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface Product {
  id: number;
  name: string;
  price: number;
}

// getProducts is a plain DB query (no `'use cache'`).
// The listing page handles caching itself via component-level `'use cache'`.
export async function getProducts(): Promise<Product[]> {
  return db.select().from(products);
}

// Same pattern — each product ID has its own cache entry.
// If called with id "5" from two different places, both share the cached result.
export async function getProductById(id: string): Promise<Product | null> {
  'use cache';
  cacheLife({ stale: 30 });

  const numId = Number(id);
  if (Number.isNaN(numId)) return null;

  const [product] = await db.select().from(products).where(eq(products.id, numId));
  return product || null;
}
