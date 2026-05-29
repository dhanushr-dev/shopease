import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import { HiOutlineSearch, HiOutlineAdjustments, HiX, HiRefresh } from 'react-icons/hi';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [selectedCategory, sortBy, searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.data || []);
    } catch (err) { console.error('Failed to fetch categories:', err); }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const keyword = searchParams.get('search') || '';
      let apiSortBy = 'createdAt';
      let apiSortDir = 'desc';
      if (sortBy === 'price-low') {
        apiSortBy = 'price';
        apiSortDir = 'asc';
      } else if (sortBy === 'price-high') {
        apiSortBy = 'price';
        apiSortDir = 'desc';
      } else if (sortBy === 'name-asc') {
        apiSortBy = 'name';
        apiSortDir = 'asc';
      } else if (sortBy === 'name-desc') {
        apiSortBy = 'name';
        apiSortDir = 'desc';
      }
      const params = { page: 0, size: 20, sortBy: apiSortBy, sortDir: apiSortDir };
      if (selectedCategory) params.categoryId = selectedCategory;
      if (keyword) params.keyword = keyword;

      const res = await productAPI.getAll(params);
      const data = res.data;
      setProducts(data.data?.content || data.content || data.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanSearch = searchQuery.trim();
    if (cleanSearch) {
      setSearchParams(prev => {
        prev.set('search', cleanSearch);
        return prev;
      });
    } else {
      setSearchParams(prev => {
        prev.delete('search');
        return prev;
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams(prev => {
      prev.delete('search');
      return prev;
    });
  };

  const handleRefresh = async () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('newest');
    setSearchParams({}); // Clear all params
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 py-10 md:py-14">
        <div className="section-container text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">Our Products</h1>
          <p className="text-white/70 max-w-md mx-auto">Discover amazing products at unbeatable prices</p>
          <form onSubmit={handleSearch} className="mt-6 max-w-lg mx-auto">
            <div className="relative group">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products..." 
                className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/95 backdrop-blur text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg transition-all" 
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-all"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <HiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="section-container py-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-2 text-sm text-surface-600 font-medium">
            <HiOutlineAdjustments className="w-4 h-4" /> Filters:
          </div>
          
          <button 
            onClick={() => { setSelectedCategory(''); setSearchParams(prev => { prev.delete('category'); return prev; }); }}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all shadow-sm ${!selectedCategory ? 'bg-primary-600 text-white shadow-primary-200' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
          >
            All
          </button>
          
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => { setSelectedCategory(String(cat.id)); setSearchParams(prev => { prev.set('category', String(cat.id)); return prev; }); }}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all shadow-sm ${selectedCategory === String(cat.id) ? 'bg-primary-600 text-white shadow-primary-200' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
            >
              {cat.name}
            </button>
          ))}
          
          <div className="flex-1 min-w-[10px]"></div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-surface-200 transition-all
              ${loading ? 'bg-surface-50 text-surface-400 cursor-not-allowed' : 'bg-white text-surface-600 hover:bg-surface-50 hover:border-surface-300 active:scale-95'}`}
            title="Refresh all products and reset filters"
          >
            <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>
        {loading ? (<Loader message="Loading products..." />) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-xl font-semibold text-surface-700 mb-2">No products found</h3>
            <p className="text-surface-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
