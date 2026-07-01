// Screenshots the garage timeline at several scroll positions.
// Usage: node scripts/garageshots.mjs [p1 p2 ...]  (defaults below)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const stops = process.argv.slice(2).map(Number);
const P = stops.length ? stops : [0, 0.12, 0.25, 0.38, 0.54, 0.70, 0.84, 1.0];
mkdirSync('scripts/smoke-shots', { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('console', m => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('canvas', { timeout: 60000 });
await page.waitForTimeout(7000); // model load + fade-in

for (const p of P) {
  await page.evaluate((prog) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo({ top: max * prog, behavior: 'instant' });
  }, p);
  await page.waitForTimeout(2600); // camera damping settle
  const name = `garage-p${String(p).replace('.', '_')}`;
  await page.screenshot({ path: `scripts/smoke-shots/${name}.png` });
  console.log(`saved ${name}.png`);
}
await browser.close();
