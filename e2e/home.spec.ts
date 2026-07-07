import { test, expect } from '@playwright/test';

test('home page renders hero and feature cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Next.js Concepts' })).toBeVisible();
  await expect(page.getByText('A demo app exploring Next.js features')).toBeVisible();
  await expect(page.getByText('Server Component')).toBeVisible();
  await expect(page.getByText('Client Component')).toBeVisible();
});

test('navigation links navigate correctly', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL('/about');
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
});
