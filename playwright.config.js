import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  globalTimeout: 180_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'entrega/resultados/playwright.json' }]
  ],
  use: {
    baseURL: process.env.ECO_BASE_URL || 'http://127.0.0.1:5190',
    locale: 'pt-BR',
    timezoneId: 'America/Cuiaba',
    trace: 'on',
    video: 'on',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce'
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ],
  webServer: process.env.ECO_BASE_URL ? undefined : {
    command: 'node scripts/serve.mjs',
    url: 'http://127.0.0.1:5190',
    env: { PORT: '5190' },
    reuseExistingServer: false,
    timeout: 15_000
  }
});
