import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, categoryAPI } from '../services/api.js';
import { handleImageError } from '../utils/imageUtils.js';
import Loader from '../components/Loader.jsx';
import AdminCoupons from './AdminCoupons.jsx';
import AdminStatsCards from '../components/AdminStatsCards.jsx';
import AdminLowStock from '../components/AdminLowStock.jsx';
import AdminRecentOrders from '../components/AdminRecentOrders.jsx';
import AdminProductsTab from '../components/AdminProductsTab.jsx';
import AdminOrdersTab from '../components/AdminOrdersTab.jsx';
import AdminCategoriesTab from '../components/AdminCategoriesTab.jsx';
import toast from 'react-hot-toast';
import {
  HiOutlineUsers, HiOutlineShoppingBag, HiOutlineCube, HiOutlineCurrencyRupee,
  HiOutlineTruck, HiOutlineCheck, HiOutlineClock, HiOutlineX,
  HiOutlineTrash, HiOutlinePencil, HiOutlinePlus, HiOutlineRefresh,
  HiOutlineExclamationCircle, HiOutlineTicket, HiOutlineDownload,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi';

function AdminDashboard(props) {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(props.defaultTab || 'overview');

  const [returns, setReturns] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [adminQuestions, setAdminQuestions] = useState([]);
  const [answeringId, setAnsweringId] = useState(null);
  const [adminAnswer, setAdminAnswer] = useState('');

  // Category form states
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catActive, setCatActive] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dashRes, ordersRes, usersRes, productsRes, catRes, retRes, repRes, refRes, qRes] = await Promise.allSettled([
        adminAPI.getDashboard(), adminAPI.getAllOrders(), adminAPI.getUsers(),
        adminAPI.getAdminProducts(), adminAPI.getAllCategories(),
        adminAPI.getReturns(), adminAPI.getReplacements(), adminAPI.getRefunds(),
        adminAPI.getAdminQuestions()
      ]);
      if (dashRes.status === 'fulfilled') setStats(dashRes.value.data.data);
      if (ordersRes.status === 'fulfilled') {
        const d = ordersRes.value.data;
        setOrders(d.data?.content || d.content || d.data || []);
      }
      if (usersRes.status === 'fulfilled') {
        const d = usersRes.value.data;
        setUsers(d.data?.content || d.content || d.data || []);
      }
      if (productsRes.status === 'fulfilled') {
        const d = productsRes.value.data;
        setProducts(d.data?.content || d.content || d.data || []);
      }
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data.data || []);
      if (retRes.status === 'fulfilled') {
        const d = retRes.value.data;
        setReturns(d.data?.content || d.content || d.data || []);
      }
      if (repRes.status === 'fulfilled') {
        const d = repRes.value.data;
        setReplacements(d.data?.content || d.content || d.data || []);
      }
      if (refRes.status === 'fulfilled') {
        const d = refRes.value.data;
        setRefunds(d.data?.content || d.content || d.data || []);
      }
      if (qRes.status === 'fulfilled') setAdminQuestions(qRes.value.data.data || []);
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  };

  const formatPrice = (p) => p != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(p) : '₹0';

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status });
      toast.success(`Order status updated to ${status}`);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id);
      toast.success('Product deleted successfully.');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: catName, description: catDesc, imageUrl: catImage, active: catActive };
      if (editCatId) {
        await adminAPI.updateCategory(editCatId, payload);
        toast.success('Category updated successfully');
      } else {
        await adminAPI.createCategory(payload);
        toast.success('Category created successfully');
      }
      setShowCatForm(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?\nIf products are linked, the category will be deactivated instead.')) return;
    try {
      await adminAPI.deleteCategory(id);
      toast.success('Category deleted/deactivated successfully');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const handleSupportAction = async (type, id, action) => {
    try {
      if (type === 'return') {
        if (action === 'approve') await adminAPI.approveReturn(id);
        else await adminAPI.rejectReturn(id);
      } else if (type === 'replace') {
        if (action === 'approve') await adminAPI.approveReplacement(id);
        else await adminAPI.rejectReplacement(id);
      } else if (type === 'refund' && action === 'complete') {
        await adminAPI.completeRefund(id);
      }
      toast.success(`Successfully ${action}d request`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleAnswerQuestion = async (id) => {
    if (!adminAnswer.trim()) return;
    try {
      await adminAPI.answerQuestion(id, { answer: adminAnswer });
      toast.success('Answer posted successfully');
      setAnsweringId(null);
      setAdminAnswer('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post answer');
    }
  };

  const exportToCSV = (data, fileName, headers) => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    data.forEach(row => {
      const values = headers.map(header => {
        const escaped = ('' + (row[header] || '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSalesReport = () => {
    const reportData = orders.map(o => ({
      OrderId: o.orderNumber,
      Customer: o.userName,
      Amount: o.totalAmount,
      Status: o.status,
      Date: new Date(o.createdAt).toLocaleDateString(),
      Items: o.items.map(i => i.productName).join(' | ')
    }));
    exportToCSV(reportData, 'Sales_Report', ['OrderId', 'Customer', 'Amount', 'Status', 'Date', 'Items']);
  };

  const downloadStockReport = () => {
    const reportData = products.map(p => ({
      Id: p.id,
      Name: p.name,
      Category: p.categoryName,
      Price: p.price,
      Stock: p.stock,
      Status: p.stock > 0 ? 'In Stock' : 'Out of Stock'
    }));
    exportToCSV(reportData, 'Stock_Report', ['Id', 'Name', 'Category', 'Price', 'Stock', 'Status']);
  };

  if (loading) return <Loader message="Loading admin dashboard..." />;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: HiOutlineUsers, color: 'from-blue-500 to-blue-600' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: HiOutlineCube, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: HiOutlineShoppingBag, color: 'from-purple-500 to-purple-600' },
    { label: 'Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: HiOutlineCurrencyRupee, color: 'from-amber-500 to-amber-600' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: `Orders (${orders.length})` },
    { id: 'products', label: `Products (${products.length})` },
    { id: 'categories', label: `Categories (${categories.length})` },
    { id: 'coupons', label: `Coupons (${stats?.totalCoupons || 0})` },
    { id: 'banners', label: 'Banners' },
    { id: 'questions', label: `Questions (${adminQuestions.length})` },
    { id: 'users', label: `Users (${users.length})` },
    { id: 'returns', label: `Returns (${returns.length})` },
    { id: 'replacements', label: `Replacements (${replacements.length})` },
    { id: 'refunds', label: `Refunds (${refunds.length})` },
  ];

  const statusColors = { 
    PENDING: 'badge-warning', 
    CONFIRMED: 'badge-primary', 
    SHIPPED: 'bg-blue-100 text-blue-700', 
    OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'badge-success', 
    CANCELLED: 'badge-danger' 
  };

  return (
    <div className="animate-fade-in section-container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage your store</p>
        </div>
        <button onClick={fetchAll} className="btn-secondary gap-2"><HiOutlineRefresh className="w-4 h-4" /> Refresh</button>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards stats={stats} formatPrice={formatPrice} />

      {/* Alerts Row */}
      <AdminLowStock stats={stats} />

      {/* Order Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending', value: stats?.pendingOrders || 0, icon: HiOutlineClock, cls: 'text-amber-600 bg-amber-50' },
          { label: 'Confirmed', value: stats?.confirmedOrders || 0, icon: HiOutlineCheck, cls: 'text-primary-600 bg-primary-50' },
          { label: 'Shipped', value: stats?.shippedOrders || 0, icon: HiOutlineTruck, cls: 'text-blue-600 bg-blue-50' },
          { label: 'Delivered', value: stats?.deliveredOrders || 0, icon: HiOutlineCheck, cls: 'text-emerald-600 bg-emerald-50' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 card p-4">
            <div className={`p-2 rounded-lg ${s.cls}`}><s.icon className="w-5 h-5" /></div>
            <div><p className="text-lg font-bold text-surface-900">{s.value}</p><p className="text-xs text-surface-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto bg-surface-100 rounded-xl p-1">
        {tabs.map((t) => (
          t.id === 'banners' ? (
            <Link key={t.id} to="/admin/banners"
              className={`px-5 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all text-surface-600 hover:text-surface-900`}>{t.label}</Link>
          ) : (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all
                ${activeTab === t.id ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'}`}>{t.label}</button>
          )
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="card p-6 flex flex-col gap-4">
                <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                   <HiOutlineDownload className="w-5 h-5 text-primary-600" /> Export Reports
                </h3>
                <div className="flex flex-wrap gap-3">
                   <button onClick={downloadSalesReport} className="btn-secondary !py-2 !px-4 text-sm gap-2">
                      <HiOutlineDownload className="w-4 h-4" /> Sales Report
                   </button>
                   <button onClick={downloadStockReport} className="btn-secondary !py-2 !px-4 text-sm gap-2">
                      <HiOutlineDownload className="w-4 h-4" /> Stock Report
                   </button>
                </div>
             </div>
          </div>

          <AdminRecentOrders orders={orders} formatPrice={formatPrice} statusColors={statusColors} />
        </div>
      )}

      {activeTab === 'orders' && (
        <AdminOrdersTab
          orders={orders}
          formatPrice={formatPrice}
          statusColors={statusColors}
          handleUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

      {activeTab === 'products' && (
        <AdminProductsTab
          products={products}
          formatPrice={formatPrice}
          handleImageError={handleImageError}
          handleDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeTab === 'categories' && (
        <AdminCategoriesTab
          categories={categories}
          showCatForm={showCatForm}
          setShowCatForm={setShowCatForm}
          editCatId={editCatId}
          setEditCatId={setEditCatId}
          catName={catName}
          setCatName={setCatName}
          catDesc={catDesc}
          setCatDesc={setCatDesc}
          catImage={catImage}
          setCatImage={setCatImage}
          catActive={catActive}
          setCatActive={setCatActive}
          handleSaveCategory={handleSaveCategory}
          handleDeleteCategory={handleDeleteCategory}
        />
      )}

      {activeTab === 'coupons' && (
        <div className="animate-fade-in">
          <AdminCoupons />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left py-3 px-4 font-semibold text-surface-500">User</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Joined</th>
              </tr></thead>
              <tbody>{users.map((u) => (
                <tr key={u.id} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                        {u.name?.charAt(0).toUpperCase()}</div>
                      <span className="font-medium text-surface-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-surface-600">{u.email}</td>
                  <td className="py-3 px-4"><span className={u.role === 'ROLE_ADMIN' ? 'badge-danger' : 'badge-primary'}>{u.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</span></td>
                  <td className="py-3 px-4 text-surface-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'returns' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Return ID</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Order #</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Reason</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Actions</th>
              </tr></thead>
              <tbody>{returns.map((r) => (
                <tr key={r.id} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="py-3 px-4 font-medium">#{r.id}</td>
                  <td className="py-3 px-4 text-surface-600">{r.orderNumber}</td>
                  <td className="py-3 px-4">{r.reason}</td>
                  <td className="py-3 px-4"><span className={`badge ${r.status === 'REQUESTED' ? 'badge-warning' : r.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span></td>
                  <td className="py-3 px-4">
                    {r.status === 'REQUESTED' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleSupportAction('return', r.id, 'approve')} className="btn-secondary !text-emerald-600 !py-1 !px-2 text-xs">Approve</button>
                        <button onClick={() => handleSupportAction('return', r.id, 'reject')} className="btn-secondary !text-red-600 !py-1 !px-2 text-xs">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {returns.length === 0 && <div className="p-8 text-center text-surface-400">No returns found</div>}
        </div>
      )}

      {activeTab === 'replacements' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Replace ID</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Order #</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Reason</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Actions</th>
              </tr></thead>
              <tbody>{replacements.map((r) => (
                <tr key={r.id} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="py-3 px-4 font-medium">#{r.id}</td>
                  <td className="py-3 px-4 text-surface-600">{r.orderNumber}</td>
                  <td className="py-3 px-4">{r.reason}</td>
                  <td className="py-3 px-4"><span className={`badge ${r.status === 'REQUESTED' ? 'badge-warning' : r.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span></td>
                  <td className="py-3 px-4">
                    {r.status === 'REQUESTED' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleSupportAction('replace', r.id, 'approve')} className="btn-secondary !text-emerald-600 !py-1 !px-2 text-xs">Approve</button>
                        <button onClick={() => handleSupportAction('replace', r.id, 'reject')} className="btn-secondary !text-red-600 !py-1 !px-2 text-xs">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {replacements.length === 0 && <div className="p-8 text-center text-surface-400">No replacements found</div>}
        </div>
      )}

      {activeTab === 'refunds' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Refund ID</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Order #</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Reason</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-surface-500">Actions</th>
              </tr></thead>
              <tbody>{refunds.map((r) => (
                <tr key={r.id} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="py-3 px-4 font-medium">#{r.id}</td>
                  <td className="py-3 px-4 text-surface-600">{r.orderNumber}</td>
                  <td className="py-3 px-4 font-semibold">{formatPrice(r.refundAmount)}</td>
                  <td className="py-3 px-4">{r.refundReason}</td>
                  <td className="py-3 px-4"><span className={`badge ${r.refundStatus === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>{r.refundStatus}</span></td>
                  <td className="py-3 px-4">
                    {r.refundStatus !== 'COMPLETED' && (
                      <button onClick={() => handleSupportAction('refund', r.id, 'complete')} className="btn-secondary !py-1 !px-2 text-xs">Mark Complete</button>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {refunds.length === 0 && <div className="p-8 text-center text-surface-400">No refunds found</div>}
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-4">
          {adminQuestions.map((q) => (
            <div key={q.id} className="card p-6 border-l-4 border-primary-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <HiOutlineQuestionMarkCircle className="w-5 h-5 text-surface-400" />
                  <span className="text-xs font-bold text-surface-500 uppercase tracking-widest">Question</span>
                </div>
                <span className="text-[10px] text-surface-400">{new Date(q.createdAt).toLocaleString()}</span>
              </div>
              
              <p className="text-surface-900 font-semibold mb-2">{q.question}</p>
              <p className="text-xs text-surface-500 mb-4">User: {q.userName} (ID: {q.userId}) • Product ID: {q.productId}</p>

              {q.answer ? (
                <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                  <p className="text-xs font-bold text-primary-700 uppercase mb-2">Your Answer</p>
                  <p className="text-surface-800 text-sm">{q.answer}</p>
                  <p className="text-[10px] text-primary-400 mt-2">Answered on {new Date(q.answeredAt).toLocaleString()}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {answeringId === q.id ? (
                    <div className="space-y-3">
                      <textarea 
                        className="input-field !text-sm min-h-[80px]" 
                        placeholder="Type your answer..."
                        value={adminAnswer}
                        onChange={(e) => setAdminAnswer(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleAnswerQuestion(q.id)} className="btn-primary !py-1.5 !px-4 text-xs">Post Answer</button>
                        <button onClick={() => setAnsweringId(null)} className="btn-secondary !py-1.5 !px-4 text-xs">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAnsweringId(q.id)} className="btn-secondary !py-1.5 !px-4 text-xs border-primary-200 text-primary-600">Answer Question</button>
                  )}
                </div>
              )}
            </div>
          ))}
          {adminQuestions.length === 0 && <div className="card p-8 text-center text-surface-400">No product questions found</div>}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
