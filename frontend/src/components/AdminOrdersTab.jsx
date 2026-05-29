import React from 'react';

function AdminOrdersTab({ orders, formatPrice, statusColors, handleUpdateOrderStatus }) {
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="card p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-surface-500">Order</p>
              <p className="text-sm font-bold">{o.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-surface-500">Amount</p>
              <p className="text-sm font-bold">{formatPrice(o.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-surface-500">Items</p>
              <p className="text-sm">{o.items?.length || 0}</p>
            </div>
            <span className={`badge ${statusColors[o.status] || ''}`}>{o.status}</span>
          </div>
          <select
            value={o.status}
            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
            className="px-3 py-1.5 text-xs border border-surface-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-400"
          >
            {['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ))}
      {orders.length === 0 && <div className="card p-8 text-center text-surface-400">No orders</div>}
    </div>
  );
}

export default AdminOrdersTab;
