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
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, MapPin, Pencil, Trash2 } from 'lucide-react';
import { EditAddressModal } from './EditAddressModal';

// Interface for Address data based on the backend model
interface Address {
  id: number;
  street: string;
  number: number;
  city: string;
  state: string;
  zip_code: string;
  country: string;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

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

  const handleDeleteAddress = async (addressId: number) => {
    try {
      await api.delete(`/address/delete/${addressId}`);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    } catch (err) {
      console.error("Failed to delete address:", err);
      // Optionally, show an error to the user
    }
  };

  const handleOpenEditModal = (address: Address) => {
    setEditingAddress(address);
    setIsEditModalOpen(true);
  };

  const handleSaveAddress = async (updatedAddress: Address) => {
    try {
      const response = await api.put(`/address/update/${updatedAddress.id}`, updatedAddress);
      setAddresses(prev => prev.map(addr => 
        addr.id === updatedAddress.id ? response.data.data : addr
      ));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update address:", err);
      // Optionally, show an error to the user
    }
  };

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
          
          {/* Page Title Block */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold font-aleo text-gray-900">My Addresses</h1>
            <Button 
                onClick={() => navigate('/addresses/new')} 
                className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 rounded-full px-5 py-2.5"
            >
              <PlusCircle size={20} />
              Add New
            </Button>
          </div>

          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="bg-white rounded-2xl shadow-lg flex flex-col h-full transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="flex flex-row items-center gap-4 p-5 bg-gray-50/80 border-b">
                      <div className="p-3 bg-blue-100 rounded-xl">
                          <MapPin className="text-blue-600" size={24} />
                      </div>
                      <div>
                          <CardTitle className="font-bold text-xl text-gray-800">
                              Shipping Address
                          </CardTitle>
                          <CardDescription className="text-gray-500">
                              {address.city}, {address.state}
                          </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 flex-grow space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg border">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Street</label>
                            <p className="text-gray-900 font-medium">{address.street}, {address.number}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">City</label>
                                <p className="text-gray-900 font-medium">{address.city}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">State</label>
                                <p className="text-gray-900 font-medium">{address.state}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ZIP Code</label>
                                <p className="text-gray-900 font-medium">{address.zip_code}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Country</label>
                                <p className="text-gray-900 font-medium">{address.country}</p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-4 bg-gray-50/70 border-t flex justify-end gap-3">
                       <Button 
                           onClick={() => handleOpenEditModal(address)}
                           size="sm" 
                           className="flex items-center gap-2 text-white bg-black hover:bg-gray-800"
                       >
                           <Pencil size={16} /> Edit
                       </Button>
                       <Button 
                           onClick={() => handleDeleteAddress(address.id)}
                           variant="destructive" size="sm" 
                           className="flex items-center gap-2"
                       >
                           <Trash2 size={16} /> Delete
                       </Button>
                    </CardFooter>
                  </Card>
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

      {/* Edit Modal */}
      <EditAddressModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveAddress}
        address={editingAddress}
      />
    </div>
  );
} 