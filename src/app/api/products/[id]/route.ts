import { getProductById } from '@/lib/api';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET reuses the cached getProductById from the shared lib.
// Each product ID has its own cache entry shared with the product detail page.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    return Response.json({ error: 'not found' }, { status: 404 });
  }

  return Response.json(product);
}

// DELETE removes a product from the database directly (no cache).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) {
    return Response.json({ error: 'invalid id' }, { status: 400 });
  }

  await db.delete(products).where(eq(products.id, numId));
  return Response.json({ success: true });
}
