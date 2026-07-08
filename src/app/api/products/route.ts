import { NextRequest } from 'next/server';
import { getProducts } from '@/lib/api';
import { db } from '@/db';
import { products } from '@/db/schema';

// GET reuses the cached getProducts from the shared lib.
// The `'use cache'` directive inside that function means the DB result is cached
// for 30 seconds — the same cache the products page uses.
export async function GET() {
  const all = await getProducts();
  return Response.json(all);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, price } = body;

  if (!name || price == null) {
    return Response.json(
      { error: 'name and price are required' },
      { status: 400 },
    );
  }

  const [product] = await db.insert(products).values({ name, price }).returning();
  return Response.json(product, { status: 201 });
}
