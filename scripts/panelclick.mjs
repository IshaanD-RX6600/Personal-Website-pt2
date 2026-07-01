// End-to-end check: scroll to the showroom finale, click the PROJECTS wall
// panel, verify the section overlay opens; Escape closes it.
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
await page.waitForTimeout(3000);

// Click where the PROJECTS board sits in the p=1 framing (right wall, front)
const label = page.locator('text=Projects').first();
const box = await label.boundingBox();
if (!box) throw new Error('Projects panel label not found');
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
await page.waitForTimeout(1200);

const open = await page.evaluate(() => (window.__siteStore?.getState?.().activeSection) ?? null);
console.log('activeSection after click:', open);
await page.screenshot({ path: 'scripts/smoke-shots/panel-open.png' });

await page.keyboard.press('Escape');
await page.waitForTimeout(800);
const closed = await page.evaluate(() => (window.__siteStore?.getState?.().activeSection) ?? null);
console.log('activeSection after Escape:', closed);

await browser.close();
console.log(open === 'projects' && closed === null ? 'PASS' : 'FAIL');
