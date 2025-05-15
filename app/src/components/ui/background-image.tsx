"use client"

import type React from "react"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

// Define types for image configuration
export type ImagePosition =
  | "center"
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | string // Allow custom positioning with CSS object-position syntax (e.g., "75% 25%")

export type ImageScaling =
  | "cover" // Fill the container while maintaining aspect ratio
  | "contain" // Ensure the whole image is visible
  | "fill" // Stretch to fill the container
  | "none" // Original size

export interface ImageConfig {
  src: string
  alt: string
  position?: ImagePosition
  scaling?: ImageScaling
  quality?: number // Image quality (1-100)
  blur?: boolean // Apply a slight blur effect
  overlay?: string // CSS color value for overlay (e.g., "rgba(0,0,0,0.5)")
}

interface BackgroundImageProps {
  desktop: ImageConfig
  mobile?: ImageConfig // Optional, will use desktop config if not provided
  className?: string
  transitionDuration?: number // Transition duration in ms
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ desktop, mobile, className, transitionDuration = 300 }) => {
  const isMobile = useMobile()

  // Use mobile config if provided and on mobile device, otherwise use desktop config
  const activeConfig = isMobile && mobile ? mobile : desktop

  // Convert position to CSS object-position value
  const getObjectPosition = (position?: ImagePosition): string => {
    if (!position) return "center"

    // If position contains percentages or is already a custom value, return as is
    if (position.includes("%")) return position

    switch (position) {
      case "center":
        return "center"
      case "top":
        return "center top"
      case "right":
        return "right center"
      case "bottom":
        return "center bottom"
      case "left":
        return "left center"
      case "top-left":
        return "left top"
      case "top-right":
        return "right top"
      case "bottom-left":
        return "left bottom"
      case "bottom-right":
        return "right bottom"
      default:
        return position
    }
  }

  // Convert scaling to CSS object-fit value
  const getObjectFit = (scaling?: ImageScaling): string => {
    if (!scaling) return "cover"
    return scaling
  }

  return (
    <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden">
      {/* Optional overlay */}
      {activeConfig.overlay && (
        <div className="absolute inset-0 w-full h-full z-10" style={{ backgroundColor: activeConfig.overlay }} />
      )}

      <img
        src={activeConfig.src || "/placeholder.svg"}
        alt={activeConfig.alt}
        className={cn("w-full h-full transition-all", activeConfig.blur && "backdrop-blur-sm", className)}
        style={{
          objectFit: getObjectFit(activeConfig.scaling),
          objectPosition: getObjectPosition(activeConfig.position),
          minHeight: "100vh",
          minWidth: "100vw",
          transitionProperty: "object-position, object-fit",
          transitionDuration: `${transitionDuration}ms`,
          transitionTimingFunction: "ease-in-out",
        }}
        loading="eager"
        fetchPriority="high"
      />
    </div>
  )
}

export default BackgroundImage
