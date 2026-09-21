// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Pallet Layer Planner is a single self-contained HTML file (index.html) —
 * no build step, no server-side logic, no relative asset fetches (the one
 * external resource is a Google Fonts @import, which degrades gracefully
 * offline). It's loaded directly via file:// in tests (see tests/helpers.js),
 * so there is intentionally no `webServer` block here.
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
