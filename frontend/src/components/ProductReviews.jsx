import { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import toast from 'react-hot-toast';
import { HiStar } from 'react-icons/hi';

export default function ProductReviews({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviewsAndSummary();
  }, [productId]);

  const fetchReviewsAndSummary = async () => {
    try {
      setLoading(true);
      const [reviewsRes, summaryRes] = await Promise.all([
        reviewAPI.getByProduct(productId),
        reviewAPI.getSummary(productId)
      ]);
      setReviews(reviewsRes.data.data || []);
      setSummary(summaryRes.data.data || null);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      toast.error('Please provide both rating and comment');
      return;
    }
    
    try {
      setSubmitting(true);
      await reviewAPI.create(productId, { rating, comment });
      toast.success('Review submitted successfully!');
      setShowForm(false);
      setComment('');
      setRating(5);
      fetchReviewsAndSummary(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review. Have you purchased this item?');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) return <div className="py-8 text-center text-surface-500 animate-pulse">Loading reviews...</div>;

  return (
    <div className="mt-16 pt-10 border-t border-surface-200">
      <h2 className="text-2xl font-bold text-surface-900 font-display mb-8">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Summary Column */}
        <div className="md:col-span-4">
          <div className="bg-surface-50 rounded-2xl p-6 border border-surface-200 sticky top-24">
            <div className="text-center mb-6">
              <h3 className="text-5xl font-bold text-surface-900 mb-2">
                {Number(summary?.averageRating || 0).toFixed(1)}
              </h3>
              <div className="flex justify-center mb-2">
                <StarRating rating={Number(summary?.averageRating || 0)} size="w-6 h-6" />
              </div>
              <p className="text-surface-500">{summary?.totalReviews || 0} reviews</p>
            </div>
            
            {/* Distribution bars */}
            <div className="space-y-3 mb-8">
              {[5, 4, 3, 2, 1].map(star => {
                const count = summary?.ratingDistribution?.[star] || 0;
                const total = summary?.totalReviews || 1; // avoid division by zero
                const percentage = summary?.totalReviews ? (count / total) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-12 font-medium text-surface-700 flex items-center">{star} <HiStar className="w-4 h-4 ml-1 text-amber-400" /></span>
                    <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-right text-surface-500">{count}</span>
                  </div>
                );
              })}
            </div>
            
            {user ? (
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="btn-primary w-full"
              >
                {showForm ? 'Cancel Review' : 'Write a Review'}
              </button>
            ) : (
              <p className="text-sm text-center text-surface-500">Log in to write a review</p>
            )}
          </div>
        </div>

        {/* Reviews List & Form */}
        <div className="md:col-span-8">
          {showForm && (
            <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-sm mb-8 animate-slide-down">
              <h3 className="text-lg font-bold text-surface-900 mb-4">Write your review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Rating</label>
                  <StarRating rating={rating} onChange={setRating} readOnly={false} size="w-8 h-8" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Comment</label>
                  <textarea
                    className="input-field min-h-[100px]"
                    placeholder="What did you like or dislike? What did you use this product for?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-surface-50 rounded-2xl border border-surface-100">
              <p className="text-4xl mb-4">✍️</p>
              <h3 className="text-lg font-bold text-surface-900 mb-1">No reviews yet</h3>
              <p className="text-surface-500">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                        {review.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-surface-900">{review.userName}</p>
                        <p className="text-xs text-surface-500">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size="w-4 h-4" />
                  </div>
                  <p className="text-surface-700 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
