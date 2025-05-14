"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { X } from "lucide-react"
import api from '@/services/api';

interface WaitlistFormProps {
  className?: string
}

interface ScrapingResponse {
  data: {
    id: number;
    contact_value: string;
    contact_type_id: number;
    created_at: string;
  };
  message: string;
}

interface ApiError {
  error: string;
  details?: string;
}

export default function WaitlistForm({ className }: WaitlistFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<ScrapingResponse>('/scraping/create', {
        contact_value: email,
        contact_type_id: 1, // Assumindo que 1 é o ID para email
        password: null // Opcional neste momento
      });

      setSuccess(true);
      setEmail('');
    } catch (error: any) {
      const apiError = error.response?.data as ApiError;
      setError(
        apiError?.error || 
        'Failed to join waitlist. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {/* Join Waitlist Button - Full width primary button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-white text-black hover:bg-gray-100 border border-gray-200 font-medium py-6 text-lg shadow-md transition-all duration-200 hover:shadow-lg font-recoleta w-full"
      >
        Join Waitlist
      </Button>

      {/* Waitlist Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/90 border border-white/20 shadow-lg font-recoleta">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold font-recoleta">Secure Your Early Access</DialogTitle>
            <DialogDescription className="text-base font-recoleta">
              Enter your details below to join our waitlist.
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {success ? (
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
              <h3 className="text-xl font-medium text-gray-900 font-recoleta">Thank you!</h3>
              <p className="mt-2 text-gray-500 font-recoleta">You've been added to our waitlist.</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 space-y-3 mb-6 font-recoleta">
                <p>
                  You can register any time until 06/20 to receive an exclusive password that grants you access to shop
                  10 days before the official drop.
                </p>
                <p>
                  If you register between 06/21 and 06/30, you'll still get early access — but only 5 days before the
                  drop.
                </p>
                <p>Everyone else who registers after 06/30 will only receive access on the official drop date: 07/10</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="email" className="font-recoleta">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full font-recoleta py-6"
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full font-recoleta py-6 mt-4" disabled={loading}>
                  {loading ? 'Joining...' : 'Join Waitlist'}
                </Button>
              </form>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
