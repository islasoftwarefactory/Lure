import { Badge } from "@/components/ui/badge"
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  title: string
  subtitle: string
  imageUrl: string
  isLimitedEdition?: boolean
  colorVariant?: string
  onClick?: () => void
  productId: string
  price?: number
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
}: ProductCardProps) {
  const { token } = useAuth();

  const handleClick = async () => {
    try {
      // Registra visualização do produto com token
      await fetch(`/product/read/1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (onClick) onClick();
    } catch (error) {
      console.error('Error registering product view:', error);
      if (onClick) onClick();
    }
  };

  return (
    <div 
      className="w-full max-w-[380px] p-2 bg-transparent cursor-pointer" 
      onClick={handleClick}
    >
      <div className="overflow-hidden bg-white rounded-[30px] shadow-lg h-full flex flex-col">
        <div className="relative">
          {isLimitedEdition && (
            <Badge
              className="absolute right-3 top-3 bg-blue-500 text-white hover:bg-blue-500/90 z-10 font-aleo text-base"
            >
              LIMITED EDITION
            </Badge>
          )}
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
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-xl sm:text-2xl font-aleo flex-1 mr-2">{title}</h3>
            {price && <span className="font-bold text-xl sm:text-2xl font-aleo">${price.toFixed(2)}</span>}
          </div>
          <p className="text-sm sm:text-base text-gray-500 font-aleo mt-2 flex-grow">{subtitle}</p>
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