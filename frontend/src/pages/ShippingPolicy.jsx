import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';

export default function ShippingPolicy() {
  return (
    <div className="animate-fade-in section-container py-12">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-surface-500 hover:text-primary-600 transition-colors w-fit">
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="max-w-3xl mx-auto card p-8 md:p-12">
        <h1 className="page-title mb-8 text-center border-b border-surface-100 pb-8">Shipping Policy</h1>
        
        <div className="space-y-8 text-surface-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">1. Delivery Time</h2>
            <p>We process all orders within 24-48 hours. Standard delivery typically takes 3-5 business days depending on your location. Metro cities usually receive orders within 2-3 business days, while remote locations may take up to 7 business days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">2. Shipping Charges</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Free shipping is available for all orders above ₹500.</li>
              <li>A flat shipping rate of ₹40 is applied to orders below ₹500.</li>
              <li>Express delivery (if available) incurs an additional charge of ₹100.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">3. Order Tracking</h2>
            <p>Once your order is shipped, you will receive an email and SMS with the tracking link. You can also track your order directly from the "My Orders" section in your ShopEase account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">4. Delivery Locations</h2>
            <p>ShopEase delivers across all major pin codes in India. If your area is not serviceable by our courier partners, we will notify you at the time of checkout.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">5. Cash on Delivery (COD) Availability</h2>
            <p>Cash on Delivery is available for most locations. The maximum order value for COD is ₹10,000. For higher value orders, please use our secure online payment methods.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">6. Damaged or Delayed Packages</h2>
            <p>If you receive a package that appears damaged or tampered with, please refuse delivery and contact us immediately. For delayed orders (exceeding 7 business days), please reach out to our support team.</p>
          </section>

          <div className="bg-primary-50 p-6 rounded-xl border border-primary-100 mt-8">
            <h3 className="font-bold text-primary-900 mb-2">Need help with shipping?</h3>
            <p className="text-primary-700 mb-4">Our support team is available Monday to Saturday, 9 AM to 6 PM.</p>
            <Link to="/contact" className="btn-primary !py-2 !px-4 text-sm inline-block">Contact Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
