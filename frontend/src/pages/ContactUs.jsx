import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineArrowLeft } from 'react-icons/hi';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // For now, no backend endpoint
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="animate-fade-in section-container py-12">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-surface-500 hover:text-primary-600 transition-colors w-fit">
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="page-title mb-4">Contact Us</h1>
        <p className="text-surface-600 text-lg">We are here to help you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
            <HiOutlineMail className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-surface-900 mb-2">Email</h3>
          <p className="text-surface-600">support@shopease.com</p>
        </div>
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
            <HiOutlinePhone className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-surface-900 mb-2">Phone</h3>
          <p className="text-surface-600">+91 98765 43210</p>
          <p className="text-xs text-surface-500 mt-2">Mon-Sat, 9 AM to 6 PM</p>
        </div>
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
            <HiOutlineLocationMarker className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-surface-900 mb-2">Office</h3>
          <p className="text-surface-600">ShopEase Support Center, Bengaluru, India</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto card p-8">
        <h2 className="text-2xl font-bold text-surface-900 mb-6 font-display">Send us a message</h2>
        
        {submitted ? (
          <div className="bg-emerald-50 text-emerald-700 p-6 rounded-xl text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-bold mb-2">Thank you! Your message has been received.</h3>
            <p>Our support team will contact you soon.</p>
            <button onClick={() => setSubmitted(false)} className="btn-secondary mt-6">Send another message</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Name</label>
                <input type="text" required className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" required className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="input-label">Subject</label>
              <input type="text" required className="input-field" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Message</label>
              <textarea required rows="5" className="input-field" value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn-primary w-full">Submit Message</button>
          </form>
        )}
      </div>
    </div>
  );
}
