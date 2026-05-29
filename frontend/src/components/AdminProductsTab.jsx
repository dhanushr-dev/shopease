import React from 'react';
import { getProductImage } from '../utils/imageUtils.js';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

function AdminProductsTab({ products, formatPrice, handleImageError, handleDeleteProduct }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-surface-200 flex justify-between items-center bg-white">
        <h3 className="text-lg font-bold text-surface-900">Manage Products</h3>
        <Link to="/admin/products/add" className="btn-primary gap-2 !py-2 !px-4 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> Add Product
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left py-3 px-4 font-semibold text-surface-500">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-500">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-500">Price</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-500">Stock</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-surface-100 hover:bg-surface-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-100">
                      <img
                        src={getProductImage(p)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, p.categoryName)}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-surface-900 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-xs text-surface-400">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-surface-600">{p.categoryName}</td>
                <td className="py-3 px-4 font-semibold">{formatPrice(p.price)}</td>
                <td className="py-3 px-4">
                  <span
                    className={`text-sm font-medium ${
                      p.stock > 10 ? 'text-emerald-600' : p.stock > 0 ? 'text-amber-600' : 'text-red-600'
                    }`}
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/products/edit/${p.id}`}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
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
      {products.length === 0 && (
        <div className="p-8 text-center text-surface-400">No products found</div>
      )}
    </div>
  );
}

export default AdminProductsTab;
