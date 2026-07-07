import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);

  if (Number.isNaN(numId)) {
    return Response.json({ error: 'invalid id' }, { status: 400 });
  }

  const [product] = await db.select().from(products).where(eq(products.id, numId));

  if (!product) {
    return Response.json({ error: 'not found' }, { status: 404 });
  }

  return Response.json(product);
}
