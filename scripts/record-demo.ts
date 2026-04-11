import { chromium, Page } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Placeholder for audio - user can update this later
const AUDIO_PATH = path.resolve(import.meta.dirname, '..', 'tts_The_t_20260411_194552.mp3');

async function smoothMouseMove(page: Page, x: number, y: number, steps = 25) {
  await page.mouse.move(x, y, { steps });
}

async function smoothScroll(page: Page, yOffset: number) {
  await page.mouse.wheel(0, yOffset);
  await page.waitForTimeout(500);
}

async function runDemo() {
  console.log('🚀 Starting LexExhibit Demo Recording Script...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { 
      dir: 'recordings/', 
      size: { width: 1920, height: 1080 } 
    }
  });

  const page = await context.newPage();

  console.log('Loading app at localhost:3000...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  const hasAudio = fs.existsSync(AUDIO_PATH);
  let audioProcess;
  let startTime = Date.now();

  if (hasAudio) {
    console.log('🔊 Starting audio...');
    audioProcess = spawn('afplay', [AUDIO_PATH]);
  } else {
    console.log('⚠️ No audio file found at AUDIO_PATH. Recording video only.');
  }

  const waitTo = async (targetSecond: number) => {
    const targetMs = targetSecond * 1000;
    const elapsed = Date.now() - startTime;
    if (targetMs > elapsed) {
      await page.waitForTimeout(targetMs - elapsed);
    }
  };

  // ----- TIMELINE -----
  
  // [0:00 - 0:10] Intro
  await waitTo(5);
  await smoothMouseMove(page, 960, 400, 100);
  
  // [0:10 - 0:25] Fill Wallet
  await waitTo(10);
  console.log('Entering wallet address...');
  await page.fill('input[type="text"]', '0x098B716B8Aaf21512996dC57EB0615e2383E2f96');
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');

  // [0:25 - 0:45] Dashboard
  await waitTo(25);
  console.log('Analyzing trace...');
  await page.waitForSelector('text="Forensic Wallet Trace"', { timeout: 10000 });
  await smoothScroll(page, 400);
  await waitTo(40);

  // [0:45 - 1:10] Affidavit
  await waitTo(45);
  console.log('Generating Affidavit...');
  await page.click('button:has-text("Generate Affidavit")');
  await page.waitForSelector('text="Regenerate Affidavit"', { timeout: 15000 });
  await page.waitForSelector('iframe');
  await waitTo(60);
  await smoothScroll(page, 300);

  // [1:10 - 1:20] Outro
  await waitTo(70);
  
  console.log('✅ Demo sequence complete. Closing browser...');
  await page.close();
  await context.close();
  
  const videoPath = await page.video()?.path();
  if (videoPath) {
    const finalPath = path.resolve(import.meta.dirname, '..', 'recordings', 'LexExhibit_Demo.webm');
    const finalDir = path.dirname(finalPath);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    fs.renameSync(videoPath, finalPath);
    console.log(`🎬 Demo recorded at: ${finalPath}`);
  }

  await browser.close();
  if (audioProcess) audioProcess.kill();
  process.exit(0);
}

runDemo().catch((err) => {
  console.error('Failed to run demo:', err);
  process.exit(1);
});
