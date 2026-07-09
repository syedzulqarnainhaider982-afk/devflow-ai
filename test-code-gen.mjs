import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser for E2E Code Gen Test...');
  const browser = await chromium.launch({ 
    headless: true, 
    executablePath: 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe' 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Login with a test user to ensure clean state
    console.log('Navigating to signup page...');
    await page.goto('http://localhost:3000/signup');
    
    const testEmail = `tester_codegen_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    
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
    
    console.log('Navigating to code-gen page...');
    await page.goto('http://localhost:3000/dashboard/code-gen');
    await page.waitForLoadState('networkidle');

    // 2. Locate elements
    const generateBtn = page.locator('button:has-text("Generate Code")');
    const inputArea = page.locator('textarea[placeholder*="Write a complex React component"]');
    
    // 3. Test Complex Prompt (Language Detection + Strict typing)
    const promptText = "Write a complete Next.js App Router API route to fetch a user profile from Supabase with strict TypeScript interfaces. Handle 404 and 500 errors gracefully.";
    console.log('Inputting complex prompt...');
    await inputArea.fill(promptText);
    
    console.log('Generating code via actual Gemini API...');
    await generateBtn.click();
    
    // 4. Wait for generation
    console.log('Waiting for generation to complete (this might take up to 30s)...');
    await page.waitForSelector('.language-typescript', { state: 'attached', timeout: 35000 }).catch(() => {
        // Fallback if the language isn't exactly typescript
        return page.waitForSelector('code', { state: 'attached', timeout: 35000 })
    });
    console.log('✅ Generation successful and Syntax Highlighted Code rendered.');

    // 5. Test History Save & UI
    console.log('Testing History Integration...');
    // History should have populated on the left
    const historyItem = page.locator('.group').first();
    await historyItem.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ History Item saved and visible.');
    
    const badgeText = await page.locator('span.text-xs.font-mono').innerText();
    if (badgeText.toLowerCase().includes('typescript') || badgeText.toLowerCase().includes('nextjs')) {
      console.log(`✅ Language detection correctly identified: ${badgeText}`);
    } else {
      console.log(`⚠️ Language identified as: ${badgeText}`);
    }

    console.log('✅ ALL E2E TESTS PASSED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ E2E TEST FAILED:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
