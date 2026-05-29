import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineSearch,
} from 'react-icons/hi';

/**
 * Navbar component with responsive design, search, cart badge, and auth menu.
 */
export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/contact', label: 'Support' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10 print:hidden">
      <div className="section-container">
        <nav className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 
                            flex items-center justify-center shadow-lg shadow-primary-500/25
                            group-hover:shadow-primary-500/40 transition-shadow duration-300">
              <span className="text-white font-bold text-sm font-display">SE</span>
            </div>
            <span className="text-xl font-bold font-display text-surface-900">
              Shop<span className="text-gradient">Ease</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive(link.to)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-surface-600 hover:text-primary-600 hover:bg-surface-100'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive('/admin')
                    ? 'text-accent-600 bg-accent-50'
                    : 'text-surface-600 hover:text-accent-600 hover:bg-surface-100'
                  }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 text-sm bg-surface-100 border border-surface-200 rounded-xl
                         placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 
                         focus:border-primary-400 focus:bg-white transition-all duration-200"
              />
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Wishlist Icon */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="relative p-2 rounded-xl text-surface-600 hover:text-red-500 
                           hover:bg-red-50 transition-all duration-200"
                title="Wishlist"
              >
                <HiOutlineHeart className="w-6 h-6" />
                {wishlist?.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center 
                                 text-xs font-bold text-white bg-red-500 rounded-full animate-scale-in">
                    {wishlist.length > 9 ? '9+' : wishlist.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-surface-600 hover:text-primary-600 
                         hover:bg-primary-50 transition-all duration-200"
              id="nav-cart-button"
            >
              <HiOutlineShoppingBag className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center 
                               text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-accent-500 
                               rounded-full animate-scale-in shadow-lg shadow-primary-500/30">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium 
                           text-surface-600 hover:text-primary-600 hover:bg-primary-50 
                           transition-all duration-200"
                  id="nav-profile-button"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 
                                flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{user?.name?.split(' ')[0]}</span>
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl 
                                  border border-surface-200/60 py-2 z-50 animate-slide-down">
                      <div className="px-4 py-3 border-b border-surface-100">
                        <p className="text-sm font-semibold text-surface-900">{user?.name}</p>
                        <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 
                                 hover:bg-surface-50 transition-colors"
                      >
                        <HiOutlineUser className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 
                                 hover:bg-surface-50 transition-colors"
                      >
                        <HiOutlineHeart className="w-4 h-4" />
                        My Wishlist
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 
                                 hover:bg-surface-50 transition-colors"
                      >
                        <HiOutlineShoppingBag className="w-4 h-4" />
                        My Orders
                      </Link>
                      <hr className="my-1 border-surface-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 
                                 hover:bg-red-50 transition-colors"
                        id="nav-logout-button"
                      >
                        <HiOutlineLogout className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost" id="nav-login-button">
                  Login
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-5 !text-sm" id="nav-register-button">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-surface-600 hover:bg-surface-100 
                       transition-colors duration-200"
              id="nav-mobile-toggle"
            >
              {mobileMenuOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-surface-200 shadow-xl animate-slide-down">
          <div className="section-container py-4 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-100 border border-surface-200 
                           rounded-xl placeholder:text-surface-400 focus:outline-none focus:ring-2 
                           focus:ring-primary-400 transition-all"
                />
              </div>
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all
                  ${isActive(link.to)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-surface-700 hover:bg-surface-100'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <hr className="border-surface-200" />

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 
                                flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900">{user?.name}</p>
                    <p className="text-xs text-surface-500">{user?.email}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-surface-700 hover:bg-surface-100 rounded-xl"
                >
                  My Profile
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-surface-700 hover:bg-surface-100 rounded-xl"
                >
                  My Wishlist
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-surface-700 hover:bg-surface-100 rounded-xl"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center btn-secondary !py-2.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center btn-primary !py-2.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
