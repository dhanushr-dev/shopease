import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI, orderAPI, couponAPI } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import Loader from '../components/Loader.jsx';
import toast from 'react-hot-toast';
import { HiOutlineLocationMarker, HiOutlineCheck, HiOutlineShieldCheck, HiOutlineTicket } from 'react-icons/hi';
import { handleImageError } from '../utils/imageUtils.js';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [placingStep, setPlacingStep] = useState('');
  const [notes, setNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('ONLINE');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => { 
    fetchAddresses(); 
    fetchCoupons();

    // Dynamically load Razorpay checkout SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await couponAPI.getActive();
      setAvailableCoupons(res.data.data || []);
    } catch (err) { console.error('Error fetching coupons:', err); }
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAddresses();
      const addrs = res.data.data || [];
      setAddresses(addrs);
      const defaultAddr = addrs.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
      else if (addrs.length > 0) setSelectedAddress(addrs[0].id);
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

  const handlePlaceOrderClick = () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    executePlaceOrder(paymentMethod);
  };

  const executePlaceOrder = async (method) => {
    try {
      setPlacing(true);
      setPlacingStep('Placing order...');

      const res = await orderAPI.create({ 
        addressId: selectedAddress, 
        notes: notes || null, 
        paymentMethod: method,
        couponCode: appliedCoupon?.code || null
      });

      if (res.data.success) {
        const orderData = res.data.data;

        if (method === 'ONLINE') {
          setPlacingStep('Opening Razorpay...');
          // Ensure Razorpay script is loaded
          if (!window.Razorpay) {
            toast.error('Payment gateway could not be loaded. Please refresh and try again.');
            setPlacing(false);
            setPlacingStep('');
            return;
          }
          const rzpKey = orderData.razorpayKeyId 
            || import.meta.env.VITE_RAZORPAY_KEY_ID 
            || 'rzp_test_SkaF96nrBA36yp';
          const options = {
            key: rzpKey,
            amount: Math.round(finalAmount * 100), // in paise
            currency: 'INR',
            name: 'ShopEase',
            description: 'E-commerce Purchase',
            order_id: orderData.razorpayOrderId,
            handler: async function (response) {
              try {
                setPlacing(true);
                setPlacingStep('Verifying payment...');
                const verifyRes = await orderAPI.verifyPayment(orderData.id, {
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId,
                  signature: response.razorpay_signature
                });

                if (verifyRes.data.success) {
                  toast.success('Payment verified! Order confirmed.');
                  await fetchCart();
                  navigate('/payment-success', { state: { order: verifyRes.data.data } });
                } else {
                  throw new Error('Payment verification failed');
                }
              } catch (err) {
                const msg = err.response?.data?.message || 'Payment verification failed. Please contact support.';
                toast.error(msg);
                setPlacing(false);
                setPlacingStep('');
              }
            },
            prefill: {
              name: JSON.parse(localStorage.getItem('shopease_user'))?.name || '',
              email: JSON.parse(localStorage.getItem('shopease_user'))?.email || '',
            },
            theme: {
              color: '#6366f1'
            },
            modal: {
              ondismiss: function() {
                setPlacing(false);
                setPlacingStep('');
                toast.error('Payment cancelled');
              }
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
          // Don't reset placing here — it stays true until handler runs or modal is dismissed
        } else {
          // Cash on Delivery
          toast.success(`Order placed! #${orderData.orderNumber}`);
          await fetchCart();
          navigate('/payment-success', { state: { order: orderData } });
        }
      } else {
        throw new Error(res.data.message || 'Order creation failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order. Please try again.';
      toast.error(msg);
      setPlacing(false);
      setPlacingStep('');
    }
  };

  if (loading) return <Loader message="Loading checkout..." />;

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalAmount = Math.max(0, cart.totalAmount - discountAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      const res = await couponAPI.apply({ code: couponCode, orderAmount: cart.totalAmount });
      setAppliedCoupon(res.data.data);
      toast.success('Coupon applied successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const getDeliveryEstimate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 5);
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="section-container py-20 text-center animate-fade-in">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-surface-800 font-display mb-2">Cart is empty</h2>
        <p className="text-surface-500 mb-6">Add some items before checking out</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in section-container py-8">
      <h1 className="page-title mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address + Payment + Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-surface-900 font-display flex items-center gap-2 mb-4">
              <HiOutlineLocationMarker className="w-5 h-5 text-primary-600" /> Shipping Address
            </h2>
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-surface-400 mb-4">No addresses saved</p>
                <Link to="/profile" className="btn-secondary">Add Address in Profile</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${selectedAddress === addr.id ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-1 w-4 h-4 text-primary-600" />
                    <div>
                      <p className="text-sm font-semibold text-surface-900">{addr.fullName}</p>
                      <p className="text-xs text-surface-600 mt-0.5">{addr.addressLine1}</p>
                      <p className="text-xs text-surface-600">{addr.city}, {addr.state} — {addr.postalCode}</p>
                      <p className="text-xs text-surface-500 mt-0.5">📞 {addr.phoneNumber}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-surface-900 font-display mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'}`}>
                <input type="radio" name="paymentMethod" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} className="w-4 h-4 text-primary-600" />
                <span className="font-medium text-surface-900">Online Payment</span>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'}`}>
                <input type="radio" name="paymentMethod" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-primary-600" />
                <span className="font-medium text-surface-900">Cash on Delivery</span>
              </label>
            </div>
          </div>

          {/* Order Notes */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-surface-900 font-display mb-4">Order Notes (optional)</h2>
            <textarea className="input-field min-h-[80px]" placeholder="Any special instructions..."
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          
          {/* Delivery Estimate */}
          <div className="card p-6 bg-primary-50 border-primary-100">
            <h2 className="text-sm font-bold text-primary-900 mb-2">Estimated Delivery</h2>
            <p className="text-primary-700 font-medium">Delivery by {getDeliveryEstimate()}</p>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="text-lg font-bold text-surface-900 mb-4">Order Summary</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-100 flex-shrink-0 border border-surface-200">
                    <img src={item.productImageUrl || 'https://placehold.co/100x100?text=Product'} alt="" className="w-full h-full object-cover" onError={(e) => handleImageError(e, "product")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-surface-900 truncate">{item.productName}</p>
                    {item.selectedVariant && (
                      <p className="text-[10px] text-surface-500 mt-0.5">{item.selectedVariant}</p>
                    )}
                    <p className="text-xs text-surface-500 mt-0.5">x{item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold">{formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>

            <hr className="border-surface-200 mb-4" />
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-surface-500">Subtotal</span><span className="font-medium">{formatPrice(cart.totalAmount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-surface-500">Shipping</span><span className="font-medium text-emerald-600">Free</span></div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
            </div>
            
            {/* Coupon Section */}
            <div className="mb-4 bg-surface-50 p-3 rounded-xl border border-surface-200">
              <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                <HiOutlineTicket className="w-4 h-4 text-primary-600" /> Apply Coupon
              </h4>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm border border-emerald-100">
                  <span className="font-semibold">{appliedCoupon.code} applied!</span>
                  <button onClick={handleRemoveCoupon} className="text-xs font-bold hover:text-emerald-900 underline">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code..." 
                    className="flex-1 input-field !py-1.5 !px-3 !text-sm"
                  />
                  <button type="submit" disabled={couponLoading || !couponCode.trim()} className="btn-secondary !py-1.5 !px-3 !text-sm">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              
              {availableCoupons.length > 0 && !appliedCoupon && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableCoupons.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => setCouponCode(c.code)}
                      className="text-xs px-2 py-1 bg-white border border-surface-200 rounded-md hover:border-primary-400 hover:text-primary-600 transition-colors"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-surface-200 mb-4" />
            <div className="flex justify-between mb-6">
              <span className="text-base font-bold text-surface-900">Total</span>
              <span className="text-xl font-bold text-surface-900">{formatPrice(finalAmount)}</span>
            </div>

            <button onClick={handlePlaceOrderClick} disabled={placing || !selectedAddress}
              className="btn-primary w-full !py-3.5 gap-2" id="place-order-btn">
              {placing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {placingStep || 'Processing...'}
                </span>
              ) : (<><HiOutlineCheck className="w-5 h-5" /> Place Order</>)}
            </button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-surface-400">
              <HiOutlineShieldCheck className="w-4 h-4" /> Secure checkout with ShopEase
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
