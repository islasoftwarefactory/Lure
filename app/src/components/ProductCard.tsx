import { Badge } from "@/components/ui/badge"
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';
import React from 'react';

interface ProductCardProps {
  title: string
  subtitle?: string
  imageUrl: string
  isLimitedEdition?: boolean
  colorVariant?: string
  onClick?: () => void
  productId: string
  price?: number
  isFavorite?: boolean;
  onToggleFavorite?: (event: React.MouseEvent) => void;
}

export default function ProductCard({
  title,
  subtitle,
  imageUrl,
  isLimitedEdition = false,
  colorVariant,
  onClick,
  productId,
  price,
  isFavorite,
  onToggleFavorite,
}: ProductCardProps) {
  const { token } = useAuth();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click from triggering when clicking the favorite button
    if ((e.target as HTMLElement).closest('.favorite-button')) {
      return;
    }
    if (onClick) onClick();
  };

  return (
    <div 
      className="w-full max-w-[380px] p-2 bg-transparent cursor-pointer" 
      onClick={handleCardClick}
    >
      <div className="overflow-hidden bg-white rounded-[30px] shadow-lg h-full flex flex-col">
        <div className="relative">
          {isLimitedEdition && (
            <Badge
              className="absolute left-3 top-3 bg-blue-500 text-white hover:bg-blue-500/90 z-10 font-aleo text-base"
            >
              LIMITED EDITION
            </Badge>
          )}
          <button
            onClick={onToggleFavorite}
            className="favorite-button absolute top-3 right-3 z-10 p-2 bg-white/70 rounded-full hover:bg-white transition-colors"
            aria-label="Toggle Favorite"
          >
            <Heart
              className={`w-6 h-6 ${
                isFavorite ? 'text-red-500 fill-current' : 'text-gray-500'
              }`}
            />
          </button>
          <div className="aspect-square bg-white p-4 sm:p-8">
            <div className="w-full h-full bg-[#f2f2f2] rounded-xl flex items-center justify-center">
              <img
                src={imageUrl}
                alt={title}
                className="w-[90%] h-[90%] object-contain"
              />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 flex-grow flex flex-col">
          <div className="bg-gray-50 rounded-lg p-4 flex-grow flex flex-col">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-xl sm:text-2xl font-aleo flex-1 mr-2">{title}</h3>
              {price && <span className="font-bold text-xl sm:text-2xl font-aleo">${price.toFixed(2)}</span>}
            </div>
            {subtitle && <p className="text-sm sm:text-base text-gray-500 font-aleo mt-2 flex-grow">{subtitle}</p>}
          </div>
          {colorVariant && (
            <div className="mt-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colorVariant }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 