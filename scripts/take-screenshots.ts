import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = 'screenshots';
const DEMO_WALLET = '0x098B716B8Aaf21512996dC57EB0615e2383E2f96';

async function runScreenshots() {
  console.log('📸 Starting Screenshot script for LexExhibit...');
  
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log('Taking screenshot of Landing Page...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500); 
  await page.screenshot({ path: path.join(OUT_DIR, '01-Landing-Page.png'), fullPage: true });

  console.log('Taking screenshot of Forensic Dashboard...');
  await page.fill('input[type="text"]', DEMO_WALLET);
  await page.click('button[type="submit"]');
  await page.waitForSelector('text="Forensic Wallet Trace"', { timeout: 10000 });
  await page.waitForTimeout(2000); 
  await page.screenshot({ path: path.join(OUT_DIR, '02-Forensic-Dashboard.png'), fullPage: true });

  console.log('Taking screenshot of Affidavit Preview...');
  await page.click('button:has-text("Generate Affidavit")');
  await page.waitForSelector('text="Regenerate Affidavit"', { timeout: 15000 });
  await page.waitForSelector('iframe');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, '03-Affidavit-Preview.png'), fullPage: true });

  console.log(`✅ All screenshots saved successfully to the "${OUT_DIR}" directory!`);

  await page.close();
  await context.close();
  await browser.close();
}

runScreenshots().catch((err) => {
  console.error('Failed to capture screenshots:', err);
  process.exit(1);
});
