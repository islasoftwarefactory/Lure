'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Define Address type to include the new 'country' field
interface Address {
  id: number;
  street: string;
  number: number;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

// Props for the modal
interface EditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  address: Address | null;
}

export function EditAddressModal({ isOpen, onClose, onSave, address }: EditAddressModalProps) {
  // State for form data
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    street: '',
    number: 0,
    city: '',
    state: '',
    zip_code: '',
    country: ''
  });

  // When the address prop changes, update the form data
  useEffect(() => {
    if (address) {
      setFormData({
        street: address.street,
        number: address.number,
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        country: address.country || '' // Handle cases where country might be null initially
      });
    }
  }, [address]);

  // Don't render the modal if it's not open or no address is provided
  if (!isOpen || !address) return null;

  // Handle changes in form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'number' ? parseInt(value) || 0 : value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: address.id });
  };

  return (
    // Modal overlay
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
    >
      <div 
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-7 relative animate-in fade-in-0 zoom-in-95"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors rounded-full p-1"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 font-aleo">Edit Address</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Street and Number */}
          <div className="flex gap-4">
            <div className="w-3/4">
                <label className="text-sm font-semibold text-gray-600">Street</label>
                <input
                  type="text" name="street" value={formData.street} onChange={handleChange}
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required
                />
            </div>
            <div className="w-1/4">
                <label className="text-sm font-semibold text-gray-600">Number</label>
                <input
                  type="number" name="number" value={formData.number} onChange={handleChange}
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required
                />
            </div>
          </div>
          
          {/* City and State */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600">City</label>
              <input
                type="text" name="city" value={formData.city} onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600">State</label>
              <input
                type="text" name="state" value={formData.state} onChange={handleChange} maxLength={2}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required
              />
            </div>
          </div>

          {/* Country and ZIP */}
           <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600">Country</label>
              <input
                type="text" name="country" value={formData.country} onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600">ZIP Code</label>
              <input
                type="text" name="zip_code" value={formData.zip_code} onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="px-6 py-2 rounded-full">
              Cancel
            </Button>
            <Button type="submit" className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-full">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 