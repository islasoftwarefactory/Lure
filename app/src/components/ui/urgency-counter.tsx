"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function UrgencyCounter() {
  // Calculate days left until June 20th
  const calculateDaysLeft = () => {
    const today = new Date()
    const targetDate = new Date(today.getFullYear(), 5, 20) // Month is 0-indexed, so 5 = June

    // If today is past June 20th, use next year's date
    if (today > targetDate) {
      targetDate.setFullYear(today.getFullYear() + 1)
    }

    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const [daysLeft, setDaysLeft] = useState(calculateDaysLeft())

  useEffect(() => {
    // Update days left once per day
    const interval = setInterval(() => {
      setDaysLeft(calculateDaysLeft())
    }, 86400000) // 24 hours in milliseconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center bg-red-600/80 text-white py-2 px-4 rounded-full mt-4 animate-pulse">
      <Clock className="mr-2 h-4 w-4" />
      <p className="text-sm font-medium">Only {daysLeft} days left to secure your early access privilege</p>
    </div>
  )
}
