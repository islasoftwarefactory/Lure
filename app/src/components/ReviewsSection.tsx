import React, { useState, useEffect } from 'react';
import { ReviewSummary } from './ReviewSummary';
import { ReviewCard } from './ReviewCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Simulated review data (will be replaced with API calls)
const mockReviews = [
  {
    id: 1,
    user_name: "Sarah Johnson",
    rating: 5,
    review_text: "Absolutely love this product! The quality exceeded my expectations and it arrived quickly. The fit is perfect and the material feels premium. Would definitely recommend to anyone looking for something like this.",
    created_at: "2024-01-15",
    verified_purchase: true,
    helpful_votes: 12
  },
  {
    id: 2,
    user_name: "Mike Chen",
    rating: 4,
    review_text: "Great product overall. Very satisfied with the purchase. The only minor issue is that it took a bit longer to ship than expected, but the quality makes up for it.",
    created_at: "2024-01-10",
    verified_purchase: true,
    helpful_votes: 8
  },
  {
    id: 3,
    user_name: "Emma Rodriguez",
    rating: 5,
    review_text: "This is exactly what I was looking for! Perfect size, great quality, and excellent customer service. I've already ordered another one as a gift.",
    created_at: "2024-01-08",
    verified_purchase: true,
    helpful_votes: 15
  },
  {
    id: 4,
    user_name: "David Kim",
    rating: 4,
    review_text: "Good value for money. The product works as described and the quality is decent. Installation was straightforward and it looks good.",
    created_at: "2024-01-05",
    verified_purchase: false,
    helpful_votes: 5
  },
  {
    id: 5,
    user_name: "Lisa Thompson",
    rating: 5,
    review_text: "Fantastic! This product has exceeded all my expectations. The build quality is outstanding and it's been working perfectly for weeks now. Highly recommend!",
    created_at: "2024-01-02",
    verified_purchase: true,
    helpful_votes: 20
  }
];

interface ReviewsSectionProps {
  productId: number;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId }) => {
  const [reviews, setReviews] = useState(mockReviews);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Calculate review statistics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const recommendationPercentage = Math.round(
    (reviews.filter(r => r.rating >= 4).length / totalReviews) * 100
  );

  // Featured testimonial carousel
  const featuredTestimonials = reviews.filter(r => r.rating === 5).slice(0, 3);

  const handleHelpfulClick = (reviewId: number) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpful_votes: review.helpful_votes + 1 }
          : review
      )
    );
  };

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === featuredTestimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === 0 ? featuredTestimonials.length - 1 : prev - 1
    );
  };

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  if (totalReviews === 0) {
    return null;
  }

  return (
    <div className="mt-16 sm:mt-24 lg:mt-32 pb-12 sm:pb-16">
      {/* Featured Testimonial Bar - Inspired by the image */}
      <div className="mb-12">
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <button 
              onClick={prevTestimonial}
              className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            
            <div className="flex-1 text-center px-4">
              <div className="flex justify-center mb-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="w-5 h-5 text-yellow-400 fill-current">
                      ★
                    </div>
                  ))}
                </div>
              </div>
              <blockquote className="text-lg sm:text-xl font-medium text-gray-900 mb-3">
                "{featuredTestimonials[currentTestimonialIndex]?.review_text}"
              </blockquote>
              <cite className="text-sm text-gray-600 font-medium">
                - {featuredTestimonials[currentTestimonialIndex]?.user_name}
              </cite>
            </div>
            
            <button 
              onClick={nextTestimonial}
              className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {featuredTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonialIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTestimonialIndex ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
          Customer Reviews
        </h2>
        <p className="text-gray-600 text-lg">
          See what our customers are saying about this product
        </p>
      </div>

      {/* Review Summary */}
      <div className="mb-8">
        <ReviewSummary
          averageRating={averageRating}
          totalReviews={totalReviews}
          ratingDistribution={ratingDistribution}
          recommendationPercentage={recommendationPercentage}
        />
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          All Reviews ({totalReviews})
        </h3>
        <div className="grid gap-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpfulClick={handleHelpfulClick}
            />
          ))}
        </div>
      </div>

      {/* Load More Button */}
      <div className="text-center mt-8">
        <button className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors">
          Load More Reviews
        </button>
      </div>
    </div>
  );
}; 