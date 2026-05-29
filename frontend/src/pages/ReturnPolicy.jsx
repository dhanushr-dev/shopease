import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';

export default function ReturnPolicy() {
  return (
    <div className="animate-fade-in section-container py-12">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-surface-500 hover:text-primary-600 transition-colors w-fit">
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="max-w-3xl mx-auto card p-8 md:p-12">
        <h1 className="page-title mb-8 text-center border-b border-surface-100 pb-8">Return & Refund Policy</h1>
        
        <div className="space-y-8 text-surface-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">1. 7-Day Return Policy</h2>
            <p>We offer a hassle-free 7-day return policy for most items. If you are not satisfied with your purchase, you can initiate a return within 7 days from the date of delivery. Items must be unused, in their original packaging, and with all tags intact.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">2. Order Cancellation</h2>
            <p>You can cancel your order before it is shipped (Pending or Confirmed status). However, if your order is already Confirmed and processing has begun, a cancellation fee of 5% of the order value or ₹50 (whichever is higher) may apply.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">3. Replacement Policy</h2>
            <p>If you receive a defective, damaged, or incorrect item, you can request a free replacement within 7 days of delivery. Our support team will review your request and arrange a pickup of the original item.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">4. Non-Returnable Products</h2>
            <p>The following items are non-returnable and non-refundable due to hygiene and safety reasons:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Innerwear and Lingerie</li>
              <li>Beauty and personal care products</li>
              <li>Perishable goods (e.g., food items, flowers)</li>
              <li>Customized or personalized items</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">5. Refund Timeline</h2>
            <p>Once your returned item reaches our warehouse and passes the quality check, your refund will be processed.</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Online Payments (Credit/Debit Card, Net Banking, UPI):</strong> Refunds will be credited to the original source account within 5-7 business days.</li>
              <li><strong>Cash on Delivery (COD):</strong> For COD orders, you will be asked to provide your bank account details. The refund will be transferred via NEFT/IMPS within 3-5 business days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3 font-display">6. Damaged or Wrong Product Process</h2>
            <p>If you receive a damaged or incorrect product, please do not discard the packaging. Navigate to 'My Orders' and click 'Replace', provide the reason, and optionally upload photos if requested. We will prioritize your replacement or refund.</p>
          </section>

          <div className="bg-primary-50 p-6 rounded-xl border border-primary-100 mt-8">
            <h3 className="font-bold text-primary-900 mb-2">Have a question about your return?</h3>
            <p className="text-primary-700 mb-4">Our support team is ready to assist you.</p>
            <Link to="/contact" className="btn-primary !py-2 !px-4 text-sm inline-block">Contact Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
