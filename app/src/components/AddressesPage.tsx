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
// The 'country' field is removed as it's a frontend-only concept now.
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
      setAddresses((prev: Address[]) => prev.filter((addr: Address) => addr.id !== addressId));
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
    // This function now implicitly returns a promise that the modal can await.
    // The try/catch block will handle success and error states.
    // If an error is thrown, the modal's catch block will be triggered.
    try {
      const response = await api.put(`/address/update/${updatedAddress.id}`, updatedAddress);
      setAddresses((prev: Address[]) => prev.map((addr: Address) => 
        addr.id === updatedAddress.id ? response.data.data : addr
      ));
      // No longer need to close modal from here; the modal closes itself on success.
    } catch (err) {
      console.error("Failed to update address:", err);
      // Re-throw the error to be caught by the modal's handleSubmit
      throw err;
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
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-aleo text-gray-900">My Addresses</h1>
            <Button 
                onClick={() => navigate('/addresses/new')} 
                className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 w-full sm:w-auto justify-center sm:justify-start text-sm sm:text-base min-h-[44px]"
            >
              <PlusCircle size={18} className="sm:w-5 sm:h-5" />
              Add New
            </Button>
          </div>

          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {addresses.map((address: Address) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="bg-white rounded-2xl shadow-lg flex flex-col h-full transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-gray-50/80 border-b">
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                          <MapPin className="text-blue-600" size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                          <CardTitle className="font-bold text-lg sm:text-xl text-gray-800 truncate">
                              Shipping Address
                          </CardTitle>
                          <CardDescription className="text-gray-500 text-sm truncate">
                              {address.city}, {address.state}
                          </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 flex-grow space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg border">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Street</label>
                            <p className="text-gray-900 font-medium text-sm sm:text-base break-words">{address.street}, {address.number}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">City</label>
                                <p className="text-gray-900 font-medium text-sm sm:text-base truncate">{address.city}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">State</label>
                                <p className="text-gray-900 font-medium text-sm sm:text-base truncate">{address.state}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ZIP Code</label>
                                <p className="text-gray-900 font-medium text-sm sm:text-base">{address.zip_code}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Country</label>
                                <p className="text-gray-900 font-medium text-sm sm:text-base">United States</p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-3 sm:p-4 bg-gray-50/70 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                       <Button 
                           onClick={() => handleOpenEditModal(address)}
                           size="sm" 
                           className="flex items-center gap-2 text-white bg-black hover:bg-gray-800 w-full sm:w-auto justify-center min-h-[44px] text-sm"
                       >
                           <Pencil size={16} /> Edit
                       </Button>
                       <Button 
                           onClick={() => handleDeleteAddress(address.id)}
                           variant="destructive" size="sm" 
                           className="flex items-center gap-2 w-full sm:w-auto justify-center min-h-[44px] text-sm"
                       >
                           <Trash2 size={16} /> Delete
                       </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-20 px-4 sm:px-6 bg-white rounded-2xl shadow-lg">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">No Saved Addresses</h2>
              <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm sm:text-base">You haven't added any addresses yet. Add one to make your future checkouts faster and easier.</p>
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