async function run() {
  const baseURL = 'http://localhost:8080/api';
  console.log('1. Logging in as john@example.com...');
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
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    const token = loginData.data.token;
    console.log('✅ Logged in successfully. Token acquired.');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('2. Fetching user addresses...');
    const addressRes = await fetch(`${baseURL}/users/addresses`, { headers });
    const addressData = await addressRes.json();
    const addresses = addressData.data;
    if (!addresses || addresses.length === 0) {
      console.log('❌ No shipping addresses found! Please add an address.');
      return;
    }
    const addressId = addresses[0].id;
    console.log(`✅ Found address ID: ${addressId}`);

    console.log('3. Fetching cart...');
    const cartRes = await fetch(`${baseURL}/cart`, { headers });
    const cartData = await cartRes.json();
    let cart = cartData.data;
    if (!cart.items || cart.items.length === 0) {
      console.log('🛒 Cart is empty. Adding a sample product to cart...');
      const addRes = await fetch(`${baseURL}/cart/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: 1,
          quantity: 1,
          selectedVariant: 'Default'
        })
      });
      const addData = await addRes.json();
      console.log('🛒 Add to cart response:', addData);
      
      const cartRes2 = await fetch(`${baseURL}/cart`, { headers });
      const cartData2 = await cartRes2.json();
      cart = cartData2.data;
    }
    console.log(`✅ Cart has ${cart.items.length} items. Total: ${cart.totalAmount}`);

    console.log('4. Placing a COD order...');
    const orderRes = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        addressId: addressId,
        paymentMethod: 'COD',
        notes: 'Test COD order'
      })
    });
    const orderData = await orderRes.json();
    console.log('✅ COD Order placement response Status:', orderRes.status);
    console.log('✅ COD Order placement response:', JSON.stringify(orderData, null, 2));

    console.log('5. Fetching cart again (should be cleared)...');
    const finalCartRes = await fetch(`${baseURL}/cart`, { headers });
    const finalCartData = await finalCartRes.json();
    console.log(`✅ Cart item count: ${finalCartData.data.items.length}`);

  } catch (err) {
    console.error('❌ Script failed:', err.message);
  }
}

run();
