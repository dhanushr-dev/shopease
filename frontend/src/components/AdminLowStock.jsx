import React from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

function AdminLowStock({ stats }) {
  if (!stats || (stats.lowStockCount <= 0 && stats.outOfStockCount <= 0)) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {stats.outOfStockCount > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800">
          <HiOutlineExclamationCircle className="w-8 h-8 text-red-500" />
          <div>
            <p className="font-bold">{stats.outOfStockCount} Products Out of Stock</p>
            <p className="text-sm text-red-600">These products cannot be purchased by customers.</p>
          </div>
        </div>
      )}
      {stats.lowStockCount > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800">
          <HiOutlineExclamationCircle className="w-8 h-8 text-amber-500" />
          <div>
            <p className="font-bold">{stats.lowStockCount} Products Low on Stock</p>
            <p className="text-sm text-amber-600">Stock is below 10 items. Consider restocking soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLowStock;
