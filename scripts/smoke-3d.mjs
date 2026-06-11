// Temporary smoke-test driver for the scroll-driven 3D homepage.
// Usage: node scripts/smoke-3d.mjs [baseUrl]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const OUT = 'scripts/smoke-shots';
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('canvas', { timeout: 60000 });

// Wait for the GLB to finish loading (canvas wrapper fades to opacity 1)
await page.waitForFunction(() => {
  const c = document.querySelector('canvas');
  if (!c) return false;
  const wrap = c.closest('div[style]');
  return wrap && getComputedStyle(wrap.parentElement.children[0]).opacity === '1';
}, { timeout: 60000 }).catch(() => console.log('WARN: fade-in wait timed out'));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/1-hero.png` });

const scrollTo = async (frac, name, settle = 2500) => {
  await page.evaluate(f => {
    const max = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo({ top: max * f, behavior: 'instant' });
  }, frac);
  await page.waitForTimeout(settle);
  await page.screenshot({ path: `${OUT}/${name}.png` });
};

await scrollTo(0.35, '2-about-flyin');
await scrollTo(0.55, '3-cockpit');
await scrollTo(1.0, '4-shifter', 3500);

// Open the Projects panel via the dev store handle and verify it renders,
// then close with Escape and confirm the scene is interactive again.
await page.evaluate(() => window.__siteStore?.getState().openSection('projects', '3'));
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/5-panel-projects.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(800);
const gearAfterClose = await page.evaluate(() => window.__siteStore?.getState().gear);
console.log('gear after Escape close:', gearAfterClose);
await page.screenshot({ path: `${OUT}/6-after-close.png` });

console.log('CONSOLE ERRORS:', errors.length ? errors : 'none');
await browser.close();
