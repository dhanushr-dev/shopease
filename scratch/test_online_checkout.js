async function run() {
  const baseURL = 'http://localhost:8080/api';
  console.log('1. Logging in...');
  try {
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'user123',
        accountType: 'USER'
      })
    });

    const loginData = await loginRes.json();
    const token = loginData.data.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('2. Fetching user addresses...');
    const addressRes = await fetch(`${baseURL}/users/addresses`, { headers });
    const addressData = await addressRes.json();
    const addressId = addressData.data[0].id;

    console.log('3. Fetching cart...');
    // Add sample product if cart is empty
    await fetch(`${baseURL}/cart/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId: 2, quantity: 1, selectedVariant: 'Ivory' })
    });

    console.log('4. Placing an ONLINE order...');
    const orderRes = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        addressId: addressId,
        paymentMethod: 'ONLINE',
        notes: 'Test Online order'
      })
    });
    const orderData = await orderRes.json();
    console.log('Order Data Status:', orderRes.status);
    console.log('Order Data Response:', JSON.stringify(orderData, null, 2));

    if (orderRes.ok) {
      const order = orderData.data;
      console.log('5. Verifying Razorpay payment...');
      const verifyRes = await fetch(`${baseURL}/orders/${order.id}/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paymentId: 'pay_test_payment_id',
          razorpayOrderId: order.razorpayOrderId,
          signature: 'mock_signature'
        })
      });
      const verifyData = await verifyRes.json();
      console.log('Verify Response Status:', verifyRes.status);
      console.log('Verify Response:', JSON.stringify(verifyData, null, 2));
    }
  } catch (err) {
    console.error('❌ Script failed:', err.message);
  }
}

run();
