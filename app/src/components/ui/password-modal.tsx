"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog"
import { X, Lock } from "lucide-react"

interface PasswordModalProps {
  className?: string
}

export default function PasswordModal({ className }: PasswordModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsError(false)

    // Simulate password verification
    setTimeout(() => {
      // For demo purposes, let's say the password is "fashion2023"
      if (password === "fashion2023") {
        // Show success message instead of redirecting
        setIsSuccess(true)
        setIsLoading(false)

        // Close modal after showing success message for 3 seconds
        setTimeout(() => {
          setIsSuccess(false)
          setIsOpen(false)
          setPassword("")
        }, 3000)
      } else {
        setIsError(true)
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <div className={className}>
      {/* Secondary Button - Text link style */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-white hover:text-gray-200 font-medium text-base transition-colors duration-200 font-recoleta underline underline-offset-4"
      >
        Already have a password? Enter here
      </button>

      {/* Password Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/90 border border-white/20 shadow-lg font-recoleta p-8">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold font-recoleta">Enter Exclusive Access</DialogTitle>
            <DialogDescription className="text-base font-recoleta">
              Enter your early access password to shop now. Enjoy a relaxed shopping experience without the pressure of
              the official drop day.
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex items-center justify-center py-4">
            <div className="rounded-full bg-gray-100 p-3">
              <Lock className="h-6 w-6 text-gray-600" />
            </div>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 font-recoleta">Access Granted!</h3>
              <p className="mt-2 text-gray-500 font-recoleta">You now have access to our exclusive collection.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="password" className="font-recoleta">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password"
                  required
                  className={`w-full font-recoleta py-6 ${isError ? "border-red-500" : ""}`}
                />
                {isError && (
                  <p className="text-sm text-red-500 mt-1 font-recoleta">Incorrect password. Please try again.</p>
                )}
              </div>

              <Button type="submit" className="w-full font-recoleta py-6 mt-4" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Access Now"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
