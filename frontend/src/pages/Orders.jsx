import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import { handleImageError } from '../utils/imageUtils.js';
import { HiOutlineShoppingBag, HiOutlineEye, HiOutlineDocumentText } from 'react-icons/hi';
import OrderTimeline from '../components/OrderTimeline.jsx';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // 'cancel', 'return', 'replace'
  const [actionOrder, setActionOrder] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionComments, setActionComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [trackingData, setTrackingData] = useState({});

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getAll();
      setOrders(res.data.data || []);
    } catch (err) { console.error('Failed to fetch orders:', err); }
    finally { setLoading(false); }
  };

  const handleActionClick = (action, order) => {
    setSelectedAction(action);
    setActionOrder(order);
    setActionReason('');
    setActionComments('');
    setShowModal(true);
  };

  const handleOrderExpand = async (orderId) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
      return;
    }
    setSelectedOrder(orderId);
    
    // Fetch tracking data if not already loaded
    if (!trackingData[orderId]) {
      try {
        const res = await orderAPI.getTracking(orderId);
        setTrackingData(prev => ({ ...prev, [orderId]: res.data.data }));
      } catch (err) {
        console.error('Failed to fetch tracking data', err);
      }
    }
  };

  const submitAction = async () => {
    try {
      setActionLoading(true);
      if (selectedAction === 'cancel') {
        const res = await orderAPI.cancel(actionOrder.id);
        toast.success(res.data.message || 'Order cancelled successfully');
      } else if (selectedAction === 'return') {
        const res = await orderAPI.requestReturn(actionOrder.id, { reason: actionReason, comments: actionComments });
        toast.success(res.data.message || 'Return requested successfully');
      } else if (selectedAction === 'replace') {
        const res = await orderAPI.requestReplacement(actionOrder.id, { reason: actionReason, comments: actionComments });
        toast.success(res.data.message || 'Replacement requested successfully');
      }
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${selectedAction} order`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const statusColors = {
    PENDING: 'badge-warning',
    CONFIRMED: 'badge-primary',
    SHIPPED: 'bg-blue-100 text-blue-700',
    OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'badge-success',
    CANCELLED: 'badge-danger',
  };

  if (loading) return <Loader message="Loading orders..." />;

  return (
    <div className="animate-fade-in section-container py-8">
      <h1 className="page-title mb-8 flex items-center gap-3">
        <HiOutlineShoppingBag className="w-8 h-8 text-primary-600" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📦</p>
          <h2 className="text-2xl font-bold text-surface-800 font-display mb-2">No orders yet</h2>
          <p className="text-surface-500 mb-6">Start shopping and your orders will appear here</p>
          <Link to="/products" className="btn-primary gap-2"><HiOutlineShoppingBag className="w-5 h-5" /> Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-surface-50 border-b border-surface-200">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs text-surface-500 uppercase tracking-wider">Order #</p>
                    <p className="text-sm font-bold text-surface-900">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 uppercase tracking-wider">Date</p>
                    <p className="text-sm text-surface-700">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 uppercase tracking-wider">Total</p>
                    <p className="text-sm font-bold text-surface-900">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${statusColors[order.status] || 'badge-primary'}`}>{order.status}</span>
                  <button onClick={() => handleOrderExpand(order.id)}
                    className="btn-ghost !px-3 !py-1.5 gap-1 text-xs">
                    <HiOutlineEye className="w-4 h-4" /> {selectedOrder === order.id ? 'Hide' : 'Details'}
                  </button>
                  <Link to={`/orders/${order.id}/invoice`} className="btn-secondary !px-3 !py-1.5 gap-1 text-xs border-surface-200">
                    <HiOutlineDocumentText className="w-4 h-4" /> Invoice
                  </Link>
                </div>
              </div>

              {/* Order Items & Timeline (expandable) */}
              {selectedOrder === order.id && (
                <div className="px-6 py-4 animate-slide-down bg-white">
                  
                  {/* Tracking Timeline */}
                  <div className="mb-8 border-b border-surface-100 pb-6">
                    <h3 className="text-sm font-bold text-surface-900 mb-4 uppercase tracking-wider">Tracking Timeline</h3>
                    <OrderTimeline history={trackingData[order.id] || []} currentStatus={order.status} />
                  </div>

                  <h3 className="text-sm font-bold text-surface-900 mb-4 uppercase tracking-wider">Order Items</h3>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                          <img src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} alt={item.productName} className="w-full h-full object-cover" onError={(e) => handleImageError(e, "product")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">{item.productName}</p>
                          {item.selectedVariant && (
                            <p className="text-xs text-surface-500 mb-1">{item.selectedVariant}</p>
                          )}
                          <p className="text-xs text-surface-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <p className="text-sm font-semibold text-surface-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-surface-100 flex justify-end">
                    <div className="w-64 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-surface-500">Subtotal:</span>
                        <span className="font-medium">{formatPrice(order.totalAmount + (order.discountAmount || 0))}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}:</span>
                          <span>-{formatPrice(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base border-t border-surface-100 pt-2 mt-2">
                        <span>Total:</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mt-4 pt-4 border-t border-surface-100">
                      <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Shipping To</p>
                      <p className="text-sm text-surface-700">
                        {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1},
                        {order.shippingAddress.city} — {order.shippingAddress.postalCode}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-surface-100 flex flex-wrap gap-2 justify-end">
                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                      <button onClick={() => handleActionClick('cancel', order)} className="btn-secondary !text-red-600 border-red-200 hover:bg-red-50 !py-1.5 !text-xs">
                        Cancel Order
                      </button>
                    )}
                    {order.status === 'DELIVERED' && (
                      <>
                        <button onClick={() => handleActionClick('return', order)} className="btn-secondary !py-1.5 !text-xs">
                          Return
                        </button>
                        <button onClick={() => handleActionClick('replace', order)} className="btn-secondary !py-1.5 !text-xs">
                          Replace
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedAction && actionOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-surface-900 mb-4 font-display capitalize">{selectedAction} Order</h3>
            <p className="text-surface-600 mb-4">
              {selectedAction === 'cancel' && "Are you sure you want to cancel this order? A cancellation fee of 5% or Rs 50 (whichever is higher) may apply if the order is already confirmed."}
              {selectedAction === 'return' && "Please provide a reason for returning this order."}
              {selectedAction === 'replace' && "Please provide a reason for requesting a replacement."}
            </p>
            
            {(selectedAction === 'return' || selectedAction === 'replace') && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-surface-700 block mb-1">Reason *</label>
                  <select className="input-field" value={actionReason} onChange={(e) => setActionReason(e.target.value)}>
                    <option value="">Select a reason</option>
                    <option value="Damaged Product">Damaged Product</option>
                    <option value="Wrong Item Received">Wrong Item Received</option>
                    <option value="Not as Expected">Not as Expected</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-surface-700 block mb-1">Comments (optional)</label>
                  <textarea className="input-field min-h-[80px]" value={actionComments} onChange={(e) => setActionComments(e.target.value)}></textarea>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={submitAction} disabled={actionLoading || ((selectedAction === 'return' || selectedAction === 'replace') && !actionReason)} className="btn-primary flex-1">
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
              <button onClick={() => setShowModal(false)} disabled={actionLoading} className="btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
