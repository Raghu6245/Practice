import { test, expect } from '@playwright/test';

test.describe('Flask App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:5000');
  });

  test.describe('Login Functionality', () => {
    test('displays login form with new styling', async ({ page }) => {
      await expect(page.locator('h2')).toHaveText('Login');
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('text=Create Account')).toBeVisible();
    });

    test('shows demo credentials info', async ({ page }) => {
      await expect(page.locator('.demo-info')).toContainText('Demo Account');
      await expect(page.locator('.demo-info')).toContainText('testuser');
      await expect(page.locator('.demo-info')).toContainText('pass123');
    });

    test('rejects invalid login with flash message', async ({ page }) => {
      await page.fill('input[name="username"]', 'wronguser');
      await page.fill('input[name="password"]', 'wrongpass');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.alert-error').first()).toBeVisible();
      await expect(page.locator('.alert-error').first()).toContainText('Invalid username or password');
    });

    test('accepts valid login and redirects to dashboard', async ({ page }) => {
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'pass123');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL('http://127.0.0.1:5000/dashboard');
      await expect(page.locator('h1')).toContainText('Welcome, testuser!');
      await expect(page.locator('.alert-success')).toContainText('Welcome back, testuser!');
    });
  });

  test.describe('Registration Functionality', () => {
    test('navigates to registration page', async ({ page }) => {
      await page.click('text=Create Account');
      await expect(page).toHaveURL('http://127.0.0.1:5000/register');
      await expect(page.locator('h2')).toHaveText('Create Account');
    });

    test('displays registration form with all fields', async ({ page }) => {
      await page.click('text=Create Account');
      
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('text=Minimum 6 characters')).toBeVisible();
    });

    test('validates required fields', async ({ page }) => {
      await page.click('text=Create Account');
      
      // Remove HTML5 required validation for this test
      await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[required]');
        inputs.forEach(input => input.removeAttribute('required'));
      });
      
      // Now submit empty form to test server-side validation
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.alert-error').first()).toContainText('All fields are required');
    });

    test('validates password length', async ({ page }) => {
      await page.click('text=Create Account');
      
      await page.fill('input[name="username"]', 'newuser');
      await page.fill('input[name="email"]', 'new@example.com');
      await page.fill('input[name="password"]', '123');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.alert-error').first()).toContainText('Password must be at least 6 characters');
    });

    test('prevents duplicate username registration', async ({ page }) => {
      await page.click('text=Create Account');
      
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="email"]', 'test2@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.alert-error').first()).toContainText('Username already exists');
    });

    test('successfully registers new user', async ({ page }) => {
      const timestamp = Date.now();
      const username = `testuser${timestamp}`;
      
      await page.click('text=Create Account');
      
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="email"]', `${username}@example.com`);
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL('http://127.0.0.1:5000/');
      await expect(page.locator('.alert-success')).toContainText('Registration successful! Please log in.');
    });
  });

  test.describe('Dashboard Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each dashboard test
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'pass123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('http://127.0.0.1:5000/dashboard');
    });

    test('displays dashboard with user info', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Welcome, testuser!');
      await expect(page.locator('h2')).toContainText('Dashboard Overview');
      await expect(page.locator('.stat-card')).toHaveCount(3);
    });

    test('shows navigation buttons', async ({ page }) => {
      await expect(page.locator('.header a:has-text("Profile")')).toBeVisible();
      await expect(page.locator('.header a:has-text("Logout")')).toBeVisible();
    });

    test('displays feature cards', async ({ page }) => {
      await expect(page.locator('h3:has-text("Profile Management")')).toBeVisible();
      await expect(page.locator('h3:has-text("Security")')).toBeVisible();
      await expect(page.locator('h3:has-text("Analytics")')).toBeVisible();
    });

    test('navigates to profile page', async ({ page }) => {
      await page.click('text=Profile');
      await expect(page).toHaveURL('http://127.0.0.1:5000/profile');
    });
  });

  test.describe('Profile Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to profile
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'pass123');
      await page.click('button[type="submit"]');
      await page.click('text=Profile');
    });

    test('displays profile information', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('User Profile');
      await expect(page.locator('h2')).toContainText('testuser');
      await expect(page.locator('.badge')).toContainText('Active User');
    });

    test('shows user details', async ({ page }) => {
      await expect(page.locator('text=Username:')).toBeVisible();
      await expect(page.locator('text=Email:')).toBeVisible();
      await expect(page.locator('text=Member Since:')).toBeVisible();
      await expect(page.locator('text=Account Status:')).toBeVisible();
    });

    test('displays profile avatar with user initial', async ({ page }) => {
      await expect(page.locator('.profile-avatar')).toContainText('T');
    });

    test('has navigation back to dashboard', async ({ page }) => {
      await page.click('text=Dashboard');
      await expect(page).toHaveURL('http://127.0.0.1:5000/dashboard');
    });
  });

  test.describe('Logout Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'pass123');
      await page.click('button[type="submit"]');
    });

    test('logs out from dashboard', async ({ page }) => {
      await page.click('text=Logout');
      
      await expect(page).toHaveURL('http://127.0.0.1:5000/');
      await expect(page.locator('.alert-info')).toContainText('Goodbye, testuser! You have been logged out.');
    });

    test('logs out from profile', async ({ page }) => {
      await page.click('text=Profile');
      await page.click('text=Logout');
      
      await expect(page).toHaveURL('http://127.0.0.1:5000/');
      await expect(page.locator('.alert-info')).toContainText('logged out');
    });
  });

  test.describe('Session Management', () => {
    test('redirects to login when accessing dashboard without login', async ({ page }) => {
      await page.goto('http://127.0.0.1:5000/dashboard');
      
      await expect(page).toHaveURL('http://127.0.0.1:5000/');
      await expect(page.locator('.alert-error')).toContainText('Please log in to access the dashboard');
    });

    test('redirects to login when accessing profile without login', async ({ page }) => {
      await page.goto('http://127.0.0.1:5000/profile');
      
      await expect(page).toHaveURL('http://127.0.0.1:5000/');
      await expect(page.locator('.alert-error')).toContainText('Please log in to access your profile');
    });

    test('redirects logged-in users away from login page', async ({ page }) => {
      // Login first
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'pass123');
      await page.click('button[type="submit"]');
      
      // Try to access login page while logged in
      await page.goto('http://127.0.0.1:5000/');
      await expect(page).toHaveURL('http://127.0.0.1:5000/dashboard');
    });

    test('redirects logged-in users away from registration page', async ({ page }) => {
      // Login first
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'pass123');
      await page.click('button[type="submit"]');
      
      // Try to access registration page while logged in
      await page.goto('http://127.0.0.1:5000/register');
      await expect(page).toHaveURL('http://127.0.0.1:5000/dashboard');
    });
  });

  test.describe('User Registration and Login Flow', () => {
    test('complete user journey: register -> login -> dashboard -> profile -> logout', async ({ page }) => {
      const timestamp = Date.now();
      const username = `testuser${timestamp}`;
      const email = `${username}@example.com`;
      
      // 1. Register new user
      await page.click('text=Create Account');
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // 2. Login with new user
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // 3. Verify dashboard
      await expect(page).toHaveURL('http://127.0.0.1:5000/dashboard');
      await expect(page.locator('h1')).toContainText(`Welcome, ${username}!`);
      
      // 4. Go to profile
      await page.click('text=Profile');
      await expect(page).toHaveURL('http://127.0.0.1:5000/profile');
      await expect(page.locator('h2')).toContainText(username);
      
      // 5. Logout
      await page.click('text=Logout');
      await expect(page).toHaveURL('http://127.0.0.1:5000/');
      await expect(page.locator('.alert-info')).toContainText(`Goodbye, ${username}!`);
    });
  });
});
