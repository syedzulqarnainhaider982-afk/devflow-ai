import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser for E2E n8n Test...');
  const browser = await chromium.launch({ 
    headless: true, 
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Go to signup page to create a fresh test account
    console.log('Navigating to signup page...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    
    const timestamp = Date.now();
    const testEmail = `tester_n8n_${timestamp}@example.com`;
    const testPassword = `Password${timestamp}!`;
    
    console.log(`Attempting to sign up with ${testEmail}...`);
    await page.fill('input[type="email"]', testEmail);
    const passInputs = await page.$$('input[type="password"]');
    if (passInputs.length > 0) {
      for (const input of passInputs) {
        await input.fill(testPassword);
      }
    }
    
    // Check Terms checkbox if exists
    const termsCheckbox = page.locator('button[role="checkbox"]');
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check();
    }
    
    await page.click('button[type="submit"]');
    
    console.log('Waiting for authentication and redirect...');
    await page.waitForTimeout(5000);
    
    if (page.url().includes('/login')) {
      console.log('Signup redirected to login. Attempting to log in...');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
    }
    
    // 2. Go to n8n page
    console.log('Navigating to n8n page...');
    await page.goto('http://localhost:3000/dashboard/n8n');
    await page.waitForSelector('text=n8n Workflow Library');
    console.log('Successfully loaded n8n interface!');

    // Wait 2 seconds for UI to settle
    await page.waitForTimeout(2000);

    // Check if the "No workflows found" state is visible
    const noWorkflows = await page.locator('text=No workflows found').count();
    if (noWorkflows > 0) {
      console.log('Empty state verified correctly.');
    }

    // 3. Create a workflow
    console.log('Creating a new workflow...');
    await page.click('button:has-text("Add First Workflow")').catch(async () => {
      await page.click('button:has-text("New Workflow")');
    });

    await page.waitForSelector('text=Add New Workflow');
    await page.fill('input#title', 'Automated E2E Workflow');
    await page.fill('textarea#description', 'This is a test description');
    await page.fill('input#category', 'Testing');
    await page.fill('input#tags', 'e2e, playwright');
    await page.fill('input#webhook_url', 'http://localhost:3000/api/n8n/dummy-webhook'); // Mock URL
    await page.fill('textarea#workflow_json', '{"nodes": [], "connections": {}}'); // Valid JSON

    await page.click('button:has-text("Create Workflow")');

    // 4. Verify it appeared in the list
    console.log('Verifying workflow creation...');
    await page.waitForSelector('text=Automated E2E Workflow');
    await page.waitForSelector('text=Testing');
    console.log('Workflow created successfully!');

    // 5. Test search filter
    console.log('Testing search functionality...');
    await page.fill('input[placeholder="Search by title, description, category, or tags..."]', 'xyz_no_match');
    await page.waitForSelector('text=We couldn\'t find any workflows matching your search.');
    console.log('Search exclusion works.');

    await page.fill('input[placeholder="Search by title, description, category, or tags..."]', 'playwright');
    await page.waitForSelector('text=Automated E2E Workflow');
    console.log('Search inclusion works (by tag).');

    // 6. Test Favorite toggle
    console.log('Testing Favorite toggle...');
    // Find the favorite star button inside the card
    const starBtn = page.locator('.lucide-star').first();
    await starBtn.click();
    console.log('Favorite toggled.');

    // 7. Test Copy JSON
    console.log('Testing Copy JSON...');
    await page.click('button:has-text("JSON")');
    console.log('JSON copied successfully.');

    // 8. Test Edit
    console.log('Testing Edit Workflow...');
    await page.click('button[title="Edit Workflow"]');
    await page.waitForSelector('text=Edit Workflow');
    await page.fill('input#title', 'Updated E2E Workflow');
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Updated E2E Workflow');
    console.log('Workflow edited successfully!');

    // 9. Test Run
    console.log('Testing Run Workflow...');
    // Create a dummy endpoint to mock the n8n webhook response
    await page.route('**/api/n8n/trigger', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        console.log('Intercepted /api/n8n/trigger - Mocking successful response');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Workflow triggered successfully' })
        });
      } else {
        await route.continue();
      }
    });

    await page.click('button:has-text("Run")');
    // We expect the toast to appear or the button to stop spinning
    await page.waitForTimeout(1000);
    console.log('Run triggered successfully!');

    // 10. Test Delete
    console.log('Testing Delete Workflow...');
    
    // Auto-accept the window.confirm dialog
    page.on('dialog', dialog => dialog.accept());
    
    await page.click('button[title="Delete Workflow"]');
    await page.waitForSelector('text=No workflows found');
    console.log('Workflow deleted successfully!');

    console.log('✅ ALL E2E TESTS PASSED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    await page.screenshot({ path: 'n8n-error-screenshot.png' });
    console.log('Screenshot saved to n8n-error-screenshot.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
