"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog"
import { X } from "lucide-react" // Remove Lock import
import api from "@/services/api"
import { useLock } from '@/context/LockContext';
import { useNavigate } from 'react-router-dom';

interface PasswordModalProps {
  className?: string
}

interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: {
      id: number
      first_name: string
      last_name: string
      contact_value: string
      contact_type_id: number
      accessed_at: string
      created_at: string
      updated_at: string
    }
    timestamp: string
  }
}

export default function PasswordModal({ className }: PasswordModalProps) {
  const { unlock } = useLock();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsError(false)
    setErrorMessage("")

    try {
      const response = await api.post<LoginResponse>('/api/scraping/login', {
        contact_value: email,
        password: password
      })

      if (response.data.success) {
        setIsSuccess(true)
        unlock();
        setTimeout(() => {
          setIsOpen(false);
          navigate('/');
        }, 2000);
      }
    } catch (error: any) {
      setIsError(true)
      setErrorMessage(
        error.response?.data?.details || 
        error.response?.data?.message || 
        "Failed to sign in. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setIsError(false)
    setErrorMessage("")
    setIsLoading(false)
    setIsSuccess(false)
  }

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(true)}
        className="text-white hover:text-gray-200 font-medium text-base transition-colors duration-200 font-recoleta underline underline-offset-4"
      >
        Already have an account? Sign in here
      </button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/90 border border-white/20 shadow-lg font-recoleta p-8">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold font-recoleta">Sign In</DialogTitle>
            <DialogDescription className="text-base font-recoleta">
              Enter your credentials to access your account and exclusive collection.
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

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
              <div className="grid w-full items-center gap-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="email" className="font-recoleta">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className={`w-full font-recoleta py-6 ${isError ? "border-red-500" : ""}`}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="password" className="font-recoleta">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={`w-full font-recoleta py-6 ${isError ? "border-red-500" : ""}`}
                  />
                </div>

                {isError && (
                  <p className="text-sm text-red-500 mt-1 text-center font-recoleta">
                    {errorMessage}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full font-recoleta py-6 mt-4" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
