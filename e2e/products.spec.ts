import { test, expect } from '@playwright/test';

test.describe('products API', () => {
  test('POST and GET a product', async ({ request }) => {
    const created = await request.post('/api/products', {
      data: { name: 'E2E Product', price: 42.99 },
    });
    expect(created.ok()).toBeTruthy();
    const body = await created.json();
    expect(body.name).toBe('E2E Product');
    expect(body.price).toBe(42.99);
    expect(body.id).toBeGreaterThan(0);

    const all = await request.get('/api/products');
    const products = await all.json();
    expect(products.length).toBeGreaterThanOrEqual(1);
  });

  test('GET single product returns 404 for missing', async ({ request }) => {
    const res = await request.get('/api/products/999999');
    expect(res.status()).toBe(404);
  });

  test('POST rejects missing fields', async ({ request }) => {
    const res = await request.post('/api/products', { data: {} });
    expect(res.status()).toBe(400);
  });

  test('DELETE removes a product', async ({ request }) => {
    const created = await request.post('/api/products', {
      data: { name: 'Delete Me', price: 10 },
    });
    const product = await created.json();
    expect(product.id).toBeGreaterThan(0);

    const del = await request.delete(`/api/products/${product.id}`);
    expect(del.ok()).toBeTruthy();

    const get = await request.get(`/api/products/${product.id}`);
    expect(get.status()).toBe(404);
  });
});

test.describe('products UI', () => {
  test('listing page shows products', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('product detail shows name and price', async ({ page, request }) => {
    const created = await request.post('/api/products', {
      data: { name: 'Detail Test', price: 9.99 },
    });
    const product = await created.json();

    await page.goto(`/products/${product.id}`);
    await expect(page.getByRole('heading', { name: 'Detail Test' })).toBeVisible();
    await expect(page.getByText('$9.99')).toBeVisible();
  });

  test('missing product shows not found', async ({ page }) => {
    await page.goto('/products/999999');
    await expect(page.getByRole('heading', { name: 'Product not found' })).toBeVisible();
  });

  test('delete button redirects to listing', async ({ page, request }) => {
    const created = await request.post('/api/products', {
      data: { name: 'UI Delete Nav', price: 15 },
    });
    const product = await created.json();

    await page.goto(`/products/${product.id}`);
    await expect(page.getByRole('heading', { name: 'UI Delete Nav' })).toBeVisible();

    await page.getByRole('button', { name: 'Delete Product' }).click();

    await expect(page).toHaveURL('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });
});
