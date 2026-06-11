// Full-res crop of the nav view (p=1.0) to check HUD/labels legibility.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('canvas', { timeout: 60000 });
await page.waitForTimeout(5000);
await page.evaluate(() => {
  const max = document.documentElement.scrollHeight - innerHeight;
  window.scrollTo({ top: max, behavior: 'instant' });
});
await page.waitForTimeout(4000);
await page.screenshot({ path: 'scripts/smoke-shots/nav-top.png', clip: { x: 360, y: 0, width: 720, height: 450 } });
await page.screenshot({ path: 'scripts/smoke-shots/nav-mid.png', clip: { x: 360, y: 300, width: 720, height: 450 } });
await browser.close();
console.log('saved nav crops');
