// Scroll to the end, click "[ ↑ ] back to the start", verify the page
// animates back to the top.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('canvas', { timeout: 60000 });
await page.waitForTimeout(7000);

await page.evaluate(() => {
  const max = document.documentElement.scrollHeight - innerHeight;
  window.scrollTo({ top: max, behavior: 'instant' });
});
await page.waitForTimeout(2500);

const btn = page.locator('text=back to the start');
await btn.click();
await page.waitForTimeout(2500); // Lenis animates ~1.6s
const y = await page.evaluate(() => window.scrollY);
console.log('scrollY after restart click:', y);
await browser.close();
console.log(y < 50 ? 'PASS' : 'FAIL');
