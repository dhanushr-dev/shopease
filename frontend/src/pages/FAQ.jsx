import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

const faqs = [
  {
    category: "Account & Login",
    questions: [
      { q: "How do I create an account?", a: "Click on 'Register' at the top right of the page. Fill in your details like Name, Email, and Password to create an account instantly." },
      { q: "I forgot my password, what should I do?", a: "Currently, password reset functionality is under development. Please contact our support team to get your password manually reset." },
    ]
  },
  {
    category: "Orders",
    questions: [
      { q: "How can I track my order?", a: "You can track your order by going to 'My Orders' in your profile section. The status of your order will be updated there." },
      { q: "Can I cancel my order?", a: "Yes, you can cancel an order if it is in PENDING or CONFIRMED state. A cancellation fee of 5% or Rs 50 (whichever is higher) may apply for confirmed orders." },
    ]
  },
  {
    category: "Payment",
    questions: [
      { q: "What payment methods do you accept?", a: "We accept Online Payment (Credit/Debit Cards, UPI, Net Banking) and Cash on Delivery (COD)." },
      { q: "Is Cash on Delivery available everywhere?", a: "COD is available for most pin codes across India. If your area is not serviceable for COD, the option will be disabled during checkout." },
      { q: "Is my online payment secure?", a: "Yes, we use industry-standard encryption and partner with trusted payment gateways to ensure your transactions are 100% secure." },
    ]
  },
  {
    category: "Returns & Refunds",
    questions: [
      { q: "What is your return policy?", a: "We offer a 7-day return policy for eligible products. You can initiate a return from the 'My Orders' page." },
      { q: "How do I request a replacement?", a: "If you received a damaged or incorrect product, you can request a replacement within 7 days from the 'My Orders' section." },
      { q: "When will I get my refund?", a: "Refunds are processed within 5-7 business days after the returned product passes our quality check." },
    ]
  },
  {
    category: "Shipping",
    questions: [
      { q: "How long does delivery take?", a: "Standard delivery takes 3-5 business days. Metro cities usually receive orders within 2-3 business days." },
      { q: "Do you charge for shipping?", a: "Shipping is free for orders above ₹500. A nominal fee of ₹40 is charged for orders below this amount." },
    ]
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="animate-fade-in section-container py-12">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-surface-500 hover:text-primary-600 transition-colors w-fit">
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="page-title mb-4">Frequently Asked Questions</h1>
        <p className="text-surface-600 text-lg">Find answers to common questions about our services</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {faqs.map((category, catIdx) => (
          <div key={catIdx} className="card p-6 md:p-8">
            <h2 className="text-xl font-bold text-surface-900 mb-6 font-display border-b border-surface-100 pb-4">
              {category.category}
            </h2>
            <div className="space-y-4">
              {category.questions.map((faq, qIdx) => {
                const idx = `${catIdx}-${qIdx}`;
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} className="border border-surface-200 rounded-xl overflow-hidden">
                    <button
                      className="w-full px-6 py-4 text-left flex justify-between items-center bg-surface-50 hover:bg-surface-100 transition-colors"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                    >
                      <span className="font-semibold text-surface-900">{faq.q}</span>
                      {isOpen ? <HiOutlineChevronUp className="w-5 h-5 text-surface-500" /> : <HiOutlineChevronDown className="w-5 h-5 text-surface-500" />}
                    </button>
                    {isOpen && (
                      <div className="px-6 py-4 bg-white text-surface-600 leading-relaxed border-t border-surface-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <p className="text-surface-600 mb-4">Still have questions?</p>
        <Link to="/contact" className="btn-primary">Contact Support</Link>
      </div>
    </div>
  );
}
