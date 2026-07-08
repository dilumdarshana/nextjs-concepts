import { getProductById } from '@/lib/api';

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
