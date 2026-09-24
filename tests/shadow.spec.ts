import { test, expect } from '@playwright/test';

/**
 * Playwright and shadow DOM.
 *
 * There is no shadow-specific API here on purpose: Playwright's css= and text=
 * engines pierce OPEN shadow roots automatically, at any depth. The selectors
 * below are written exactly as they would be for light DOM.
 */
test.describe('shadow DOM', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shadow.html');
  });

  test('reads into an open shadow root with an ordinary selector', async ({ page }) => {
    await expect(page.getByTestId('card-title').first()).toHaveText('buy milk');
    await expect(page.getByTestId('card-status').first()).toHaveText('active');
  });

  test('interacts with a control inside a shadow root', async ({ page }) => {
    await page.getByTestId('card-action').first().click();
    await expect(page.getByTestId('card-status').first()).toHaveText('archived');
  });

  test('pierces NESTED shadow roots with no extra syntax', async ({ page }) => {
    // task-panel (shadow) > task-card (shadow) > the title
    await expect(page.locator('task-panel').getByTestId('card-title')).toHaveText('nested task');
    await expect(page.getByTestId('panel-heading')).toHaveText('This week');
  });

  test('sees light DOM the same way', async ({ page }) => {
    await expect(page.getByTestId('light-dom-text')).toContainText('main document');
  });

  test('cannot reach into a CLOSED shadow root - and neither can any tool', async ({ page }) => {
    // A closed root exposes no handle, so there is nothing for any driver to
    // traverse. This is a property of the platform, not a Playwright limitation.
    await expect(page.getByTestId('secret')).toHaveCount(0);
  });
});
