import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { useAuth } from '../context/AuthContext';

interface ReviewFormProps {
  productId: number;
  onSubmit: (review: { rating: number; text: string }) => void;
  onCancel: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ 
  productId, 
  onSubmit, 
  onCancel 
}) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoggedIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('Please log in to submit a review');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({ rating, text: reviewText });
      setRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Write a Review
        </h3>
        <p className="text-gray-600 mb-4">
          Please log in to submit a review for this product.
        </p>
        <button className="px-4 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-900 transition-colors">
          Log In to Review
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Write a Review
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating *
          </label>
          <StarRating
            rating={rating}
            interactive={true}
            onRatingChange={setRating}
            size="lg"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            placeholder="Share your experience with this product..."
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {reviewText.length}/500 characters
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="flex-1 py-2 px-4 bg-black text-white font-medium rounded-full hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}; 