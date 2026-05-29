import React from 'react';
import { HiOutlineUsers, HiOutlineCube, HiOutlineShoppingBag, HiOutlineCurrencyRupee } from 'react-icons/hi';

function AdminStatsCards({ stats, formatPrice }) {
  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: HiOutlineUsers, color: 'from-blue-500 to-blue-600' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: HiOutlineCube, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: HiOutlineShoppingBag, color: 'from-purple-500 to-purple-600' },
    { label: 'Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: HiOutlineCurrencyRupee, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((s) => (
        <div key={s.label} className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-r ${s.color} text-white`}>
              <s.icon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-900 font-display">{s.value}</p>
          <p className="text-xs text-surface-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export default AdminStatsCards;
