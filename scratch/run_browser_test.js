const puppeteer = require('puppeteer-core');

async function run() {
  console.log('Starting browser test...');
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true, // We can run it in headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport size
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

    // Ensure we have items in the cart
    console.log('Ensuring items in cart by navigating to a product page and adding to cart...');
    await page.goto('http://localhost:5173/products/1', { waitUntil: 'networkidle2' });
    
    // Wait for the add to cart button and click it
    const addToCartButtonSelector = 'button.btn-primary'; // Adjust if needed
    console.log('Clicking Add to Cart button...');
    await page.click(addToCartButtonSelector);
    await new Promise(r => setTimeout(r, 2000)); // wait for toast

    console.log('Navigating to checkout page...');
    await page.goto('http://localhost:5173/checkout', { waitUntil: 'networkidle2' });
    console.log('Currently on checkout page:', page.url());

    // Take screenshot of checkout page
    await page.screenshot({ path: 'checkout_page.png' });
    console.log('Screenshot saved: checkout_page.png');

    // Choose COD
    console.log('Selecting Cash on Delivery (COD) payment method...');
    const codRadioSelector = 'input[value="COD"]';
    // Wait, let's look at how COD label is structure in Checkout.jsx:
    // <input type="radio" name="paymentMethod" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')}
    // It doesn't have value="COD". We can find it by label text or select it.
    // In Checkout.jsx line 245: onChange={() => setPaymentMethod('COD')}
    // It's the second radio input of type="radio" and name="paymentMethod"
    await page.evaluate(() => {
      const radios = document.querySelectorAll('input[type="radio"][name="paymentMethod"]');
      if (radios.length > 1) {
        radios[1].click(); // Click COD
      }
    });

    await new Promise(r => setTimeout(r, 1000));

    // Click place order button
    console.log('Clicking Place Order button...');
    await page.click('#place-order-btn');

    // Wait for navigation or toast
    console.log('Waiting for navigation to success page...');
    await new Promise(r => setTimeout(r, 5000)); // Wait for order placement to resolve

    console.log('Current URL after placing order:', page.url());
    await page.screenshot({ path: 'success_or_error_page.png' });
    console.log('Screenshot saved: success_or_error_page.png');

    // Print the body text of the final page
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('--- FINAL PAGE CONTENT ---');
    console.log(bodyText);
    console.log('--------------------------');

  } catch (err) {
    console.error('❌ Browser test failed:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

run();
