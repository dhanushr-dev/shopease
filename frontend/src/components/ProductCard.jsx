import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlineStar, HiOutlineHeart, HiHeart, HiStar } from 'react-icons/hi';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { handleImageError, getProductImage } from '../utils/imageUtils.js';

/**
 * ProductCard component for displaying a product in a grid.
 */
export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product.id);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="card group cursor-pointer"
      id={`product-card-${product.id}`}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-surface-100 aspect-square">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => handleImageError(e, product.categoryName)}
        />
        {/* Quick Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl 
                   shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 
                   group-hover:translate-y-0 transition-all duration-300
                   hover:bg-primary-600 hover:text-white text-surface-700"
          title="Add to Cart"
        >
          <HiOutlineShoppingCart className="w-5 h-5" />
        </button>
        {/* Wishlist Toggle */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full 
                   shadow-md transition-all duration-300 hover:scale-110"
          title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {isInWishlist(product.id) ? (
            <HiHeart className="w-5 h-5 text-red-500" />
          ) : (
            <HiOutlineHeart className="w-5 h-5 text-surface-400 hover:text-red-500 transition-colors" />
          )}
        </button>
        {/* Category Badge */}
        {product.categoryName && (
          <span className="absolute top-3 left-3 badge-primary text-[10px] uppercase tracking-wider">
            {product.categoryName}
          </span>
        )}
        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-surface-900/60 flex items-center justify-center">
            <span className="px-4 py-2 bg-white/90 rounded-lg text-sm font-semibold text-surface-900">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">
            {product.brand}
          </p>
        )}
        {/* Name */}
        <h3 className="text-sm font-semibold text-surface-900 line-clamp-2 mb-2 
                      group-hover:text-primary-600 transition-colors duration-200">
          {product.name}
        </h3>
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            star <= Math.round(Number(product.averageRating || 0)) ? 
              <HiStar key={star} className="w-3.5 h-3.5 text-amber-400" /> :
              <HiOutlineStar key={star} className="w-3.5 h-3.5 text-surface-300" />
          ))}
          <span className="text-xs text-surface-400 ml-1">
            ({Number(product.averageRating || 0).toFixed(1)})
          </span>
          <span className="text-xs text-surface-400 ml-1">
            {product.reviewCount ? `(${product.reviewCount})` : ''}
          </span>
        </div>
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-surface-900">
            {formatPrice(product.price)}
          </span>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-xs text-amber-600 font-medium">
              Only {product.stock} left
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
