import { NextRequest } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';

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
