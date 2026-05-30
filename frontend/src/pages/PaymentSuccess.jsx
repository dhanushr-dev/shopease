import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { HiOutlineCheckCircle, HiOutlinePrinter, HiOutlineShoppingBag, HiOutlineClipboardList } from 'react-icons/hi';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if no order state
  useEffect(() => {
    if (!location.state || !location.state.order) {
      navigate('/orders');
    }
  }, [location.state, navigate]);

  // Confetti Particle Effect inside canvas
  useEffect(() => {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const particles = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    }));

    let animationFrameId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.tiltAngle) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 15;

        if (p.y <= canvas.height) {
          active = true;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      if (active) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [location.state]);

  if (!location.state || !location.state.order) return null;

  const { order } = location.state;
  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

  const getDeliveryDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 4);
    return today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="relative min-h-screen bg-surface-50 flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Canvas for Falling Confetti */}
      <canvas id="confetti-canvas" className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-xl border border-surface-200 p-8 text-center animate-fade-in z-20">
        {/* Animated Check Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Green glowing background rings */}
            <div className="absolute inset-0 bg-emerald-100 rounded-full scale-125 animate-ping opacity-25"></div>
            <HiOutlineCheckCircle className="w-20 h-20 text-emerald-500 animate-bounce" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold font-display text-surface-900 mb-2">
          {order.paymentStatus === 'PAID' ? 'Order Confirmed!' : order.paymentMethod === 'COD' ? 'Order Confirmed!' : 'Order Placed!'}
        </h1>
        <p className="text-surface-500 mb-6">
          {order.paymentStatus === 'PAID' 
            ? 'Thank you for your purchase. Your payment was processed successfully.' 
            : order.paymentMethod === 'COD'
            ? 'Thank you for your purchase. Your order has been placed and will be paid on delivery.'
            : 'Thank you for your purchase. Your order is pending payment verification.'}
        </p>

        {/* Order Details Panel */}
        <div className="bg-surface-50 rounded-2xl p-5 border border-surface-200 text-left space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Order Number</span>
            <span className="font-bold text-surface-900 font-mono">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Total Amount</span>
            <span className="font-bold text-primary-600">{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Payment Status</span>
            <span className={`font-semibold px-2 py-0.5 rounded-md border text-xs ${
              order.paymentStatus === 'PAID'
                ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                : order.paymentStatus === 'PAYMENT_PENDING'
                ? 'text-amber-600 bg-amber-50 border-amber-100'
                : 'text-surface-600 bg-surface-50 border-surface-100'
            }`}>
              {order.paymentStatus || 'PENDING'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Payment Method</span>
            <span className="font-semibold text-surface-900">{order.paymentMethod || 'ONLINE'}</span>
          </div>
          <hr className="border-surface-200" />
          <div className="text-sm">
            <span className="text-surface-500 block mb-1">Estimated Delivery</span>
            <span className="font-semibold text-surface-800">🚚 By {getDeliveryDate()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            to="/orders" 
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
          >
            <HiOutlineClipboardList className="w-5 h-5" /> View Orders
          </Link>
          <Link 
            to="/products" 
            className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
          >
            <HiOutlineShoppingBag className="w-5 h-5" /> Keep Shopping
          </Link>
        </div>

        {/* Invoice option */}
        <div className="mt-6">
          <Link 
            to={`/orders/${order.id}/invoice`} 
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
          >
            <HiOutlinePrinter className="w-4 h-4" /> Download / Print Invoice
          </Link>
        </div>
      </div>
    </div>
  );
}
