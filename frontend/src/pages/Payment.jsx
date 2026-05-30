import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { orderAPI } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import toast from 'react-hot-toast';
import { 
  HiOutlineShieldCheck, 
  HiOutlineCreditCard, 
  HiOutlineChevronLeft, 
  HiOutlineCheck, 
  HiOutlineLockClosed,
  HiOutlineBadgeCheck
} from 'react-icons/hi';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  // Redirect if no checkout state is found
  useEffect(() => {
    if (!location.state || !location.state.amount) {
      toast.error('Session expired or invalid checkout session');
      navigate('/cart');
    }
  }, [location.state, navigate]);

  // Load Razorpay Script
  useEffect(() => {
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

  const checkoutData = location.state || {};
  const { addressId, notes, couponCode, amount } = checkoutData;

  const [paymentType, setPaymentType] = useState('CARD'); // CARD, UPI, NETBANKING
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Card details states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  // UPI states
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);

  // Netbanking states
  const [selectedBank, setSelectedBank] = useState('');

  // Format currency
  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

  // Get Card Logo
  const getCardType = (number) => {
    const cleanNum = number.replace(/\D/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (cleanNum.startsWith('5')) return 'Mastercard';
    if (cleanNum.startsWith('6') || cleanNum.startsWith('8')) return 'RuPay';
    return 'Card';
  };

  // Card formatting
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(val);
    }
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length >= 2) {
      setExpiryDate(`${val.substring(0, 2)}/${val.substring(2)}`);
    } else {
      setExpiryDate(val);
    }
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 3) {
      setCvv(val);
    }
  };

  // Verify UPI
  const handleVerifyUpi = () => {
    if (!upiId.includes('@')) {
      toast.error('Invalid UPI ID format. Should be user@bank');
      return;
    }
    setUpiVerifying(true);
    setTimeout(() => {
      setUpiVerifying(false);
      setIsUpiVerified(true);
      toast.success('UPI ID verified successfully!');
    }, 1200);
  };

  // Handle Pay Action
  const handlePay = async (e) => {
    e.preventDefault();

    if (paymentType === 'CARD') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit Card Number');
        return;
      }
      if (!cardName.trim()) {
        toast.error('Please enter the Cardholder Name');
        return;
      }
      if (expiryDate.length !== 5) {
        toast.error('Please enter a valid Expiry Date (MM/YY)');
        return;
      }
      if (cvv.length !== 3) {
        toast.error('Please enter a valid 3-digit CVV');
        return;
      }
    } else if (paymentType === 'UPI') {
      if (!isUpiVerified) {
        toast.error('Please verify your UPI ID first');
        return;
      }
    } else if (paymentType === 'NETBANKING') {
      if (!selectedBank) {
        toast.error('Please select a Bank');
        return;
      }
    }

    try {
      setProcessing(true);
      setProcessingStep('Initiating order with backend...');

      // Call backend API to place order
      const res = await orderAPI.create({ 
        addressId, 
        notes, 
        paymentMethod: 'ONLINE',
        couponCode
      });

      if (res.data.success) {
        const orderData = res.data.data;

        // Check if Razorpay script is loaded
        if (window.Razorpay) {
          setProcessingStep('Opening secure payment portal...');
          const options = {
            key: orderData.razorpayKeyId || 'rzp_test_mockKeyId',
            amount: amount * 100, // in paise
            currency: 'INR',
            name: 'ShopEase',
            description: 'E-commerce Purchase',
            order_id: orderData.razorpayOrderId,
            handler: async function (response) {
              try {
                setProcessing(true);
                setProcessingStep('Verifying transaction...');
                const verifyRes = await orderAPI.verifyPayment(orderData.id, {
                  paymentId: response.razorpay_payment_id || 'pay_mock_' + Math.random().toString(36).substr(2, 9),
                  razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId,
                  signature: response.razorpay_signature || 'mock_signature'
                });

                if (verifyRes.data.success) {
                  toast.success('Payment verified successfully!');
                  await fetchCart();
                  navigate('/payment-success', { state: { order: verifyRes.data.data } });
                } else {
                  throw new Error('Payment verification failed');
                }
              } catch (err) {
                toast.error(err.response?.data?.message || 'Verification failed');
                setProcessing(false);
              }
            },
            prefill: {
              name: JSON.parse(localStorage.getItem('shopease_user'))?.name || '',
              email: JSON.parse(localStorage.getItem('shopease_user'))?.email || '',
            },
            theme: {
              color: '#6366f1' // Indigo
            },
            modal: {
              ondismiss: function() {
                setProcessing(false);
                toast.error('Payment cancelled');
              }
            }
          };
          try {
            const rzp = new window.Razorpay(options);
            rzp.open();
          } catch (rzpError) {
            console.warn('⚠️ Razorpay failed to open. Falling back to mock simulation...', rzpError);
            toast.warn('Using simulated secure payment channel');
            
            setProcessingStep('Simulating payment authorization...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            setProcessingStep('Verifying simulated payment...');
            const verifyRes = await orderAPI.verifyPayment(orderData.id, {
              paymentId: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
              razorpayOrderId: orderData.razorpayOrderId || 'order_mock_fallback',
              signature: 'mock_signature'
            });

            if (verifyRes.data.success) {
              toast.success('Simulated payment verified successfully!');
              await fetchCart();
              navigate('/payment-success', { state: { order: verifyRes.data.data } });
            } else {
              throw new Error('Simulated verification failed');
            }
          }
        } else {
          // Razorpay offline script fallback
          setProcessingStep('Razorpay offline. Simulating payment authorization...');
          await new Promise(resolve => setTimeout(resolve, 2000));

          setProcessingStep('Verifying mock payment...');
          const verifyRes = await orderAPI.verifyPayment(orderData.id, {
            paymentId: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
            razorpayOrderId: orderData.razorpayOrderId || 'order_mock_fallback',
            signature: 'mock_signature'
          });

          if (verifyRes.data.success) {
            toast.success('Mock payment verified successfully!');
            await fetchCart();
            navigate('/payment-success', { state: { order: verifyRes.data.data } });
          } else {
            throw new Error('Mock Verification failed');
          }
        }
      } else {
        throw new Error('Order creation failed on backend');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Transaction failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-10 px-4 md:px-8">
      {/* Processing Screen */}
      {processing && (
        <div className="fixed inset-0 bg-surface-950/85 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white">
          <div className="relative flex items-center justify-center mb-6">
            {/* Spinning loader */}
            <div className="w-20 h-20 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            <HiOutlineLockClosed className="absolute w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-bold font-display tracking-wide mb-2">Secure Transaction in Progress</h2>
          <p className="text-surface-300 animate-pulse text-center max-w-xs">{processingStep}</p>
          <div className="mt-8 flex items-center gap-1.5 text-xs text-surface-400">
            <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400" /> PCI-DSS Compliant 256-bit Encryption
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-surface-600 hover:text-primary-600 mb-6 transition-colors font-medium"
        >
          <HiOutlineChevronLeft className="w-5 h-5" /> Back to Checkout
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Payment Methods Section (Left) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card p-6 md:p-8 bg-white border border-surface-200">
              <h2 className="text-xl font-bold font-display text-surface-900 mb-6">Select Payment Method</h2>

              {/* Method Selector Tabs */}
              <div className="flex gap-2 p-1 bg-surface-100 rounded-xl mb-6">
                <button
                  onClick={() => setPaymentType('CARD')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                    ${paymentType === 'CARD' ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'}`}
                >
                  <HiOutlineCreditCard className="w-5 h-5" /> Card
                </button>
                <button
                  onClick={() => setPaymentType('UPI')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                    ${paymentType === 'UPI' ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'}`}
                >
                  📱 UPI
                </button>
                <button
                  onClick={() => setPaymentType('NETBANKING')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                    ${paymentType === 'NETBANKING' ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'}`}
                >
                  🏦 Netbanking
                </button>
              </div>

              {/* Card Payment Method */}
              {paymentType === 'CARD' && (
                <div className="space-y-6">
                  {/* Credit Card Graphic container */}
                  <div className="flex justify-center my-4" style={{ perspective: '1000px' }}>
                    <div 
                      className={`relative w-80 md:w-96 h-48 md:h-56 rounded-2xl text-white shadow-xl transition-transform duration-700 cursor-pointer`}
                      style={{ 
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                      }}
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      {/* CARD FRONT */}
                      <div 
                        className="absolute inset-0 w-full h-full p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-between"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="w-12 h-9 bg-yellow-400/80 rounded-md flex items-center justify-center border border-yellow-300">
                            {/* Chip details */}
                            <div className="grid grid-cols-3 w-8 h-6 border border-slate-900/10 opacity-60"></div>
                          </div>
                          <span className="font-bold tracking-wider text-sm text-indigo-300">{getCardType(cardNumber).toUpperCase()}</span>
                        </div>

                        {/* Card Number display */}
                        <div className="text-xl md:text-2xl font-mono tracking-widest text-center my-4 text-slate-100">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>

                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <div>
                            <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Card Holder</span>
                            <span className="font-semibold tracking-wide truncate max-w-[180px] block">
                              {cardName.toUpperCase() || 'YOUR NAME'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Expires</span>
                            <span className="font-semibold tracking-wide">
                              {expiryDate || 'MM/YY'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CARD BACK */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 py-6 flex flex-col justify-between"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        {/* Black magnetic stripe */}
                        <div className="w-full h-10 md:h-12 bg-black mt-2"></div>

                        {/* Signature + CVV box */}
                        <div className="px-6 flex items-center justify-end gap-3 mt-4">
                          <div className="w-3/5 h-8 bg-white/10 rounded flex items-center px-3 text-slate-400 text-xs italic font-semibold">
                            authorized signature
                          </div>
                          <div className="w-16 h-8 bg-white rounded text-slate-900 font-mono font-bold flex items-center justify-center">
                            {cvv || '•••'}
                          </div>
                        </div>

                        {/* Info details */}
                        <div className="px-6 text-[9px] text-slate-500 text-center">
                          This is a secure simulated card. Do not share your real credentials.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Form */}
                  <form onSubmit={handlePay} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">Cardholder Name</label>
                      <input 
                        type="text" 
                        value={cardName} 
                        onChange={(e) => setCardName(e.target.value)}
                        onFocus={() => setIsFlipped(false)}
                        placeholder="John Doe" 
                        className="input-field" 
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">Card Number</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={cardNumber} 
                          onChange={handleCardNumberChange}
                          onFocus={() => setIsFlipped(false)}
                          placeholder="4000 1234 5678 9010" 
                          className="input-field pr-12 font-mono" 
                          maxLength="19"
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-surface-400">
                          {getCardType(cardNumber)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">Expiry Date</label>
                        <input 
                          type="text" 
                          value={expiryDate} 
                          onChange={handleExpiryChange}
                          onFocus={() => setIsFlipped(false)}
                          placeholder="MM/YY" 
                          className="input-field font-mono text-center" 
                          maxLength="5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">CVV / CVC</label>
                        <input 
                          type="password" 
                          value={cvv} 
                          onChange={handleCvvChange}
                          onFocus={() => setIsFlipped(true)}
                          onBlur={() => setIsFlipped(false)}
                          placeholder="•••" 
                          className="input-field font-mono text-center" 
                          maxLength="3"
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary w-full py-3.5 mt-6 flex items-center justify-center gap-2">
                      <HiOutlineLockClosed className="w-5 h-5" /> Pay {formatPrice(amount)}
                    </button>
                  </form>
                </div>
              )}

              {/* UPI Payment Method */}
              {paymentType === 'UPI' && (
                <div className="space-y-6">
                  <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center">
                    <p className="text-sm text-surface-600 mb-2 font-medium">Quick Scan Payment</p>
                    <div className="inline-block p-3 bg-white border border-surface-200 rounded-2xl shadow-sm mb-2">
                      {/* Generates a dummy QR pattern inside an SVG */}
                      <svg width="150" height="150" viewBox="0 0 100 100" className="mx-auto text-surface-900">
                        <rect x="0" y="0" width="25" height="25" fill="currentColor"/>
                        <rect x="5" y="5" width="15" height="15" fill="white"/>
                        <rect x="10" y="10" width="5" height="5" fill="currentColor"/>

                        <rect x="75" y="0" width="25" height="25" fill="currentColor"/>
                        <rect x="80" y="5" width="15" height="15" fill="white"/>
                        <rect x="85" y="10" width="5" height="5" fill="currentColor"/>

                        <rect x="0" y="75" width="25" height="25" fill="currentColor"/>
                        <rect x="5" y="80" width="15" height="15" fill="white"/>
                        <rect x="10" y="85" width="5" height="5" fill="currentColor"/>

                        {/* Random blocks for code simulation */}
                        <rect x="35" y="10" width="5" height="20" fill="currentColor"/>
                        <rect x="45" y="5" width="15" height="5" fill="currentColor"/>
                        <rect x="50" y="20" width="10" height="10" fill="currentColor"/>
                        <rect x="35" y="45" width="30" height="5" fill="currentColor"/>
                        <rect x="10" y="40" width="15" height="10" fill="currentColor"/>
                        <rect x="80" y="40" width="10" height="15" fill="currentColor"/>
                        <rect x="45" y="60" width="10" height="25" fill="currentColor"/>
                        <rect x="75" y="75" width="15" height="5" fill="currentColor"/>
                        <rect x="85" y="85" width="10" height="10" fill="currentColor"/>
                        <rect x="65" y="80" width="5" height="15" fill="currentColor"/>
                      </svg>
                    </div>
                    <p className="text-[10px] text-surface-400">Scan this QR code with any UPI app (GPay, PhonePe, Paytm)</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-surface-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-surface-500 font-semibold">Or Enter UPI ID</span>
                    </div>
                  </div>

                  <form onSubmit={handlePay} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">UPI ID / VPA</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input 
                            type="text" 
                            value={upiId} 
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setIsUpiVerified(false);
                            }}
                            placeholder="username@bank" 
                            className={`input-field pr-10 ${isUpiVerified ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-200' : ''}`} 
                            required
                          />
                          {isUpiVerified && (
                            <HiOutlineBadgeCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500" />
                          )}
                        </div>
                        <button 
                          type="button" 
                          onClick={handleVerifyUpi}
                          disabled={upiVerifying || !upiId.trim() || isUpiVerified}
                          className="btn-secondary whitespace-nowrap !py-2 !px-4"
                        >
                          {upiVerifying ? 'Verifying...' : isUpiVerified ? 'Verified' : 'Verify'}
                        </button>
                      </div>
                      <p className="text-[10px] text-surface-400 mt-1">E.g., mobile-number@upi, name@ybl, name@okaxis</p>
                    </div>

                    <button 
                      type="submit" 
                      disabled={!isUpiVerified}
                      className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-6
                        ${isUpiVerified 
                          ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20' 
                          : 'bg-surface-200 text-surface-400 cursor-not-allowed'}`}
                    >
                      <HiOutlineLockClosed className="w-5 h-5" /> Pay {formatPrice(amount)}
                    </button>
                  </form>
                </div>
              )}

              {/* Netbanking Method */}
              {paymentType === 'NETBANKING' && (
                <form onSubmit={handlePay} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-3">Popular Banks</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { id: 'SBI', name: 'SBI', icon: '🏦' },
                        { id: 'HDFC', name: 'HDFC Bank', icon: '🏦' },
                        { id: 'ICICI', name: 'ICICI Bank', icon: '🏦' },
                        { id: 'AXIS', name: 'Axis Bank', icon: '🏦' },
                        { id: 'KOTAK', name: 'Kotak Bank', icon: '🏦' },
                        { id: 'PNB', name: 'Punjab National', icon: '🏦' }
                      ].map((bank) => (
                        <label 
                          key={bank.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-surface-50
                            ${selectedBank === bank.id ? 'border-primary-500 bg-primary-50' : 'border-surface-200'}`}
                        >
                          <input 
                            type="radio" 
                            name="bank" 
                            value={bank.id} 
                            checked={selectedBank === bank.id} 
                            onChange={(e) => setSelectedBank(e.target.value)} 
                            className="w-4 h-4 text-primary-600" 
                          />
                          <div className="flex flex-col">
                            <span className="text-base">{bank.icon}</span>
                            <span className="text-xs font-semibold text-surface-900">{bank.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-2">Or Select Other Bank</label>
                    <select 
                      value={selectedBank} 
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Choose a bank...</option>
                      <option value="BOB">Bank of Baroda</option>
                      <option value="BOI">Bank of India</option>
                      <option value="CANARA">Canara Bank</option>
                      <option value="INDUSIND">IndusInd Bank</option>
                      <option value="YES">Yes Bank</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary w-full py-3.5 mt-6 flex items-center justify-center gap-2">
                    <HiOutlineLockClosed className="w-5 h-5" /> Pay {formatPrice(amount)}
                  </button>
                </form>
              )}
            </div>

            {/* Safety Badges */}
            <div className="flex justify-around items-center p-4 bg-surface-100 rounded-2xl border border-surface-200">
              <div className="flex items-center gap-2 text-xs text-surface-600 font-medium">
                <span className="text-lg">🔒</span> 256-Bit SSL Encryption
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-600 font-medium">
                <span className="text-lg">💳</span> PCI-DSS Compliant
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-600 font-medium">
                <span className="text-lg">🛡️</span> Safe & Secure
              </div>
            </div>
          </div>

          {/* Checkout Summary Panel (Right) */}
          <div className="lg:col-span-5 sticky top-6">
            <div className="card p-6 bg-white border border-surface-200">
              <h3 className="text-lg font-bold text-surface-900 mb-4 font-display">Payment Summary</h3>
              
              <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Order Subtotal</span>
                  <span className="font-semibold text-surface-800">{formatPrice(checkoutData.subtotal || amount)}</span>
                </div>
                {checkoutData.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Coupon Discount {couponCode ? `(${couponCode})` : ''}</span>
                    <span className="font-semibold">-{formatPrice(checkoutData.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Shipping Charges</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <hr className="border-surface-200" />
                <div className="flex justify-between text-base">
                  <span className="font-bold text-surface-900">Total Payable Amount</span>
                  <span className="font-extrabold text-lg text-primary-600">{formatPrice(amount)}</span>
                </div>
              </div>

              {/* Note about dummy simulator */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex gap-2">
                <span className="text-base flex-shrink-0">⚠️</span>
                <div>
                  <p className="font-bold">Dummy Payment Mode</p>
                  <p className="text-amber-700/90 mt-0.5">This application is running in mock payment mode. You can enter any 16-digit number to successfully complete card payments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
