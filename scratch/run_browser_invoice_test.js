const puppeteer = require('puppeteer-core');

async function run() {
  console.log('Starting browser invoice test...');
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Capture console logs
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    page.on('pageerror', err => {
      console.error(`[Browser PageError] ${err.toString()}`);
    });

    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    console.log('Typing credentials...');
    await page.type('#email', 'john@example.com');
    await page.type('#password', 'user123');

    console.log('Submitting login form...');
    await Promise.all([
      page.click('#login-submit'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    console.log('Logged in successfully, navigated to:', page.url());

    // Navigate to invoice of order 8 (placed earlier in COD test)
    console.log('Navigating to invoice page for order 8...');
    await page.goto('http://localhost:5173/orders/8/invoice', { waitUntil: 'networkidle2' });
    console.log('Currently on invoice page:', page.url());

    // Take screenshot of invoice page
    await page.screenshot({ path: 'invoice_page_8.png' });
    console.log('Screenshot saved: invoice_page_8.png');

    // Print body text
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('--- INVOICE PAGE CONTENT ---');
    console.log(bodyText);
    console.log('----------------------------');

  } catch (err) {
    console.error('❌ Browser test failed:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

run();
