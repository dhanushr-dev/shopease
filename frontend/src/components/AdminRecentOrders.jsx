import React from 'react';

function AdminRecentOrders({ orders, formatPrice, statusColors }) {
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-surface-900 mb-4">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-left py-3 px-2 font-semibold text-surface-500">Order #</th>
              <th className="text-left py-3 px-2 font-semibold text-surface-500">Customer</th>
              <th className="text-left py-3 px-2 font-semibold text-surface-500">Amount</th>
              <th className="text-left py-3 px-2 font-semibold text-surface-500">Status</th>
              <th className="text-left py-3 px-2 font-semibold text-surface-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-surface-100 hover:bg-surface-50">
                <td className="py-3 px-2 font-medium text-surface-900">{o.orderNumber}</td>
                <td className="py-3 px-2 text-surface-700">{o.userName || 'N/A'}</td>
                <td className="py-3 px-2 font-semibold text-surface-900">{formatPrice(o.totalAmount)}</td>
                <td className="py-3 px-2">
                  <span className={`badge ${statusColors[o.status] || ''}`}>{o.status}</span>
                </td>
                <td className="py-3 px-2 text-surface-500">
                  {new Date(o.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {recentOrders.length === 0 && (
        <p className="text-center py-8 text-surface-400">No orders yet</p>
      )}
    </div>
  );
}

export default AdminRecentOrders;
