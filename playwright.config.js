import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests/browser',
  outputDir:'./test-results/skrek-product-v1',
  timeout:45_000,
  expect:{timeout:8_000},
  fullyParallel:false,
  forbidOnly:Boolean(process.env.CI),
  retries:process.env.CI?1:0,
  workers:1,
  reporter:[['list'],['html',{outputFolder:'playwright-report',open:'never'}]],
  use:{
    baseURL:'http://127.0.0.1:4173',
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
    video:'retain-on-failure'
  },
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome']}},
    {name:'webkit',use:{...devices['Desktop Safari']}}
  ],
  webServer:{
    command:'CJAS_PORT=4173 node tools/static-server.mjs',
    url:'http://127.0.0.1:4173/web/v3-crypto/index.html',
    reuseExistingServer:!process.env.CI,
    timeout:30_000
  }
});
