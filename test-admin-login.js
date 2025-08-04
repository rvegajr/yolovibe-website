import { chromium } from 'playwright';

async function testAdminLogin() {
  console.log('🚀 Starting Admin Login Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Monitor console messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Event:') || text.includes('LOGIN_') || text.includes('AUTH_') || text.includes('Error') || text.includes('error')) {
        console.log(`📡 Browser Console: ${text}`);
      }
    });
    
    // Monitor network requests
    page.on('response', response => {
      if (response.url().includes('/api/auth/login') || response.url().includes('/login')) {
        console.log(`🌐 Network: ${response.status()} ${response.url()}`);
      }
    });
    
    console.log('1️⃣ Navigating to login page...');
    await page.goto('http://localhost:4322/login');
    await page.waitForLoadState('networkidle');
    
    console.log('2️⃣ Checking if login form exists...');
    const emailField = page.locator('#email');
    const passwordField = page.locator('#password');
    const loginButton = page.locator('#login-button');
    
    const emailExists = await emailField.count() > 0;
    const passwordExists = await passwordField.count() > 0;
    const buttonExists = await loginButton.count() > 0;
    
    console.log(`   📧 Email field: ${emailExists ? '✅ Found' : '❌ Missing'}`);
    console.log(`   🔒 Password field: ${passwordExists ? '✅ Found' : '❌ Missing'}`);
    console.log(`   🔘 Login button: ${buttonExists ? '✅ Found' : '❌ Missing'}`);
    
    if (!emailExists || !passwordExists || !buttonExists) {
      console.log('❌ Login form elements missing. Checking page content...');
      const pageContent = await page.content();
      console.log('📄 Page URL:', page.url());
      console.log('📄 Page title:', await page.title());
      return;
    }
    
    console.log('3️⃣ Filling in admin credentials...');
    await emailField.fill('admin@yolovibe.com');
    await passwordField.fill('admin123');
    
    console.log('4️⃣ Clicking login button...');
    await loginButton.click();
    
    console.log('5️⃣ Waiting for response...');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/admin/dashboard')) {
      console.log('✅ SUCCESS: Redirected to admin dashboard!');
    } else if (currentUrl.includes('/portal')) {
      console.log('⚠️ UNEXPECTED: Redirected to regular portal instead of admin dashboard');
    } else if (currentUrl.includes('/login')) {
      console.log('❌ FAILED: Still on login page - check for error messages');
      
      // Check for error messages
      const errorElements = await page.locator('.error, #login-error, .error-message').all();
      for (const error of errorElements) {
        const errorText = await error.textContent();
        if (errorText && errorText.trim()) {
          console.log(`🚨 Error message: ${errorText}`);
        }
      }
    } else {
      console.log(`❓ UNKNOWN: Redirected to unexpected page: ${currentUrl}`);
    }
    
    // Check if admin dashboard elements exist
    if (currentUrl.includes('/admin')) {
      console.log('6️⃣ Checking admin dashboard elements...');
      const dashboardElements = await page.locator('.admin-dashboard, #admin-dashboard, h1, h2').all();
      console.log(`   📊 Found ${dashboardElements.length} potential dashboard elements`);
      
      for (let i = 0; i < Math.min(dashboardElements.length, 5); i++) {
        const text = await dashboardElements[i].textContent();
        if (text && text.trim()) {
          console.log(`   📋 Element ${i + 1}: "${text.trim().substring(0, 50)}..."`);
        }
      }
    }
    
    console.log('\n🎯 Test completed. Press any key to close browser...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  } finally {
    await browser.close();
  }
}

testAdminLogin().catch(console.error); 