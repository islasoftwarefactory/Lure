import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  title: string
  subtitle: string
  imageUrl: string
  isLimitedEdition?: boolean
  colorVariant?: string
  onClick?: () => void
}

export default function ProductCard({
  title = "Product Title",
  subtitle = "Product Subtitle",
  imageUrl = "/placeholder.svg?height=400&width=400",
  isLimitedEdition = false,
  colorVariant,
  onClick
}: ProductCardProps) {
  return (
    <div 
      className="w-[380px] p-2 bg-transparent cursor-pointer" 
      onClick={onClick}
    >
      <div className="overflow-hidden bg-white rounded-[30px] shadow-lg">
        <div className="relative">
          {isLimitedEdition && (
            <Badge
              className="absolute right-3 top-3 bg-blue-500 text-white hover:bg-blue-500/90 z-10 font-aleo text-base"
            >
              LIMITED EDITION
            </Badge>
          )}
          <div className="aspect-square bg-white p-8">
            <div className="w-full h-full bg-[#f2f2f2] rounded-xl flex items-center justify-center p-8">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-medium text-2xl font-aleo">{title}</h3>
          <p className="text-base text-gray-500 font-aleo mt-2">{subtitle}</p>
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