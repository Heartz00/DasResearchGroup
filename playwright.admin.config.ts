import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/admin-browser',
  workers: 1,
  reporter: 'list',
  timeout: 60000,
  use: { baseURL: 'http://localhost:3018', channel: 'chrome', headless: true },
  webServer: [
    {
      command: 'node tests/admin-browser/mock-wordpress.mjs',
      url: 'http://127.0.0.1:3019',
      reuseExistingServer: false,
    },
    {
      command: 'node node_modules/next/dist/bin/next dev --port 3018',
      url: 'http://localhost:3018/admin/login',
      timeout: 120000,
      reuseExistingServer: false,
      env: {
        WORDPRESS_URL: 'http://127.0.0.1:3019',
        WORDPRESS_ENABLED: 'false',
        ADMIN_ENABLED: 'true',
        ADMIN_SESSION_SECRET: Buffer.alloc(32, 7).toString('base64'),
        SITE_URL: 'http://localhost:3018',
        ADMIN_ALLOW_LOCAL_TEST_SERVER: 'true',
        ADMIN_TEST_DIST_DIR: '.next-admin-test',
      },
    },
  ],
});
