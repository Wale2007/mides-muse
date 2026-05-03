import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ReviewSection.css';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    first_name: string;
  };
}

const ReviewSection = ({ productId }: { productId: string }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(first_name)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReviews(data);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('You must be logged in to leave a review.');

    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
      })
      .select('*, profiles(first_name)')
      .single();

    if (error) {
      toast.error('Failed to submit review');
    } else if (data) {
      toast.success('Review submitted!');
      setReviews([data, ...reviews]);
      setComment('');
      setRating(5);
    }
    setLoading(false);
  };

  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="review-section">
      <div className="review-header">
        <h2>Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className="review-summary">
            <span className="avg-rating">{avgRating}</span>
            <div className="stars">
              {[1,2,3,4,5].map(s => <FiStar key={s} fill={s <= Math.round(Number(avgRating)) ? "var(--rose-gold)" : "none"} color="var(--rose-gold)" />)}
            </div>
            <span className="review-count">({reviews.length} reviews)</span>
          </div>
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        )}
      </div>

      {user ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <h4>Write a Review</h4>
          <div className="rating-select">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                size={24}
                className={`star-select ${rating >= star ? 'active' : ''}`}
                fill={rating >= star ? 'var(--rose-gold)' : 'none'}
                color="var(--rose-gold)"
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <textarea
            placeholder="What did you think about this piece?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="login-prompt">
          <p>Please log in to leave a review.</p>
        </div>
      )}

      <div className="review-list">
        {reviews.map((r) => (
          <div key={r.id} className="review-item">
            <div className="review-item-header">
              <span className="reviewer-name">{r.profiles?.first_name || 'Anonymous'}</span>
              <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar key={star} size={14} fill={r.rating >= star ? "var(--rose-gold)" : "none"} color="var(--rose-gold)" />
              ))}
            </div>
            <p className="review-comment">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
