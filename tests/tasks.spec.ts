import { test, expect } from '@playwright/test';

test.describe('Task list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('starts empty', async ({ page }) => {
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('task-item')).toHaveCount(0);
    await expect(page.getByTestId('counter')).toContainText('0 remaining');
  });

  test('adds a task', async ({ page }) => {
    await page.locator('#new-task-input').fill('buy milk');
    await page.getByTestId('add-button').click();

    await expect(page.getByTestId('task-item')).toHaveCount(1);
    await expect(page.getByTestId('task-title')).toHaveText('buy milk');
    await expect(page.getByTestId('empty-state')).toBeHidden();
    await expect(page.getByTestId('counter')).toContainText('1 remaining');
  });

  test('rejects an empty task', async ({ page }) => {
    await page.getByTestId('add-button').click();
    await expect(page.getByTestId('task-item')).toHaveCount(0);
  });

  test('marks a task done and decrements the counter', async ({ page }) => {
    await page.locator('#new-task-input').fill('write tests');
    await page.locator('#new-task-input').press('Enter');

    await page.getByTestId('toggle').check();

    await expect(page.getByTestId('task-item').first()).toHaveClass(/done/);
    await expect(page.getByTestId('counter')).toContainText('0 remaining');
  });

  test('deletes a task', async ({ page }) => {
    await page.locator('#new-task-input').fill('temporary');
    await page.locator('#new-task-input').press('Enter');
    await expect(page.getByTestId('task-item')).toHaveCount(1);

    await page.getByTestId('delete').click();

    await expect(page.getByTestId('task-item')).toHaveCount(0);
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });
});
