import { expect, test } from '@playwright/test';

test.describe('GitHub demo build', () => {
  test('defaults to demo session without backend', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/#\/auth$/);

    const demoState = await page.evaluate(() => ({
      user: window.localStorage.getItem('yuanlv_user'),
      onboarded: window.localStorage.getItem('yuanlv_onboarded'),
      demoMode: window.localStorage.getItem('yuanlu_demo_mode'),
    }));

    expect(demoState.user).toContain('"loggedIn":true');
    expect(demoState.onboarded).toBe('true');
    expect(demoState.demoMode === '1' || demoState.demoMode === null).toBeTruthy();
  });
});
