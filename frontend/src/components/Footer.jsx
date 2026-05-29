import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';

/**
 * Footer component with links, branding, and social info.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Shop: [
      { label: 'All Products', to: '/products' },
      { label: 'Women\'s Fashion', to: '/products?category=1' },
      { label: 'Men\'s Fashion', to: '/products?category=2' },
      { label: 'Accessories', to: '/products?category=3' },
    ],
    Account: [
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/register' },
      { label: 'My Orders', to: '/orders' },
      { label: 'My Profile', to: '/profile' },
    ],
    Support: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Shipping Policy', to: '/shipping-policy' },
      { label: 'Return Policy', to: '/return-policy' },
    ],
  };

  return (
    <footer className="bg-surface-900 text-surface-300 mt-auto print:hidden">
      {/* Main Footer */}
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 
                            flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base font-display">SE</span>
              </div>
              <span className="text-2xl font-bold font-display text-white">
                Shop<span className="text-primary-400">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed mb-6 max-w-xs">
              Your premium fashion destination. Trendy outfits, stylish accessories, 
              and a seamless shopping experience.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@shopease.com"
                className="flex items-center gap-2 text-sm text-surface-400 hover:text-primary-400 transition-colors"
              >
                <HiOutlineMail className="w-4 h-4" />
                support@shopease.com
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2 text-sm text-surface-400 hover:text-primary-400 transition-colors"
              >
                <HiOutlinePhone className="w-4 h-4" />
                +91 98765 43210
              </a>
            </div>
          </div>

          {/* Link Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-surface-400 hover:text-primary-400 
                               transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-800">
        <div className="section-container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500">
            © {currentYear} ShopEase. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-surface-600">
              Built with ❤️ using React + Spring Boot
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
