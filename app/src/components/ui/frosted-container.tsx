import type React from "react"
import { cn } from "@/lib/utils"

interface FrostedContainerProps {
  children: React.ReactNode
  className?: string
}

export default function FrostedContainer({ children, className }: FrostedContainerProps) {
  return (
    <div className={cn("backdrop-blur-md bg-white/20 border border-white/20 rounded-xl shadow-lg", className)}>
      {children}
    </div>
  )
}
