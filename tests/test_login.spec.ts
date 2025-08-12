import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:5000');
  });

  test('displays login form', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Login Form');
  });

  test('rejects invalid login', async ({ page }) => {
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('accepts valid login and redirects', async ({ page }) => {
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'pass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://127.0.0.1:5000/welcome');
    await expect(page.locator('h1')).toHaveText('Welcome, you logged in successfully!');
  });
});
