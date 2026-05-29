import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus, HiOutlineShoppingBag, HiArrowLeft } from 'react-icons/hi';
import { handleImageError, getProductImage } from '../utils/imageUtils.js';

export default function Cart() {
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

  if (!isAuthenticated) {
    return (
      <div className="section-container py-20 text-center animate-fade-in">
        <div className="max-w-md mx-auto">
          <p className="text-6xl mb-4">🔒</p>
          <h2 className="text-2xl font-bold text-surface-800 font-display mb-2">Please Login</h2>
          <p className="text-surface-500 mb-6">You need to login to view your cart</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loader message="Loading cart..." />;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="section-container py-20 text-center animate-fade-in">
        <div className="max-w-md mx-auto">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold text-surface-800 font-display mb-2">Your cart is empty</h2>
          <p className="text-surface-500 mb-6">Looks like you haven't added anything yet</p>
          <Link to="/products" className="btn-primary gap-2"><HiOutlineShoppingBag className="w-5 h-5" /> Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="section-container py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-primary-600 mb-6 transition-colors">
          <HiArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
        <h1 className="page-title mb-8">Shopping Cart <span className="text-lg font-normal text-surface-400">({cart.totalItems} items)</span></h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4">
                <Link to={`/products/${item.productId}`} className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-surface-100 flex-shrink-0">
                  <img src={getProductImage({ imageUrl: item.productImageUrl, categoryName: item.categoryName })} alt={item.productName} className="w-full h-full object-cover" onError={(e) => handleImageError(e, item.categoryName)} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.productId}`} className="text-sm md:text-base font-semibold text-surface-900 hover:text-primary-600 transition-colors line-clamp-2">{item.productName}</Link>
                  {item.selectedVariant && (
                    <p className="text-sm text-surface-500 mt-1">{item.selectedVariant}</p>
                  )}
                  <p className="text-lg font-bold text-surface-900 mt-1">{formatPrice(item.productPrice)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden bg-white">
                      <button 
                        onClick={() => updateCartItem(item.id, item.quantity - 1)} 
                        disabled={item.quantity <= 1}
                        className={`p-2 transition-colors ${item.quantity <= 1 ? 'text-surface-300 cursor-not-allowed bg-surface-50' : 'hover:bg-surface-100 text-surface-600'}`}
                        title={item.quantity <= 1 ? "Minimum quantity reached" : "Decrease quantity"}
                      >
                        <HiOutlineMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-sm font-bold text-surface-900 border-x border-surface-100 min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateCartItem(item.id, item.quantity + 1)} 
                        disabled={item.quantity >= item.availableStock}
                        className={`p-2 transition-colors ${item.quantity >= item.availableStock ? 'text-surface-300 cursor-not-allowed bg-surface-50' : 'hover:bg-surface-100 text-surface-600'}`}
                        title={item.quantity >= item.availableStock ? "Maximum stock reached" : "Increase quantity"}
                      >
                        <HiOutlinePlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-surface-700">{formatPrice(item.subtotal)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">Clear Cart</button>
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-surface-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm"><span className="text-surface-500">Subtotal ({cart.totalItems} items)</span><span className="font-medium">{formatPrice(cart.totalAmount)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-surface-500">Shipping</span><span className="font-medium text-emerald-600">Free</span></div>
              </div>
              <hr className="border-surface-200 mb-4" />
              <div className="flex justify-between mb-6"><span className="text-base font-bold text-surface-900">Total</span><span className="text-xl font-bold text-surface-900">{formatPrice(cart.totalAmount)}</span></div>
              <Link to="/checkout" className="btn-primary w-full !py-3.5">Proceed to Checkout</Link>
              <p className="text-xs text-surface-400 text-center mt-3">Taxes calculated at checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
