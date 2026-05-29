import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI, bannerAPI } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import { handleImageError, handleCategoryImageError, getCategoryImage, getProductImage } from '../utils/imageUtils.js';
import {
  HiOutlineArrowRight,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineCurrencyRupee,
  HiOutlineSupport,
} from 'react-icons/hi';

/**
 * Home page — hero section, featured categories, featured products, features.
 */
export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const recent = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    setRecentProducts(recent);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productRes, categoryRes, bannerRes] = await Promise.allSettled([
        productAPI.getAll({ page: 0, size: 8 }),
        categoryAPI.getAll(),
        bannerAPI.getActive(),
      ]);

      if (productRes.status === 'fulfilled' && productRes.value.data) {
        const data = productRes.value.data;
        setProducts(data.data?.content || data.content || data.data || []);
      }
      if (categoryRes.status === 'fulfilled' && categoryRes.value.data) {
        const data = categoryRes.value.data;
        setCategories(data.data || []);
      }
      if (bannerRes.status === 'fulfilled' && bannerRes.value.data) {
        setBanners(bannerRes.value.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const features = [
    {
      icon: HiOutlineTruck,
      title: 'Free Shipping',
      description: 'Free shipping on orders above ₹999',
    },
    {
      icon: HiOutlineShieldCheck,
      title: 'Secure Payments',
      description: '100% secure payment with Razorpay',
    },
    {
      icon: HiOutlineCurrencyRupee,
      title: 'Best Prices',
      description: 'Guaranteed best prices on all products',
    },
    {
      icon: HiOutlineSupport,
      title: '24/7 Support',
      description: 'Round the clock customer support',
    },
  ];


  return (
    <div className="animate-fade-in">
      {/* ===== HERO SECTION ===== */}
      {banners.length > 0 ? (
        <section className="relative overflow-hidden bg-surface-900 group">
          <div className="absolute inset-0 transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentBannerIdx * 100}%)`, display: 'flex' }}>
            {banners.map((banner) => (
              <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-[500px] md:h-[600px] object-cover opacity-60" onError={(e) => handleImageError(e, "banner")} />
                <div className="absolute inset-0 bg-gradient-to-r from-surface-900/80 to-transparent flex flex-col justify-center px-8 md:px-24">
                  <div className="max-w-3xl animate-slide-up">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-display">{banner.title}</h1>
                    {banner.subtitle && <p className="text-lg md:text-xl text-surface-200 mb-8">{banner.subtitle}</p>}
                    {banner.buttonText && (
                      <Link to={banner.buttonLink || '/products'} className="btn-primary !py-3.5 !px-8 !text-base">
                        {banner.buttonText}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Navigation Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {banners.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentBannerIdx(idx)} 
                  className={`w-3 h-3 rounded-full transition-colors ${idx === currentBannerIdx ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`} 
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="relative overflow-hidden bg-gradient-to-br from-surface-950 via-surface-900 to-primary-950">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] 
                          bg-gradient-radial from-primary-500/10 to-transparent rounded-full" />
          </div>

          <div className="relative section-container py-20 md:py-32 lg:py-40">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm 
                            rounded-full border border-white/10 mb-6 animate-slide-up">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white/80">
                  New Collection Available — Shop Now
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight 
                           font-display animate-slide-up"
                  style={{ animationDelay: '0.1s' }}>
                Discover Your
                <span className="block text-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-pink-400">
                  Perfect Style
                </span>
              </h1>
              <p className="text-lg md:text-xl text-surface-300 mb-8 max-w-xl leading-relaxed 
                          animate-slide-up"
                 style={{ animationDelay: '0.2s' }}>
                Premium fashion at unbeatable prices. From designer outfits to 
                trendy accessories — find everything you love, all in one place.
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Link
                  to="/products"
                  className="btn-primary !py-3.5 !px-8 !text-base gap-2 group"
                  id="hero-shop-now"
                >
                  Shop Now
                  <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/products?category=1"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold 
                           text-white border border-white/20 rounded-xl hover:bg-white/10 
                           transition-all duration-300"
                >
                  Explore Categories
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10 animate-slide-up"
                   style={{ animationDelay: '0.4s' }}>
                {[
                  { value: '10K+', label: 'Happy Customers' },
                  { value: '500+', label: 'Products' },
                  { value: '99%', label: 'Satisfaction' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl md:text-3xl font-bold text-white font-display">
                      {stat.value}
                    </p>
                    <p className="text-sm text-surface-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURES BAR ===== */}
      <section className="bg-white border-b border-surface-200">
        <div className="section-container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3 group">
                <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 
                              group-hover:bg-primary-600 group-hover:text-white 
                              transition-all duration-300">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900">{feature.title}</p>
                  <p className="text-xs text-surface-500 hidden sm:block">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="section-container py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="page-title">Shop by Category</h2>
            <p className="page-subtitle">Explore our curated collections</p>
          </div>
          <Link
            to="/products"
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-primary-600 
                     hover:text-primary-700 transition-colors group"
          >
            View All
            <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {(categories.length > 0
            ? categories.filter(c => c.active !== false).slice(0, 8)
            : [
                { id: 1, name: 'Electronics', description: 'Latest gadgets & devices' },
                { id: 2, name: 'Fashion', description: 'Trendy fashion wear' },
                { id: 3, name: 'Furniture', description: 'Home decor & essentials' },
                { id: 4, name: 'Books', description: 'Read and learn' },
              ]
          ).map((cat, index) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer"
              id={`category-card-${cat.id}`}
            >
              <img
                src={getCategoryImage(cat.name, cat.imageUrl)}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                onError={(e) => handleCategoryImageError(e, cat.name)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 via-surface-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white font-display mb-1 
                             group-hover:translate-y-0 transition-transform duration-300">
                  {cat.name}
                </h3>
                <p className="text-sm text-surface-300">
                  {cat.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-white mt-3 
                              opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 
                              transition-all duration-300">
                  Explore
                  <HiOutlineArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS SECTION ===== */}
      <section className="bg-surface-100/50 py-16 md:py-20">
        <div className="section-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="page-title">Featured Products</h2>
              <p className="page-subtitle">Handpicked just for you</p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center gap-1 text-sm font-semibold text-primary-600 
                       hover:text-primary-700 transition-colors group"
            >
              View All Products
              <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <Loader message="Loading products..." />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-surface-400 text-lg">No products available yet.</p>
              <p className="text-surface-400 text-sm mt-2">
                Start the backend server to see products from the database.
              </p>
            </div>
          )}

          <div className="md:hidden text-center mt-8">
            <Link to="/products" className="btn-primary gap-2">
              View All Products
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== RECENTLY VIEWED SECTION ===== */}
      {recentProducts.length > 0 && (
        <section className="section-container py-16 md:py-20 border-t border-surface-200">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="page-title">Recently Viewed</h2>
              <p className="page-subtitle">Based on your browsing history</p>
            </div>
            <button 
              onClick={() => { localStorage.removeItem('recently_viewed'); setRecentProducts([]); }}
              className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
            >
              Clear History
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {recentProducts.map((rp) => (
              <Link key={rp.id} to={`/products/${rp.id}`} className="group block">
                <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-surface-200 mb-3">
                  <img 
                    src={getProductImage(rp)} 
                    alt={rp.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => handleImageError(e, rp.categoryName)}
                  />
                </div>
                <p className="text-sm font-semibold text-surface-900 truncate group-hover:text-primary-600 transition-colors">{rp.name}</p>
                <p className="text-primary-600 font-bold text-xs mt-1">₹{rp.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== CTA SECTION ===== */}
      <section className="section-container py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-accent-700 
                      px-8 py-12 md:px-16 md:py-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-4">
              Get 20% Off Your First Order
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Sign up today and enjoy exclusive discounts, early access to new collections, 
              and personalized style recommendations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="inline-flex items-center justify-center px-8 py-3.5 
                            text-base font-semibold text-primary-700 bg-white rounded-xl 
                            hover:bg-surface-50 transition-all duration-300 
                            shadow-lg shadow-surface-900/10">
                Create Account
              </Link>
              <Link to="/products" className="inline-flex items-center justify-center px-8 py-3.5 
                            text-base font-semibold text-white border border-white/30 rounded-xl 
                            hover:bg-white/10 transition-all duration-300">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
