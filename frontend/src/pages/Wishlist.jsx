import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Loader from '../components/Loader.jsx';
import { handleImageError, getProductImage } from '../utils/imageUtils.js';
import { HiOutlineHeart, HiOutlineShoppingCart, HiOutlineTrash } from 'react-icons/hi';

export default function Wishlist() {
  const { wishlist, loading, fetchWishlist, removeFromWishlist, moveToCart } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) return <Loader message="Loading wishlist..." />;

  return (
    <div className="animate-fade-in section-container py-8 min-h-[70vh]">
      <h1 className="page-title mb-8 flex items-center gap-3">
        <HiOutlineHeart className="w-8 h-8 text-primary-600" /> My Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-surface-50 rounded-3xl border border-surface-200">
          <p className="text-6xl mb-4 text-surface-300">💝</p>
          <h2 className="text-2xl font-bold text-surface-800 font-display mb-2">Your wishlist is empty</h2>
          <p className="text-surface-500 mb-6">Save items you love here to buy them later.</p>
          <Link to="/products" className="btn-primary gap-2">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="card group bg-white border border-surface-200 hover:border-primary-300 transition-all duration-300">
              {/* Image Container */}
              <Link to={`/products/${item.productId}`} className="block relative overflow-hidden bg-surface-100 aspect-square">
                <img
                  src={getProductImage({ imageUrl: item.productImageUrl, categoryName: item.categoryName })}
                  alt={item.productName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  loading="lazy"
                  onError={(e) => handleImageError(e, item.categoryName)}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(item.productId);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full 
                           shadow-md transition-all duration-300 hover:bg-red-50 text-surface-400 hover:text-red-500"
                  title="Remove from Wishlist"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
                {item.productStock === 0 && (
                  <div className="absolute inset-0 bg-surface-900/60 flex items-center justify-center">
                    <span className="px-4 py-2 bg-white/90 rounded-lg text-sm font-semibold text-surface-900">
                      Out of Stock
                    </span>
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="p-4 flex flex-col h-[180px]">
                {item.brand && (
                  <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">
                    {item.brand}
                  </p>
                )}
                <Link to={`/products/${item.productId}`}>
                  <h3 className="text-sm font-semibold text-surface-900 line-clamp-2 mb-2 
                                group-hover:text-primary-600 transition-colors duration-200">
                    {item.productName}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mt-auto mb-4">
                  <span className="text-lg font-bold text-surface-900">
                    {formatPrice(item.productPrice)}
                  </span>
                  {item.productStock > 0 && item.productStock <= 5 && (
                    <span className="text-xs text-amber-600 font-medium">
                      Only {item.productStock} left
                    </span>
                  )}
                </div>

                <button
                  onClick={() => moveToCart(item.productId)}
                  disabled={item.productStock === 0}
                  className="btn-primary w-full py-2.5 text-sm gap-2 mt-auto"
                >
                  <HiOutlineShoppingCart className="w-4 h-4" /> 
                  {item.productStock === 0 ? 'Out of Stock' : 'Move to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
