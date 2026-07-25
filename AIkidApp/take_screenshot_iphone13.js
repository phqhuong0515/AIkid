const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 13'],
  });
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:8082/lobby', { waitUntil: 'networkidle' });
  } catch (e) {
    try {
      await page.goto('http://localhost:8082/', { waitUntil: 'networkidle' });
    } catch (err) {
      console.error(err);
    }
  }

  // Đợi khoảng 5 giây
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: '/Users/imam/.gemini/antigravity/brain/772fe20d-37c0-4de9-a48f-d8b3e29d11d0/qa_lobby_fix.png' });
  
  await browser.close();
})();
