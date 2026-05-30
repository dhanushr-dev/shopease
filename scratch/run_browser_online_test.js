const puppeteer = require('puppeteer-core');
const crypto = require('crypto');

async function run() {
  console.log('Starting browser online mock test...');
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

    // Ensure we have items in the cart
    console.log('Ensuring items in cart by navigating to a product page and adding to cart...');
    await page.goto('http://localhost:5173/products/2', { waitUntil: 'networkidle2' });
    await page.click('button.btn-primary');
    await new Promise(r => setTimeout(r, 2000)); // wait for toast

    console.log('Navigating to checkout page...');
    await page.goto('http://localhost:5173/checkout', { waitUntil: 'networkidle2' });
    console.log('Currently on checkout page:', page.url());

    // Mock window.Razorpay on the page
    console.log('Mocking window.Razorpay on checkout page...');
    await page.evaluate((secret) => {
      window.Razorpay = function(options) {
        this.options = options;
        this.open = async function() {
          console.log('[Mock Razorpay] Modal opened for order:', options.order_id);
          
          // Generate a fake payment ID
          const paymentId = 'pay_mock_' + Math.random().toString(36).substr(2, 9);
          
          // We will calculate the valid signature in Node and call handler
          // To pass the payment ID back, we will emit an event or let Node trigger the handler
          // We expose a global function for Node to call with the calculated signature
          window.__triggerMockPayment = (signature) => {
            console.log('[Mock Razorpay] Triggering handler with paymentId:', paymentId, 'signature:', signature);
            options.handler({
              razorpay_payment_id: paymentId,
              razorpay_order_id: options.order_id,
              razorpay_signature: signature
            });
          };
          
          // Tell Node the payment ID and order ID so it can calculate the signature
          window.__mockPaymentDetails = {
            paymentId,
            orderId: options.order_id
          };
        };
      };
    }, 'KvKQ8aC4zBAxfuDUCG3Cu562');

    // Click place order button (this will create order on backend, then call window.Razorpay.open)
    console.log('Clicking Place Order button...');
    await page.click('#place-order-btn');

    // Wait for the mock open to be called and populate details
    console.log('Waiting for Razorpay modal trigger...');
    let details;
    for (let i = 0; i < 20; i++) {
      details = await page.evaluate(() => window.__mockPaymentDetails);
      if (details) break;
      await new Promise(r => setTimeout(r, 500));
    }

    if (!details) {
      throw new Error('Razorpay open was not triggered.');
    }

    console.log('Got mock payment details:', details);
    
    // Calculate the valid signature using crypto in Node
    const keySecret = 'KvKQ8aC4zBAxfuDUCG3Cu562';
    const text = details.orderId + '|' + details.paymentId;
    const signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');
    console.log('Calculated valid signature:', signature);

    // Trigger the mock payment with the valid signature
    console.log('Triggering payment handler in browser...');
    await page.evaluate((sig) => {
      window.__triggerMockPayment(sig);
    }, signature);

    // Wait for verification and redirect to success page
    console.log('Waiting for verification and navigation to success page...');
    await new Promise(r => setTimeout(r, 5000));

    console.log('Current URL after payment:', page.url());
    await page.screenshot({ path: 'online_success_page.png' });
    console.log('Screenshot saved: online_success_page.png');

    // Print final page content
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
