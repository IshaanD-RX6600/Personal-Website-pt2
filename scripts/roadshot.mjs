// Debug shot aimed at the street area with a long load wait; logs console.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('console', m => console.log(`[console.${m.type()}]`, m.text().slice(0, 300)));
page.on('pageerror', e => console.log('[pageerror]', e.message));
page.on('requestfailed', r => console.log('[requestfailed]', r.url(), r.failure()?.errorText));
page.on('response', r => { if (r.url().includes('.glb')) console.log('[glb]', r.status(), r.url()); });
await page.goto('http://localhost:3000/?cam=0,14,18&look=0,-1,40&fov=60', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('canvas', { timeout: 60000 });
await page.waitForTimeout(20000); // generous: 15MB road + cars streaming
await page.screenshot({ path: 'scripts/smoke-shots/road-debug.png' });
await browser.close();
console.log('saved road-debug.png');
