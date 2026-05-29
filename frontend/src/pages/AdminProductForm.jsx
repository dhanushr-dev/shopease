import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminAPI, categoryAPI } from '../services/api.js';
import toast from 'react-hot-toast';
import Loader from '../components/Loader.jsx';
import { HiOutlineArrowLeft, HiOutlinePhotograph, HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import { generateProductImageUrl, handleImageError } from '../utils/imageUtils.js';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  
  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '', imageUrl: '' });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      brand: '',
      imageUrl: '',
      variants: ''
    }
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      
      const catRes = await adminAPI.getAllCategories();
      const catList = catRes.data.data || [];
      setCategories(catList);

      if (isEdit) {
        const prodRes = await adminAPI.getProductById(id);
        const p = prodRes.data.data;
        reset({
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          categoryId: p.categoryId ? p.categoryId.toString() : '',
          brand: p.brand || '',
          imageUrl: p.imageUrl || '',
          variants: p.variants ? p.variants.join(', ') : ''
        });
      }
    } catch (err) {
      toast.error('Unable to load categories. Please try again.');
      setFetchError(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerateImage = () => {
    const name = watch('name');
    const catId = watch('categoryId');
    const cat = categories.find(c => c.id === Number(catId));
    const brand = watch('brand');
    if (!name || !catId) {
      toast.error('Please enter product name and select a category first');
      return;
    }
    const url = generateProductImageUrl(name, cat?.name, brand);
    setValue('imageUrl', url);
    toast.success('Image URL auto-generated!');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      setCatLoading(true);
      const res = await adminAPI.createCategory({
        name: newCat.name,
        description: newCat.description,
        imageUrl: newCat.imageUrl,
        active: true
      });
      const created = res.data.data;
      toast.success('Category created successfully');
      
      // Refresh category list
      const catRes = await adminAPI.getAllCategories();
      const updatedList = catRes.data.data || [];
      setCategories(updatedList);
      
      // Select the new category
      setValue('categoryId', created.id.toString());
      
      // Close modal
      setShowCatModal(false);
      setNewCat({ name: '', description: '', imageUrl: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCatLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        categoryId: Number(data.categoryId),
        brand: data.brand,
        imageUrl: data.imageUrl,
        variants: data.variants ? data.variants.split(',').map(v => v.trim()).filter(v => v) : []
      };

      if (isEdit) {
        await adminAPI.updateProduct(id, payload);
        toast.success('Product updated successfully');
      } else {
        await adminAPI.createProduct(payload);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading categories..." />;
  
  if (fetchError) return (
    <div className="section-container py-12 text-center">
      <p className="text-red-500 mb-4">Unable to load data. Please check your connection.</p>
      <button onClick={fetchData} className="btn-primary">Try Again</button>
    </div>
  );

  return (
    <div className="animate-fade-in section-container py-8 max-w-3xl">
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-surface-500 hover:text-primary-600 mb-6 transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Products
      </Link>
      
      <div className="card p-6 md:p-8">
        <h1 className="text-2xl font-bold text-surface-900 mb-6 font-display">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="input-label">Product Name *</label>
              <input type="text" className="input-field" placeholder="e.g. iPhone 15 Pro"
                {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="input-error">{errors.name.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="input-label">Description *</label>
              <textarea className="input-field min-h-[100px] resize-y" placeholder="Product details..."
                {...register('description', { required: 'Description is required' })} />
              {errors.description && <p className="input-error">{errors.description.message}</p>}
            </div>

            <div>
              <label className="input-label">Price (₹) *</label>
              <input type="number" step="0.01" className="input-field" placeholder="0.00"
                {...register('price', { 
                  required: 'Price is required', 
                  min: { value: 0.01, message: 'Price must be greater than 0' } 
                })} />
              {errors.price && <p className="input-error">{errors.price.message}</p>}
            </div>

            <div>
              <label className="input-label">Stock Quantity *</label>
              <input type="number" className="input-field" placeholder="0"
                {...register('stock', { 
                  required: 'Stock is required', 
                  min: { value: 0, message: 'Stock cannot be negative' } 
                })} />
              {errors.stock && <p className="input-error">{errors.stock.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="input-label mb-0">Category *</label>
                <button type="button" onClick={() => setShowCatModal(true)} className="text-xs text-primary-600 hover:text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md flex items-center gap-1">
                  <HiOutlinePlus className="w-3 h-3" /> Add New Category
                </button>
              </div>
              
              <select className="input-field" {...register('categoryId', { required: 'Please select a category.' })}>
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id.toString()} disabled={c.active === false}>
                    {c.name} {c.active === false ? '(Inactive)' : ''}
                  </option>
                ))}
                {categories.length === 0 && (
                  <option disabled>No categories found. Please add a category first.</option>
                )}
              </select>
              {errors.categoryId && <p className="input-error">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="input-label">Brand</label>
              <input type="text" className="input-field" placeholder="e.g. Apple"
                {...register('brand')} />
            </div>

            <div className="md:col-span-2">
              <label className="input-label">Variants (Optional)</label>
              <input type="text" className="input-field" placeholder="e.g. Size: S, Size: M, Color: Red"
                {...register('variants')} />
              <p className="text-xs text-surface-500 mt-1">Comma-separated list of variants.</p>
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="input-label mb-0">Image URL (Optional)</label>
                <button type="button" onClick={handleAutoGenerateImage} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium bg-primary-50 px-2 py-1 rounded-md">
                  <HiOutlinePhotograph className="w-4 h-4" /> Auto Generate Image
                </button>
              </div>
              <input type="url" className="input-field" placeholder="https://example.com/image.jpg"
                {...register('imageUrl')} />
              <p className="text-xs text-surface-500 mt-2">
                Paste a direct image URL ending with .jpg, .png, .jpeg, or .webp.
              </p>
              
              {watch('imageUrl') && (
                <div className="mt-4 p-4 border border-surface-200 rounded-xl bg-surface-50">
                  <p className="text-sm font-semibold text-surface-700 mb-3">Image Preview</p>
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-surface-200 bg-white">
                    <img 
                      src={watch('imageUrl')} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        const catId = watch('categoryId');
                        const catName = categories.find(c => c.id === Number(catId))?.name;
                        handleImageError(e, catName);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-surface-100 flex justify-end gap-3">
            <Link to="/admin/products" className="btn-secondary !py-2.5">Cancel</Link>
            <button type="submit" disabled={submitting} className="btn-primary !py-2.5 min-w-[120px]">
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Category Modal (Option A) */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-surface-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-surface-900">Add New Category</h3>
              <button onClick={() => setShowCatModal(false)} className="text-surface-400 hover:text-surface-900 transition-colors">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="input-label">Category Name *</label>
                <input type="text" className="input-field" required value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="e.g. Smartwatches" />
              </div>
              
              <div>
                <label className="input-label">Description</label>
                <textarea className="input-field min-h-[80px]" value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  placeholder="Short description..." />
              </div>
              
              <div>
                <label className="input-label">Image URL (Optional)</label>
                <input type="url" className="input-field" value={newCat.imageUrl}
                  onChange={(e) => setNewCat({ ...newCat, imageUrl: e.target.value })}
                  placeholder="https://example.com/icon.png" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={catLoading} className="flex-1 btn-primary">
                  {catLoading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

