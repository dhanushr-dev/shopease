import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import Loader from '../components/Loader.jsx';
import { handleImageError, getProductImage } from '../utils/imageUtils.js';
import { HiOutlineShoppingCart, HiOutlineStar, HiOutlineMinus, HiOutlinePlus, HiArrowLeft, HiOutlineHeart, HiHeart, HiStar } from 'react-icons/hi';
import { useWishlist } from '../context/WishlistContext.jsx';
import ProductReviews from '../components/ProductReviews.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // 'valid', 'invalid', 'checking'
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(false);
        setQuantity(1);
        setSelectedVariants({});
        const res = await productAPI.getById(id);
        const p = res.data.data || res.data;
        setProduct(p);

        // Auto-select first option for each variant category
        if (p.variants && p.variants.length > 0) {
           const parsed = parseVariants(p.variants);
           const initialSelection = {};
           Object.keys(parsed).forEach(key => {
             initialSelection[key] = parsed[key][0];
           });
           setSelectedVariants(initialSelection);
        }

        // Fetch related products
        if (p.categoryId) {
           const relatedRes = await productAPI.getAll({ categoryId: p.categoryId, page: 0, size: 5 });
           const items = relatedRes.data.data?.content || [];
           setRelatedProducts(items.filter(item => item.id.toString() !== id.toString()).slice(0, 4));
        }

        // Track Recently Viewed
        const recentlyViewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        const updatedRecent = [
          { id: p.id, name: p.name, imageUrl: p.imageUrl, price: p.price },
          ...recentlyViewed.filter(item => item.id !== p.id)
        ].slice(0, 6);
        localStorage.setItem('recently_viewed', JSON.stringify(updatedRecent));

        // Fetch Questions
        fetchQuestions(id);

      } catch (err) { 
        console.error('Failed to fetch product:', err); 
        setError(true);
      }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const fetchQuestions = async (productId) => {
    try {
      const res = await productAPI.getQuestions(productId);
      setQuestions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      setSubmittingQuestion(true);
      await productAPI.askQuestion(id, { question: newQuestion });
      setNewQuestion('');
      fetchQuestions(id);
    } catch (err) {
      console.error('Error asking question:', err);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const checkPincode = () => {
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      setPincodeStatus('invalid');
      return;
    }
    setPincodeStatus('checking');
    setTimeout(() => {
      setPincodeStatus('valid');
    }, 600);
  };

  const parseVariants = (variantsList) => {
    if (!variantsList || !Array.isArray(variantsList)) return {};
    const grouped = {};
    variantsList.forEach(v => {
      if (v.includes(':')) {
        const [cat, val] = v.split(':').map(s => s.trim());
        if (!grouped[cat]) grouped[cat] = [];
        if (!grouped[cat].includes(val)) grouped[cat].push(val);
      }
    });
    return grouped;
  };

  const handleVariantSelect = (cat, val) => {
    setSelectedVariants(prev => ({ ...prev, [cat]: val }));
  };

  const getDeliveryEstimate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 5);
    
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return `Delivery by ${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

  if (loading) return <Loader message="Loading product..." />;
  if (error) return (
    <div className="section-container py-20 text-center animate-fade-in">
      <p className="text-5xl mb-4">⚠️</p>
      <h2 className="text-2xl font-bold text-surface-800 mb-2">Unable to load product details. Please try again.</h2>
      <Link to="/products" className="btn-primary mt-4">Back to Products</Link>
    </div>
  );
  if (!product) return (
    <div className="section-container py-20 text-center animate-fade-in">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-2xl font-bold text-surface-800 mb-2">Product not found.</h2>
      <Link to="/products" className="btn-primary mt-4">Back to Products</Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="section-container py-8">
        <div className="flex items-center gap-2 text-sm font-medium text-surface-500 mb-6">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-surface-900 truncate">{product.name}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-surface-200 relative">
            <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" onError={(e) => handleImageError(e, product.categoryName)} />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.stock > 0 && product.stock < 10 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Limited Stock</span>
              )}
              {product.averageRating >= 4.5 && (
                <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Top Rated</span>
              )}
              {new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">New Arrival</span>
              )}
            </div>

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-surface-900/60 flex items-center justify-center">
                <span className="px-6 py-3 bg-white/90 rounded-xl text-lg font-semibold text-red-600">Out of Stock</span>
              </div>
            )}
          </div>
          {/* Details */}
          <div className="flex flex-col">
            {product.categoryName && <span className="badge-primary w-fit mb-3">{product.categoryName}</span>}
            <h1 className="text-2xl md:text-3xl font-bold text-surface-900 font-display mb-2">{product.name}</h1>
            {product.brand && <p className="text-sm text-surface-500 mb-4">by <span className="font-medium text-surface-700">{product.brand}</span></p>}
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                star <= Math.round(Number(product.averageRating || 0)) ? 
                  <HiStar key={star} className="w-5 h-5 text-amber-400" /> :
                  <HiOutlineStar key={star} className="w-5 h-5 text-surface-300" />
              ))}
              <span className="text-sm text-surface-500 ml-1">
                ({Number(product.averageRating || 0).toFixed(1)}) · {product.reviewCount || 0} reviews
              </span>
            </div>
            <p className="text-3xl font-bold text-surface-900 mb-6">{formatPrice(product.price)}</p>
            <p className="text-surface-600 leading-relaxed mb-6">{product.description}</p>
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Delivery Estimate & Pincode Check */}
            {product.stock > 0 && (
              <div className="p-4 bg-surface-50 rounded-xl mb-6 border border-surface-200">
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.slice(0,6))}
                    placeholder="Enter pincode" 
                    className="flex-1 input-field !py-2 !px-3 !text-sm"
                  />
                  <button 
                    onClick={checkPincode}
                    className="btn-secondary !py-2 !px-4 !text-sm whitespace-nowrap"
                  >
                    Check
                  </button>
                </div>
                
                {pincodeStatus === 'checking' && <p className="text-xs text-surface-500 animate-pulse">Checking availability...</p>}
                {pincodeStatus === 'invalid' && <p className="text-xs text-red-500 font-medium">Invalid pincode. Please enter 6 digits.</p>}
                {pincodeStatus === 'valid' && (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Serviceable: {getDeliveryEstimate()}
                    </p>
                    <p className="text-xs text-surface-600">COD available • Free delivery</p>
                  </div>
                )}
                {!pincodeStatus && (
                   <p className="text-xs text-surface-500 italic">Enter pincode to check delivery date</p>
                )}
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6 space-y-4">
                {Object.entries(parseVariants(product.variants)).map(([cat, values]) => (
                  <div key={cat}>
                    <p className="text-sm font-bold text-surface-900 mb-2">{cat}: <span className="font-medium text-primary-600">{selectedVariants[cat]}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {values.map(val => (
                        <button 
                          key={val}
                          onClick={() => handleVariantSelect(cat, val)}
                          className={`px-4 py-2 border rounded-lg text-sm transition-all duration-200
                            ${selectedVariants[cat] === val ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold ring-2 ring-primary-600/20' : 'border-surface-200 text-surface-700 hover:border-surface-400'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {product.stock > 0 && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-surface-700">Quantity:</span>
                  <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-surface-100 transition-colors"><HiOutlineMinus className="w-4 h-4" /></button>
                    <span className="px-5 py-2 text-sm font-semibold min-w-[3rem] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2.5 hover:bg-surface-100 transition-colors"><HiOutlinePlus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button onClick={() => {
                    const finalVariant = Object.entries(selectedVariants).map(([k,v]) => `${k}: ${v}`).join(', ');
                    addToCart(product.id, quantity, finalVariant || null);
                  }} className="btn-primary flex-1 !py-3.5 gap-2" id="add-to-cart-btn">
                    <HiOutlineShoppingCart className="w-5 h-5" /> Add to Cart
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product.id)} 
                    className="btn-secondary !py-3.5 gap-2 border-surface-200"
                  >
                    {isInWishlist(product.id) ? (
                      <><HiHeart className="w-5 h-5 text-red-500" /> Saved to Wishlist</>
                    ) : (
                      <><HiOutlineHeart className="w-5 h-5 text-surface-500" /> Save to Wishlist</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Reviews Section */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-surface-200">
            <h2 className="text-2xl font-bold text-surface-900 mb-6 font-display">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(rp => (
                <Link key={rp.id} to={`/products/${rp.id}`} className="group bg-white rounded-2xl border border-surface-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <div className="aspect-square relative overflow-hidden bg-surface-100">
                    <img src={getProductImage(rp)} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => handleImageError(e, rp.categoryName)} />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-sm font-semibold text-surface-900 truncate mb-1 group-hover:text-primary-600 transition-colors">{rp.name}</p>
                    <p className="text-primary-600 font-bold text-sm mt-auto">{formatPrice(rp.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Q&A Section */}
        <div className="mt-16 pt-8 border-t border-surface-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-surface-900 font-display">Questions & Answers</h2>
            <span className="text-sm text-surface-500">{questions.length} questions</span>
          </div>

          {/* Ask Question Form */}
          <div className="bg-surface-50 p-6 rounded-2xl border border-surface-200 mb-10">
            <h3 className="text-sm font-bold text-surface-900 mb-4 uppercase tracking-wider">Have a question?</h3>
            <form onSubmit={handleAskQuestion} className="space-y-4">
              <textarea 
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="input-field min-h-[100px]"
                maxLength={500}
              />
              <button 
                type="submit" 
                disabled={submittingQuestion || !newQuestion.trim()}
                className="btn-primary !py-2.5 !px-6 !text-sm"
              >
                {submittingQuestion ? 'Posting...' : 'Post Question'}
              </button>
            </form>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {questions.length > 0 ? (
              questions.map((q) => (
                <div key={q.id} className="pb-6 border-b border-surface-100 last:border-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center text-xs font-bold text-surface-600 shrink-0">Q</div>
                    <div>
                      <p className="text-surface-900 font-medium leading-relaxed">{q.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-surface-500">{q.userName}</span>
                        <span className="text-[10px] text-surface-300">•</span>
                        <span className="text-xs text-surface-400">{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {q.answer ? (
                    <div className="flex items-start gap-3 ml-6 md:ml-10 bg-primary-50/50 p-4 rounded-xl border border-primary-100/50">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">A</div>
                      <div>
                        <p className="text-surface-800 text-sm leading-relaxed">{q.answer}</p>
                        <p className="text-[10px] text-primary-500 font-bold uppercase tracking-wider mt-2">Verified Seller</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-surface-400 italic ml-11">Awaiting answer from seller...</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-surface-400">No questions asked yet. Be the first to ask!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
