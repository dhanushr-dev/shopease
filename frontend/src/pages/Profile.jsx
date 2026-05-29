import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import toast from 'react-hot-toast';
import {
  HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlinePencil,
  HiOutlineLocationMarker, HiOutlinePlus, HiOutlineTrash, HiOutlineCheck,
} from 'react-icons/hi';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phoneNumber: '', addressLine1: '', addressLine2: '',
    city: '', state: '', postalCode: '', country: 'India', isDefault: false,
  });
  const [activeTab, setActiveTab] = useState('addresses');
  const [returns, setReturns] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [refunds, setRefunds] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, addressRes, returnsRes, replaceRes, refundRes] = await Promise.all([
        userAPI.getProfile(), userAPI.getAddresses(),
        userAPI.getReturns(), userAPI.getReplacements(), userAPI.getRefunds()
      ]);
      setProfile(profileRes.data.data);
      setAddresses(addressRes.data.data || []);
      setReturns(returnsRes.data.data || []);
      setReplacements(replaceRes.data.data || []);
      setRefunds(refundRes.data.data || []);
      setEditForm({ name: profileRes.data.data.name, phone: profileRes.data.data.phone || '' });
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.updateProfile(editForm);
      setProfile(res.data.data);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.addAddress(addressForm);
      setAddresses([...addresses, res.data.data]);
      setShowAddressForm(false);
      setAddressForm({ fullName: '', phoneNumber: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
      toast.success('Address added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add address'); }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await userAPI.deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch (err) { toast.error('Failed to delete address'); }
  };

  if (loading) return <Loader message="Loading profile..." />;

  return (
    <div className="animate-fade-in section-container py-8">
      <h1 className="page-title mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold font-display mb-4">
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-surface-900">{profile?.name}</h2>
              <p className="text-sm text-surface-500">{profile?.email}</p>
              <span className="badge-primary mt-2">{profile?.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}</span>
            </div>

            {!editMode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineMail className="w-5 h-5 text-surface-400" />
                  <span className="text-surface-700">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlinePhone className="w-5 h-5 text-surface-400" />
                  <span className="text-surface-700">{profile?.phone || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineUser className="w-5 h-5 text-surface-400" />
                  <span className="text-surface-700">Member since {new Date(profile?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span>
                </div>
                <button onClick={() => setEditMode(true)} className="btn-secondary w-full mt-4 gap-2">
                  <HiOutlinePencil className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="input-label">Name</label>
                  <input type="text" className="input-field" value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="input-label">Phone</label>
                  <input type="tel" className="input-field" value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1 gap-1"><HiOutlineCheck className="w-4 h-4" /> Save</button>
                  <button type="button" onClick={() => setEditMode(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto bg-surface-100 rounded-xl p-1">
            {['addresses', 'returns', 'replacements', 'refunds'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize whitespace-nowrap transition-all
                  ${activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'}`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'addresses' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-surface-900 font-display flex items-center gap-2">
                  <HiOutlineLocationMarker className="w-5 h-5 text-primary-600" /> My Addresses
                </h2>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-primary !py-2 !px-4 !text-sm gap-1">
                  <HiOutlinePlus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="card p-6 mb-6 animate-slide-down">
                  <h3 className="text-base font-semibold text-surface-900 mb-4">New Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="input-label">Full Name</label><input className="input-field" value={addressForm.fullName} onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})} required /></div>
                    <div><label className="input-label">Phone Number</label><input className="input-field" value={addressForm.phoneNumber} onChange={(e) => setAddressForm({...addressForm, phoneNumber: e.target.value})} required /></div>
                    <div className="md:col-span-2"><label className="input-label">Address Line 1</label><input className="input-field" value={addressForm.addressLine1} onChange={(e) => setAddressForm({...addressForm, addressLine1: e.target.value})} required /></div>
                    <div className="md:col-span-2"><label className="input-label">Address Line 2</label><input className="input-field" value={addressForm.addressLine2} onChange={(e) => setAddressForm({...addressForm, addressLine2: e.target.value})} /></div>
                    <div><label className="input-label">City</label><input className="input-field" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} required /></div>
                    <div><label className="input-label">State</label><input className="input-field" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} required /></div>
                    <div><label className="input-label">Postal Code</label><input className="input-field" value={addressForm.postalCode} onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})} required /></div>
                    <div className="flex items-center gap-2 pt-6">
                      <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" />
                      <label htmlFor="isDefault" className="text-sm text-surface-700">Set as default</label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="submit" className="btn-primary gap-1"><HiOutlineCheck className="w-4 h-4" /> Save Address</button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              )}

              {/* Address List */}
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className={`card p-5 relative ${addr.isDefault ? 'ring-2 ring-primary-400' : ''}`}>
                      {addr.isDefault && <span className="absolute top-3 right-3 badge-primary text-[10px]">Default</span>}
                      <p className="font-semibold text-surface-900">{addr.fullName}</p>
                      <p className="text-sm text-surface-600 mt-1">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-sm text-surface-600">{addr.addressLine2}</p>}
                      <p className="text-sm text-surface-600">{addr.city}, {addr.state} — {addr.postalCode}</p>
                      <p className="text-sm text-surface-500 mt-1">📞 {addr.phoneNumber}</p>
                      <button onClick={() => handleDeleteAddress(addr.id)}
                        className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                        <HiOutlineTrash className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <p className="text-surface-400">No addresses saved yet</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'returns' && (
            <div className="space-y-4">
              {returns.length === 0 ? <p className="text-surface-500 text-center py-8 card">No returns found</p> : 
                returns.map(r => (
                  <div key={r.id} className="card p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-surface-900">Order #{r.orderNumber}</span>
                      <span className={`badge ${r.status === 'REQUESTED' ? 'badge-warning' : r.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span>
                    </div>
                    <p className="text-sm text-surface-600">Reason: {r.reason}</p>
                    <p className="text-xs text-surface-400 mt-1">Requested on: {new Date(r.requestedAt).toLocaleDateString()}</p>
                  </div>
                ))
              }
            </div>
          )}

          {activeTab === 'replacements' && (
            <div className="space-y-4">
              {replacements.length === 0 ? <p className="text-surface-500 text-center py-8 card">No replacements found</p> : 
                replacements.map(r => (
                  <div key={r.id} className="card p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-surface-900">Order #{r.orderNumber}</span>
                      <span className={`badge ${r.status === 'REQUESTED' ? 'badge-warning' : r.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span>
                    </div>
                    <p className="text-sm text-surface-600">Reason: {r.reason}</p>
                    <p className="text-xs text-surface-400 mt-1">Requested on: {new Date(r.requestedAt).toLocaleDateString()}</p>
                  </div>
                ))
              }
            </div>
          )}

          {activeTab === 'refunds' && (
            <div className="space-y-4">
              {refunds.length === 0 ? <p className="text-surface-500 text-center py-8 card">No refunds found</p> : 
                refunds.map(r => (
                  <div key={r.id} className="card p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-surface-900">Order #{r.orderNumber}</span>
                      <span className={`badge ${r.refundStatus === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>{r.refundStatus}</span>
                    </div>
                    <p className="text-sm font-semibold text-surface-900 mt-2">Refund Amount: ₹{r.refundAmount}</p>
                    <p className="text-sm text-surface-600">Reason: {r.refundReason}</p>
                    <p className="text-xs text-surface-400 mt-1">Created on: {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
