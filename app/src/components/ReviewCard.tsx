import React from 'react';
import { StarRating } from './StarRating';
import { CheckCircle, ThumbsUp } from 'lucide-react';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  review_text: string;
  created_at: string;
  verified_purchase: boolean;
  helpful_votes: number;
  user_avatar?: string;
}

interface ReviewCardProps {
  review: Review;
  onHelpfulClick: (reviewId: number) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpfulClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {review.user_avatar ? (
            <img 
              src={review.user_avatar} 
              alt={review.user_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-sm">
                {getInitials(review.user_name)}
              </span>
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
            {review.verified_purchase && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle size={16} />
                <span className="text-xs font-medium">Verified Purchase</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm text-gray-500">
              {formatDate(review.created_at)}
            </span>
          </div>

          <p className="text-gray-700 mb-4 leading-relaxed">
            {review.review_text}
          </p>

          {/* Helpful Button */}
          <button
            onClick={() => onHelpfulClick(review.id)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ThumbsUp size={16} />
            <span>Helpful ({review.helpful_votes})</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 