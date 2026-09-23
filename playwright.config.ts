import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  // Playwright starts the app itself; Cypress has no built-in equivalent
  webServer: {
    command: 'npx http-server app -p 5173 --silent',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
});
