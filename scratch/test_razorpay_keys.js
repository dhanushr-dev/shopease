async function run() {
  const keyId = 'rzp_test_SkaF96nrBA36yp';
  const keySecret = 'KvKQ8aC4zBAxfuDUCG3Cu562';
  const orderId = 'order_SvTKPV4D8BCP9k'; // The order created in our previous test

  console.log(`Testing Razorpay credentials by fetching order ${orderId}...`);
  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
}

run();
