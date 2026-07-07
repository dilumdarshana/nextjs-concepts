import { test, expect } from '@playwright/test';

test('about page renders feature cards', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'App Router' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Server Components' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Authentication' })).toBeVisible();
});

test('back to home button navigates to home', async ({ page }) => {
  await page.goto('/about');
  await page.getByRole('button', { name: 'Back to Home' }).click();
  await expect(page).toHaveURL('/');
});
