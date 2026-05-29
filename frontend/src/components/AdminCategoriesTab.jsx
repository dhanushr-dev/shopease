import React from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

function AdminCategoriesTab({
  categories,
  showCatForm,
  setShowCatForm,
  editCatId,
  setEditCatId,
  catName,
  setCatName,
  catDesc,
  setCatDesc,
  catImage,
  setCatImage,
  catActive,
  setCatActive,
  handleSaveCategory,
  handleDeleteCategory,
}) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-surface-200 bg-white flex justify-between items-center">
        <h3 className="text-lg font-bold text-surface-900">Manage Categories</h3>
        <button
          onClick={() => {
            setEditCatId(null);
            setCatName('');
            setCatDesc('');
            setCatImage('');
            setCatActive(true);
            setShowCatForm(!showCatForm);
          }}
          className="btn-primary gap-2 !py-2 !px-4 text-sm"
        >
          <HiOutlinePlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showCatForm && (
        <div className="p-4 bg-surface-50 border-b border-surface-200">
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Name *</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Image URL (Optional)</label>
                <input
                  type="url"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="input-field"
                  rows="2"
                ></textarea>
              </div>
              <div>
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catActive}
                    onChange={(e) => setCatActive(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm font-medium text-surface-700">Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCatForm(false)}
                className="btn-secondary !py-2 !px-4 text-sm"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary !py-2 !px-4 text-sm">
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left py-3 px-4 font-semibold text-surface-500">Image</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-500">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-500">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-500">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-surface-100 hover:bg-surface-50">
                <td className="py-3 px-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-100">
                    <img
                      src={c.imageUrl || 'https://via.placeholder.com/48'}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/100x100?text=Category';
                      }}
                    />
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-surface-900">
                  {c.name}{' '}
                  <p className="text-xs text-surface-400">{c.productCount || 0} products</p>
                </td>
                <td className="py-3 px-4 text-surface-600 truncate max-w-xs">{c.description}</td>
                <td className="py-3 px-4">
                  <span
                    className={`badge ${
                      c.active !== false ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {c.active !== false ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditCatId(c.id);
                        setCatName(c.name);
                        setCatDesc(c.description || '');
                        setCatImage(c.imageUrl || '');
                        setCatActive(c.active !== false);
                        setShowCatForm(true);
                      }}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCategoriesTab;
