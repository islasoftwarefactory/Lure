'use client'

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { SideCart } from "./SideCart";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { PlusCircle, MapPin } from 'lucide-react';

// Interface for Address data based on the backend model
interface Address {
  id: number;
  street: string;
  number: number;
  city: string;
  state: string;
  zip_code: string;
}

// Interface for User data, to get the user ID
interface UserData {
  id: number;
}

export function AddressesPage() {
  const navigate = useNavigate();
  const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDataAndAddresses = async () => {
      if (!token) {
        setError("You must be logged in to view your addresses.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First, get the user ID
        const userResponse = await api.get<{ data: UserData }>('/user/me');
        const userId = userResponse.data.data.id;

        if (!userId) {
            throw new Error("Could not retrieve user information.");
        }

        // Then, fetch the addresses for that user
        const addressResponse = await api.get(`/address/read/all/${userId}`);
        if (addressResponse.data && Array.isArray(addressResponse.data.data)) {
          setAddresses(addressResponse.data.data);
        } else {
          setAddresses([]); // Set as empty array if no addresses are found
        }
      } catch (err: any) {
        console.error("Error fetching addresses:", err);
        setError(err.response?.data?.message || "Failed to load addresses.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndAddresses();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
        <AnnouncementBar />
        <Header onCartClick={() => setIsCartOpen(true)} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-gray-600">Loading your addresses...</div>
        </main>
        <Footer />
        <SideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} setItems={setCartItems} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
        <AnnouncementBar />
        <Header onCartClick={() => setIsCartOpen(true)} />
        <main className="flex-grow flex items-center justify-center text-center p-4">
          <div>
            <p className="text-red-600 font-semibold">Could not load addresses</p>
            <p className="text-red-500 mt-1">{error}</p>
            <Button onClick={() => navigate('/login')} className="mt-6">Go to Login</Button>
          </div>
        </main>
        <Footer />
        <SideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} setItems={setCartItems} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main className="flex-grow pt-32 sm:pt-36 pb-20">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">My Addresses</h1>
            <Button 
                onClick={() => navigate('/addresses/new')} 
                className="flex items-center gap-2"
            >
              <PlusCircle size={20} />
              Add New Address
            </Button>
          </div>

          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between border border-transparent hover:border-blue-500 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                        <MapPin className="text-blue-500" size={24} />
                        <h2 className="font-bold text-xl text-gray-800">Address</h2>
                    </div>
                    <div className="space-y-2 text-gray-700">
                        <p><span className="font-semibold">Street:</span> {address.street}, {address.number}</p>
                        <p><span className="font-semibold">City:</span> {address.city}</p>
                        <p><span className="font-semibold">State:</span> {address.state}</p>
                        <p><span className="font-semibold">ZIP:</span> {address.zip_code}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
                     <Button variant="outline" size="sm">Edit</Button>
                     <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 bg-white rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800">No Saved Addresses</h2>
              <p className="text-gray-500 mt-3 max-w-md mx-auto">You haven't added any addresses yet. Add one to make your future checkouts faster and easier.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <SideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} setItems={setCartItems} />
    </div>
  );
} 