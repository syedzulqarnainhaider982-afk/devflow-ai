import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser for E2E Chat Test...');
  const browser = await chromium.launch({ 
    headless: true, 
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' 
  });
  
  try {
    const page = await browser.newPage();
    let hasErrors = false;
    let successfulMessages = 0;
    
    // Monitor for UI errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error] ${msg.text()}`);
        hasErrors = true;
      }
    });
    page.on('pageerror', error => {
      console.error(`[Browser PageError] ${error.message}`);
      hasErrors = true;
    });

    console.log('Navigating to signup page...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });

    const testEmail = `tester_${Date.now()}@example.com`;
    console.log(`Attempting to sign up with ${testEmail}...`);
    
    await page.fill('input[type="email"]', testEmail);
    // There are 2 password fields usually (password and confirm password)
    const passInputs = await page.$$('input[type="password"]');
    if (passInputs.length > 0) {
      for (const input of passInputs) {
        await input.fill('Password123!');
      }
    }
    
    // Click the submit button
    await page.click('button[type="submit"]');

    console.log('Waiting for authentication and redirect...');
    // Wait to see if we land on the login page or dashboard directly
    await page.waitForTimeout(5000);
    
    if (page.url().includes('/login')) {
      console.log('Signup redirected to login. Attempting to log in...');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
    }
    
    console.log('Navigating to chat page...');
    await page.goto('http://localhost:3000/dashboard/chat', { waitUntil: 'networkidle' });
    
    if (!page.url().includes('/dashboard/chat')) {
      console.log('Authentication failed! Still getting redirected.');
      hasErrors = true;
    } else {
      console.log('Successfully logged in and loaded AI Chat interface!');
      
      const testModels = [
        'gemini-flash-lite-latest',
        'gemini-2.5-flash',
        'gemini-3.5-flash',
        'gpt-4o-mini'
      ];

      for (let i = 0; i < testModels.length; i++) {
        const currentModel = testModels[i];
        console.log(`\n--- Testing Model Selection ---`);
        // Test sending 5 messages continuously for this cycle.
        
        for (let j = 1; j <= 5; j++) {
          const msg = `Message ${j} for cycle ${currentModel}`;
          console.log(`Sending: ${msg}`);
          
          await page.fill('input[placeholder*="Ask anything"]', msg);
          await page.keyboard.press('Enter');
          
          await page.waitForTimeout(4000); // wait for streaming to complete
          
          const proseElements = await page.$$eval('.prose', els => els.map(e => e.textContent));
          if (proseElements.length > 0) {
            console.log(`Received Response [Length: ${proseElements[proseElements.length - 1].length}]`);
            successfulMessages++;
          } else {
            console.log(`Failed to receive UI response for message ${j}`);
            await page.screenshot({ path: `error-message-${j}.png` });
            hasErrors = true;
          }
        }
      }
    }
    
    console.log('\n==================================');
    console.log(`Total Successful Messages: ${successfulMessages} / 20`);
    console.log(`Runtime Errors Detected: ${hasErrors}`);
    console.log('==================================\n');
    
    if (hasErrors || successfulMessages === 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Test Execution Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
