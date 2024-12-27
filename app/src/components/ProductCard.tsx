import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  title: string
  subtitle: string
  imageUrl: string
  isLimitedEdition?: boolean
  colorVariant?: string
}

export default function ProductCard({
  title = "Product Title",
  subtitle = "Product Subtitle",
  imageUrl = "/placeholder.svg?height=400&width=400",
  isLimitedEdition = false,
  colorVariant
}: ProductCardProps) {
  return (
    <div className="w-[280px] p-4 bg-transparent">
      <div className="overflow-hidden bg-white rounded-2xl shadow-lg">
        <div className="relative">
          {isLimitedEdition && (
            <Badge
              className="absolute right-3 top-3 bg-blue-500 text-white hover:bg-blue-500/90 z-10"
            >
              LIMITED EDITION
            </Badge>
          )}
          <div className="aspect-square bg-white p-4">
            <div className="w-full h-full bg-[#f2f2f2] rounded-xl flex items-center justify-center p-6">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
          {colorVariant && (
            <div className="mt-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colorVariant }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 