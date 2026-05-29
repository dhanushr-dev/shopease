import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import Loader from '../components/Loader';
import { HiPrinter, HiArrowLeft, HiDownload } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getInvoice(id);
        setOrder(res.data.data);
        setError(false);
      } catch (err) {
        setError(true);
        toast.error('Failed to load invoice');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(price || 0);
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/orders');
    }
  };

  if (loading) return <Loader message="Generating invoice..." />;
  if (error || !order) return (
    <div className="section-container py-20 text-center animate-fade-in print:hidden">
      <p className="text-5xl mb-4">⚠️</p>
      <h2 className="text-2xl font-bold text-surface-800 mb-2">Unable to load invoice. Please try again.</h2>
      <button onClick={() => navigate('/orders')} className="btn-primary mt-4">Back to Orders</button>
    </div>
  );

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = order.discountAmount || 0;

  return (
    <div className="bg-surface-50 min-h-screen py-8 print:bg-white print:min-h-0 print:py-0 print:m-0">
      <div className="max-w-4xl mx-auto px-4 print:max-w-none print:w-full print:px-0 print:mx-0">
        
        <div className="flex items-center gap-2 text-sm font-medium text-surface-500 mb-6 print:hidden">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/orders" className="hover:text-primary-600 transition-colors">Orders</Link>
          <span>/</span>
          <span className="text-surface-900">Invoice #{order.orderNumber}</span>
        </div>
        
        {/* Controls (Hidden in print) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button onClick={handleBack} className="btn-secondary gap-2 border-surface-200">
            <HiArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="flex gap-3">
            <button onClick={handlePrint} className="btn-secondary gap-2 border-surface-200">
              <HiPrinter className="w-5 h-5" /> Print Invoice
            </button>
            <button onClick={handlePrint} className="btn-primary gap-2">
              <HiDownload className="w-5 h-5" /> Download Invoice
            </button>
          </div>
        </div>

        {/* Invoice Paper */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-surface-200 print:shadow-none print:border-none print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-surface-200 pb-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center print:bg-black">
                  <span className="text-white font-bold text-sm font-display">SE</span>
                </div>
                <div>
                  <span className="text-2xl font-bold font-display text-surface-900 block leading-none">ShopEase</span>
                  <span className="text-xs text-surface-500 font-medium tracking-wide">MARKETPLACE</span>
                </div>
              </div>
              <p className="text-surface-600 text-sm">Full Stack E-Commerce Invoice</p>
              <p className="text-surface-500 text-sm mt-4">123 Tech Park, MG Road</p>
              <p className="text-surface-500 text-sm">Bengaluru, India 560001</p>
              <p className="text-surface-500 text-sm">support@shopease.com</p>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold text-surface-900 font-display mb-2 uppercase tracking-tight print:text-black">Invoice</h1>
              <p className="text-surface-600 font-bold text-lg">#{order.orderNumber}</p>
              <div className="mt-4 text-sm text-surface-600 space-y-1">
                <p>Invoice Date: <span className="font-medium">{formatDate(order.createdAt)}</span></p>
                <p>Order Date: <span className="font-medium">{formatDate(order.createdAt)}</span></p>
                <p>Payment Method: <span className="font-medium">{order.paymentMethod || 'ONLINE'}</span></p>
                <p>Payment Status: <span className="font-bold text-surface-900 print:text-black">{order.paymentStatus || 'PAID'}</span></p>
                <p>Order Status: <span className="font-bold text-primary-600 print:text-black">{order.status}</span></p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Billed To</h3>
              <p className="font-semibold text-surface-900">{order.userName}</p>
              <p className="text-surface-600 text-sm">{order.userEmail}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Shipped To</h3>
              {order.shippingAddress ? (
                <>
                  <p className="font-semibold text-surface-900">{order.shippingAddress.fullName}</p>
                  <p className="text-surface-600 text-sm">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p className="text-surface-600 text-sm">{order.shippingAddress.addressLine2}</p>}
                  <p className="text-surface-600 text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-surface-600 text-sm mt-1">Phone: {order.shippingAddress.phone}</p>
                </>
              ) : (
                <p className="text-surface-600 text-sm">Address not available</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-surface-200">
                  <th className="py-3 px-2 text-xs font-bold text-surface-400 uppercase tracking-wider w-16">Sl No</th>
                  <th className="py-3 px-2 text-xs font-bold text-surface-400 uppercase tracking-wider">Product</th>
                  <th className="py-3 px-2 text-xs font-bold text-surface-400 uppercase tracking-wider text-center">Qty</th>
                  <th className="py-3 px-2 text-xs font-bold text-surface-400 uppercase tracking-wider text-right">Unit Price</th>
                  <th className="py-3 px-2 text-xs font-bold text-surface-400 uppercase tracking-wider text-right">Discount</th>
                  <th className="py-3 px-2 text-xs font-bold text-surface-400 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {order.items.map((item, idx) => {
                  // Assuming item discount isn't tracked per item, just put 0 unless it exists
                  const itemDiscount = 0; 
                  return (
                  <tr key={idx} className="group">
                    <td className="py-4 px-2 text-sm text-surface-600">{idx + 1}</td>
                    <td className="py-4 px-2">
                      <p className="font-semibold text-surface-900 text-sm">{item.productName}</p>
                      {item.selectedVariant && (
                        <p className="text-xs text-surface-500 mt-1">{item.selectedVariant}</p>
                      )}
                    </td>
                    <td className="py-4 px-2 text-center text-surface-600 text-sm">{item.quantity}</td>
                    <td className="py-4 px-2 text-right text-surface-600 text-sm">{formatPrice(item.price)}</td>
                    <td className="py-4 px-2 text-right text-surface-600 text-sm">{itemDiscount > 0 ? formatPrice(itemDiscount) : '-'}</td>
                    <td className="py-4 px-2 text-right font-medium text-surface-900 text-sm">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end border-t border-surface-200 pt-6">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-surface-600 text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 text-sm font-medium">
                  <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-surface-600 text-sm">
                <span>Delivery Charge</span>
                <span>Free</span>
              </div>
              {['CANCELLED', 'REFUND_COMPLETED'].includes(order.status) && (
                <div className="flex justify-between text-red-600 text-sm font-medium">
                  <span>Refund / Cancellation</span>
                  <span>-{formatPrice(order.totalAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-surface-200 pt-4 mt-4">
                <span className="font-bold text-surface-900 uppercase">Grand Total</span>
                <span className="text-2xl font-bold text-primary-600 print:text-black font-display">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-surface-600 text-sm mt-2">
                <span>Amount Paid</span>
                <span className="font-medium text-surface-900 print:text-black">{formatPrice(['CANCELLED', 'REFUND_COMPLETED', 'PENDING'].includes(order.status) ? 0 : order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-surface-200 text-center text-surface-500 text-sm">
            <p className="font-medium text-surface-900 mb-1">Thank you for shopping with ShopEase!</p>
            <p>This is a computer-generated invoice and does not require a physical signature.</p>
            <p className="mt-2">For any queries, contact <a href="mailto:support@shopease.com" className="text-primary-600 underline">support@shopease.com</a></p>
          </div>

        </div>
      </div>
    </div>
  );
}
