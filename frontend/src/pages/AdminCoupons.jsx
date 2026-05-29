import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { HiOutlineTicket, HiOutlinePlus, HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
  });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCoupons();
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      };

      if (editingId) {
        await adminAPI.updateCoupon(editingId, payload);
        toast.success('Coupon updated successfully');
      } else {
        await adminAPI.createCoupon(payload);
        toast.success('Coupon created successfully');
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '',
      maxDiscountAmount: '', validFrom: '', validUntil: '', usageLimit: '',
    });
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : '',
      usageLimit: coupon.usageLimit || '',
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminAPI.deactivateCoupon(id);
      toast.success(currentStatus ? 'Coupon deactivated' : 'Coupon activated');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Loader message="Loading coupons..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-surface-900 font-display flex items-center gap-2">
          <HiOutlineTicket className="w-6 h-6 text-primary-600" /> Manage Coupons
        </h2>
        {!showForm && (
          <button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }} className="btn-primary gap-2">
            <HiOutlinePlus className="w-5 h-5" /> Create Coupon
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-6 border-primary-100 bg-primary-50/30 animate-slide-down">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Coupon Code *</label>
              <input type="text" name="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} required className="input-field" placeholder="e.g. SUMMER50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select name="discountType" value={formData.discountType} onChange={handleInputChange} className="input-field">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Value *</label>
              <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} required min="1" step="0.01" className="input-field" placeholder="e.g. 10" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Order Amount</label>
              <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleInputChange} min="0" className="input-field" placeholder="Optional" />
            </div>
            {formData.discountType === 'PERCENTAGE' && (
              <div>
                <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
                <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleInputChange} min="0" className="input-field" placeholder="Optional" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Usage Limit</label>
              <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} min="1" className="input-field" placeholder="Total uses allowed (Optional)" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid From</label>
              <input type="datetime-local" name="validFrom" value={formData.validFrom} onChange={handleInputChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <input type="datetime-local" name="validUntil" value={formData.validUntil} onChange={handleInputChange} className="input-field" />
            </div>
            
            <div className="col-span-full flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving...' : 'Save Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Code</th>
                <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Discount</th>
                <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Min Order</th>
                <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Uses</th>
                <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="p-4 font-bold text-surface-900">{coupon.code}</td>
                  <td className="p-4 text-sm text-surface-600">
                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    {coupon.maxDiscountAmount && <span className="text-xs block text-surface-400">Up to ₹{coupon.maxDiscountAmount}</span>}
                  </td>
                  <td className="p-4 text-sm text-surface-600">{coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : 'None'}</td>
                  <td className="p-4 text-sm text-surface-600">{coupon.timesUsed} / {coupon.usageLimit || '∞'}</td>
                  <td className="p-4">
                    <span className={`badge ${coupon.active ? 'badge-success' : 'badge-neutral'}`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleToggleStatus(coupon.id, coupon.active)} className="btn-ghost !p-2" title={coupon.active ? 'Deactivate' : 'Activate'}>
                        {coupon.active ? <HiOutlineX className="w-4 h-4 text-amber-500" /> : <HiOutlineCheck className="w-4 h-4 text-emerald-500" />}
                      </button>
                      <button onClick={() => handleEdit(coupon)} className="btn-ghost !p-2 text-primary-600" title="Edit">
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-surface-500">No coupons found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
