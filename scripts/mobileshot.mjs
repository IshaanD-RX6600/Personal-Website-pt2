// Verify the mobile/no-WebGL fallback page renders and anchors work.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.screenshot({ path: 'scripts/smoke-shots/m1-hero.png' });
// Tap gear 3 (Projects) in the SVG shifter → should scroll to #projects
await page.evaluate(() => {
  const texts = [...document.querySelectorAll('svg text')];
  const g3 = texts.find(t => t.textContent === '3');
  g3?.parentElement?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});
await page.waitForTimeout(1500);
await page.screenshot({ path: 'scripts/smoke-shots/m2-projects.png' });
console.log('has canvas (should be false):', await page.evaluate(() => !!document.querySelector('canvas')));
await browser.close();
