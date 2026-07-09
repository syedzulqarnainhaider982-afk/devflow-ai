import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser for E2E Website Gen Test...');
  const browser = await chromium.launch({ 
    headless: true, 
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' 
  });
  
  try {
    const page = await browser.newPage();

    // Monitor for UI errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error] ${msg.text()}`);
      }
    });

    // 1. Signup / Login
    console.log('Navigating to signup page...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    
    const timestamp = Date.now();
    const testEmail = `tester_webgen_${timestamp}@example.com`;
    const testPassword = `Password${timestamp}!`;
    
    console.log(`Attempting to sign up with ${testEmail}...`);
    await page.fill('input[type="email"]', testEmail);
    const passInputs = await page.$$('input[type="password"]');
    if (passInputs.length > 0) {
      for (const input of passInputs) {
        await input.fill(testPassword);
      }
    }
    
    const termsCheckbox = page.locator('button[role="checkbox"]');
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check();
    }
    
    await page.click('button[type="submit"]');
    
    console.log('Waiting for authentication and redirect...');
    await page.waitForTimeout(5000);
    
    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
    }
    
    // 2. Go to Website Gen page
    console.log('Navigating to website-gen page...');
    await page.goto('http://localhost:3000/dashboard/website-gen', { waitUntil: 'networkidle' });
    
    if (!page.url().includes('/dashboard/website-gen')) {
      throw new Error('Authentication failed or redirect failed.');
    }
    console.log('Successfully loaded Website Gen interface!');

    // 3. Generate a Website
    console.log('Generating a new website via actual Gemini API...');
    
    // We will use a very simple prompt to reduce generation time for the test
    await page.fill('textarea[placeholder*="E.g. A modern dark-mode"]', 'Create a very simple webpage with a red background and a single h1 tag saying Test Brand. Only HTML.');
    await page.fill('input[placeholder="Brand Name"]', 'Test Brand');
    await page.click('button[type="submit"]');

    console.log('Waiting for generation to complete (this might take up to 30s)...');
    // Wait for the iframe to appear, indicating generation success
    await page.waitForSelector('iframe[title="Live Preview"]', { timeout: 45000 });
    console.log('✅ Generation successful and Live Preview rendered.');

    // 4. Test Code View
    console.log('Testing Code View toggle...');
    await page.click('button:has-text("Code")');
    await page.waitForSelector('pre > code', { timeout: 5000 });
    console.log('✅ Code View rendered.');

    // 5. Test History Fetching and Selecting
    console.log('Testing History Selection...');
    // The history item should have title "Test Brand"
    await page.click('h4:has-text("Test Brand")');
    console.log('✅ History Item clickable.');

    console.log('✅ ALL E2E TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
