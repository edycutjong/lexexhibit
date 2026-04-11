import { chromium, Page } from 'playwright';
import path from 'path';
import fs from 'fs';

async function smoothMouseMove(page: Page, x: number, y: number, steps = 30) {
  await page.mouse.move(x, y, { steps });
}

async function smoothScroll(page: Page, yOffset: number) {
  await page.mouse.wheel(0, yOffset);
  await page.waitForTimeout(600);
}

async function typeLikeUser(page: Page, selector: string, text: string) {
  const locator = page.locator(selector);
  await locator.click();
  for (const char of text) {
    await page.keyboard.type(char, { delay: Math.random() * 80 + 30 });
  }
}

async function runBRoll() {
  console.log('🎥 Starting LexExhibit B-Roll Recording...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 60,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { 
      dir: 'recordings/', 
      size: { width: 1920, height: 1080 } 
    }
  });

  const page = await context.newPage();

  console.log('Loading app...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
  await page.waitForTimeout(3000);
  
  await smoothMouseMove(page, 500, 300);
  await page.waitForTimeout(500);
  await smoothMouseMove(page, 960, 400);

  console.log('Typing wallet address...');
  await typeLikeUser(page, 'input[type="text"]', '0x098B716B8Aaf21512996dC57EB0615e2383E2f96');
  await page.waitForTimeout(800);
  await page.keyboard.press('Enter');
  
  console.log('Waiting for trace results...');
  await page.waitForSelector('text="Forensic Wallet Trace"', { timeout: 10000 });
  await page.waitForTimeout(2000);

  await smoothScroll(page, 400);
  await page.waitForTimeout(2000);
  
  console.log('Hovering over trace elements...');
  await smoothMouseMove(page, 960, 540, 50);
  await page.waitForTimeout(1000);

  console.log('Generating Affidavit...');
  await page.click('button:has-text("Generate Legal Affidavit")');
  await page.waitForSelector('text="Regenerate Legal Affidavit"', { timeout: 15000 });
  await page.waitForTimeout(3000);

  await smoothScroll(page, 300);
  await page.waitForTimeout(2000);

  console.log('🎥 B-Roll sequence complete.');
  await page.close();
  await context.close();
  
  const videoPath = await page.video()?.path();
  if (videoPath) {
    const finalPath = path.resolve(import.meta.dirname, '..', 'recordings', 'LexExhibit_BRoll.webm');
    const finalDir = path.dirname(finalPath);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    fs.renameSync(videoPath, finalPath);
    console.log(`🎬 B-Roll recorded at: ${finalPath}`);
  }

  await browser.close();
  process.exit(0);
}

runBRoll().catch((err) => {
  console.error('Failed to run b-roll:', err);
  process.exit(1);
});
