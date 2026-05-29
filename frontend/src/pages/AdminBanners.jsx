import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.js';
import toast from 'react-hot-toast';
import Loader from '../components/Loader.jsx';
import { HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash, HiCheck, HiX } from 'react-icons/hi';
import { handleImageError } from '../utils/imageUtils.js';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    active: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllBanners();
      setBanners(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsEdit(false);
    setCurrentBanner(null);
    setFormData({ title: '', subtitle: '', imageUrl: '', buttonText: '', buttonLink: '', active: true });
    setShowModal(true);
  };

  const handleEditClick = (banner) => {
    setIsEdit(true);
    setCurrentBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      buttonText: banner.buttonText || '',
      buttonLink: banner.buttonLink || '',
      active: banner.active
    });
    setShowModal(true);
  };

  const handleToggleActive = async (id) => {
    try {
      await adminAPI.toggleBanner(id);
      fetchBanners();
      toast.success('Banner status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await adminAPI.deleteBanner(id);
      fetchBanners();
      toast.success('Banner deleted');
    } catch (err) {
      toast.error('Failed to delete banner');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast.error('Title and Image URL are required');
      return;
    }
    
    try {
      setSubmitting(true);
      if (isEdit) {
        await adminAPI.updateBanner(currentBanner.id, formData);
        toast.success('Banner updated');
      } else {
        await adminAPI.createBanner(formData);
        toast.success('Banner created');
      }
      setShowModal(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading banners..." />;

  return (
    <div className="animate-fade-in section-container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title mb-1">Manage Banners</h1>
          <p className="text-surface-500">Add or edit homepage banners and offers.</p>
        </div>
        <button onClick={handleAddClick} className="btn-primary gap-2">
          <HiOutlinePlus className="w-5 h-5" /> Add New Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className={`card overflow-hidden flex flex-col ${!banner.active ? 'opacity-60' : ''}`}>
            <div className="h-40 w-full relative bg-surface-100">
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" onError={(e) => handleImageError(e, "banner")} />
              <div className="absolute top-2 right-2 flex gap-2">
                <button 
                  onClick={() => handleToggleActive(banner.id)}
                  className={`px-2 py-1 text-xs font-bold rounded shadow-sm ${banner.active ? 'bg-emerald-500 text-white' : 'bg-surface-500 text-white'}`}
                >
                  {banner.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-surface-900 mb-1">{banner.title}</h3>
              {banner.subtitle && <p className="text-sm text-surface-500 mb-3">{banner.subtitle}</p>}
              
              <div className="mt-auto pt-4 flex gap-2 border-t border-surface-100">
                <button onClick={() => handleEditClick(banner)} className="btn-secondary flex-1 !py-1.5 !px-2 gap-1 text-xs">
                  <HiOutlinePencilAlt className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(banner.id)} className="btn-secondary !text-red-500 flex-1 !py-1.5 !px-2 gap-1 text-xs border-red-200 hover:bg-red-50">
                  <HiOutlineTrash className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full py-12 text-center text-surface-500 border-2 border-dashed border-surface-200 rounded-2xl">
            No banners found. Add a banner to display it on the homepage.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-4 sm:p-6 border-b border-surface-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold text-surface-900 font-display">
                {isEdit ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-surface-400 hover:text-surface-900 transition-colors">
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="input-label">Title *</label>
                <input type="text" className="input-field" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Summer Sale 50% Off" />
              </div>
              
              <div>
                <label className="input-label">Subtitle</label>
                <input type="text" className="input-field" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="e.g. Catch the best deals before they are gone" />
              </div>
              
              <div>
                <label className="input-label">Image URL *</label>
                <input type="url" className="input-field" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://example.com/banner.jpg" />
                <p className="text-xs text-surface-500 mt-1">Provide a high-quality wide image URL.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Button Text</label>
                  <input type="text" className="input-field" value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} placeholder="e.g. Shop Now" />
                </div>
                <div>
                  <label className="input-label">Button Link</label>
                  <input type="text" className="input-field" value={formData.buttonLink} onChange={e => setFormData({...formData, buttonLink: e.target.value})} placeholder="e.g. /products?category=1" />
                </div>
              </div>
              
              <div className="flex items-center gap-3 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                  <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  <span className="ml-3 text-sm font-medium text-surface-700">Active (Visible on homepage)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-surface-100 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary min-w-[120px]">
                  {submitting ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
