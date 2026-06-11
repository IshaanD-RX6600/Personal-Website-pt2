// Screenshot the scene with a pinned debug camera.
// Usage: node scripts/camshot.mjs "x,y,z" "lx,ly,lz" fov name
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [cam, look, fov = '50', name = 'camshot'] = process.argv.slice(2);
mkdirSync('scripts/smoke-shots', { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`http://localhost:3000/?cam=${cam}&look=${look}&fov=${fov}`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('canvas', { timeout: 60000 });
await page.waitForTimeout(6000); // model load + camera settle
await page.screenshot({ path: `scripts/smoke-shots/${name}.png` });
await browser.close();
console.log(`saved ${name}.png  cam=[${cam}] look=[${look}] fov=${fov}`);
