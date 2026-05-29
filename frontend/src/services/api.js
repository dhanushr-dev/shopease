import axios from 'axios';

/**
 * Axios instance with base URL and interceptors for ShopEase API.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request interceptor: Attaches JWT token to every request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handles 401 errors by clearing auth.
 */
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', error.response?.status, error.response?.data?.message);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('shopease_token');
      localStorage.removeItem('shopease_user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===================== AUTH APIs =====================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ===================== PRODUCT APIs =====================

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  search: (keyword, params) => api.get('/products/search', { params: { keyword, ...params } }),
  getByCategory: (categoryId, params) => api.get(`/products/category/${categoryId}`, { params }),
  // Admin
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
  // Questions
  getQuestions: (productId) => api.get(`/products/${productId}/questions`),
  askQuestion: (productId, data) => api.post(`/products/${productId}/questions`, data),
};

// ===================== WISHLIST APIs =====================

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  moveToCart: (productId) => api.post(`/wishlist/${productId}/move-to-cart`),
  check: (productId) => api.get(`/wishlist/${productId}/check`),
};

// ===================== REVIEW APIs =====================

export const reviewAPI = {
  create: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  getByProduct: (productId) => api.get(`/products/${productId}/reviews`),
  getSummary: (productId) => api.get(`/products/${productId}/rating-summary`),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// ===================== COUPON APIs =====================

export const couponAPI = {
  apply: (data) => api.post('/coupons/apply', data),
  getActive: () => api.get('/coupons/active'),
};

// ===================== CATEGORY APIs =====================

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};

// ===================== CART APIs =====================

export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};

// ===================== ORDER APIs =====================

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  requestReturn: (id, data) => api.post(`/orders/${id}/return`, data),
  requestReplacement: (id, data) => api.post(`/orders/${id}/replace`, data),
  getRefund: (id) => api.get(`/orders/${id}/refund`),
  getInvoice: (id) => api.get(`/orders/${id}/invoice`),
  getTracking: (id) => api.get(`/orders/${id}/tracking`),
  // Admin
  getAllAdmin: (params) => api.get('/admin/orders', { params }),
  updateStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
};

// ===================== USER APIs =====================

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getReturns: () => api.get('/users/returns'),
  getReplacements: () => api.get('/users/replacements'),
  getRefunds: () => api.get('/users/refunds'),
};

// ===================== ADMIN APIs =====================

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAdminProducts: (params) => api.get('/admin/products', { params }),
  getUsers: () => api.get('/admin/users'),
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getProductById: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getAllCategories: () => api.get('/admin/categories'),
  // Return/Replace
  getReturns: () => api.get('/admin/returns'),
  approveReturn: (id) => api.put(`/admin/returns/${id}/approve`),
  rejectReturn: (id) => api.put(`/admin/returns/${id}/reject`),
  getReplacements: () => api.get('/admin/replacements'),
  approveReplacement: (id) => api.put(`/admin/replacements/${id}/approve`),
  rejectReplacement: (id) => api.put(`/admin/replacements/${id}/reject`),
  getRefunds: () => api.get('/admin/refunds'),
  completeRefund: (id) => api.put(`/admin/refunds/${id}/complete`),
  // Analytics
  getLowStock: () => api.get('/admin/dashboard/low-stock'),
  getRecentOrders: () => api.get('/admin/dashboard/recent-orders'),
  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deactivateCoupon: (id) => api.patch(`/admin/coupons/${id}/deactivate`),
  deleteReview: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),
  // Banners
  getAllBanners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  toggleBanner: (id) => api.patch(`/admin/banners/${id}/toggle`),
  // Questions
  getAdminQuestions: () => api.get('/admin/questions'),
  answerQuestion: (id, data) => api.put(`/admin/questions/${id}/answer`, data),
};

// ===================== BANNER APIs =====================

export const bannerAPI = {
  getActive: () => api.get('/banners/active'),
};

export default api;
