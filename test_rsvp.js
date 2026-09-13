const { chromium } = require('playwright');

(async () => {
  console.log("Starting RSVP Dev Testing...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Test 1: Single Guest (G7GVNVFK - Amila Aiya, allowedGuestCount: 1)
    console.log("--- Test 1: Single Guest (allowedGuestCount: 1) ---");
    await page.goto('http://localhost:3000/invite/G7GVNVFK');
    
    // Wait for the passport cover to open (need to click or wait)
    // The passport cover has a button "OPEN INVITATION"
    await page.waitForSelector('text=OPEN INVITATION');
    await page.click('text=OPEN INVITATION');
    
    // Wait for RSVP section
    await page.waitForSelector('text=Will you attend?');
    
    // Click Attending
    await page.click('button:has-text("Attending")');
    
    // Check if "Number of Guests Attending" is hidden
    const guestDropdownHidden = await page.isVisible('text=Number of Guests Attending') === false;
    console.log("Guest Attending Dropdown Hidden:", guestDropdownHidden ? "✅ PASS" : "❌ FAIL");
    
    // Check if liquor question is singular
    const liquorSingularVisible = await page.isVisible('text=Will you require liquor?');
    console.log("Singular Liquor Question Visible:", liquorSingularVisible ? "✅ PASS" : "❌ FAIL");


    // Test 2: Double Guest (JHJYX3IS - Dilini Nanda, allowedGuestCount: 2)
    console.log("\n--- Test 2: Double Guest (allowedGuestCount: 2) ---");
    await page.goto('http://localhost:3000/invite/JHJYX3IS');
    
    await page.waitForSelector('text=OPEN INVITATION');
    await page.click('text=OPEN INVITATION');
    
    await page.waitForSelector('text=Will you attend?');
    
    // Click Attending
    await page.click('button:has-text("Attending")');
    
    // Check if "Number of Guests Attending" is visible
    const guestDropdownVisible = await page.isVisible('text=Number of Guests Attending');
    console.log("Guest Attending Dropdown Visible:", guestDropdownVisible ? "✅ PASS" : "❌ FAIL");
    
    // Check if liquor question is plural
    const liquorPluralVisible = await page.isVisible('text=Number of Guests Requiring Liquor');
    console.log("Plural Liquor Question Visible:", liquorPluralVisible ? "✅ PASS" : "❌ FAIL");

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    await browser.close();
  }
})();
