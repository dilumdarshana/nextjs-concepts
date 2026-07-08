import { NextRequest } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';

// GET uses a direct DB query (no `'use cache'`).
// The listing page caches the HTTP response itself (component-level `'use cache'`),
// so there is no double caching — the page skips the HTTP call entirely.
export async function GET() {
  const all = await db.select().from(products);
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
