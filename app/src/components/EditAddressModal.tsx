'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// The Address object from the backend does not have a country.
interface Address {
  id: number;
  street: string;
  number: number;
  city: string;
  state: string; // This is the state abbreviation, e.g., "CA"
  zip_code: string;
}

// Interfaces for Gist data structure
interface USStateWithCities {
  name: string;
  abbreviation: string;
  cities: string[];
}

interface LocationData {
  country: string;
  states: USStateWithCities[];
}

// onSave will now send a payload that matches the backend model (no country)
interface EditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => Promise<void>; // Make onSave return a promise
  address: Address | null;
}

export function EditAddressModal({ isOpen, onClose, onSave, address }: EditAddressModalProps) {
  // Form fields state
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Location-related state
  const [locationStates, setLocationStates] = useState<USStateWithCities[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [selectedStateAbbr, setSelectedStateAbbr] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [buttonState, setButtonState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Effect to fetch location data from Gist when country changes
  useEffect(() => {
    const fetchLocationData = async (countryIdentifier: string) => {
      if (countryIdentifier !== 'United States') {
        setLocationStates([]);
        setLocationsError('Data for the selected country is not available.');
        return;
      }

      setIsLoadingLocations(true);
      setLocationsError(null);
      
      const gistUrl = 'https://gist.githubusercontent.com/Migguell/f1da1cf08e555a0c3c75c78ab8fe91f2/raw/8f0ed4accf94de2f14dcd3a344b6b2f33e230426/StatesEUA';
      try {
        const response = await fetch(gistUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: LocationData = await response.json();

        if (data && data.country === countryIdentifier && Array.isArray(data.states)) {
          setLocationStates(data.states);
        } else {
          throw new Error("Invalid data format from Gist.");
        }
      } catch (error: any) {
        console.error("Error fetching location data:", error);
        setLocationsError('Failed to load location data.');
      } finally {
        setIsLoadingLocations(false);
      }
    };

    if (selectedCountry) {
      fetchLocationData(selectedCountry);
    }
  }, [selectedCountry]);

  // Effect to update available cities when the state changes
  useEffect(() => {
    if (selectedStateAbbr) {
      const selectedStateData = locationStates.find(s => s.abbreviation === selectedStateAbbr);
      const cities = selectedStateData ? selectedStateData.cities : [];
      setAvailableCities(cities);
      // If the currently selected city is not in the new list, reset it.
      if (selectedCity && !cities.includes(selectedCity)) {
        setSelectedCity('');
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedStateAbbr, locationStates, selectedCity]);

  // When the modal opens or address changes, populate the form
  useEffect(() => {
    if (address) {
      setStreet(address.street);
      setNumber(String(address.number));
      setZipCode(address.zip_code);
      setSelectedCountry('United States'); // Currently hardcoded
      setSelectedStateAbbr(address.state);
      setSelectedCity(address.city);
    } else {
      // Reset form on close/unmount
      setStreet('');
      setNumber('');
      setZipCode('');
      setSelectedStateAbbr('');
      setSelectedCity('');
    }
  }, [address]);
  
  // Reset button state when modal is closed to ensure it's fresh on reopen
  useEffect(() => {
    if (!isOpen) {
      // Use a timeout to avoid seeing the state change during the closing animation
      setTimeout(() => {
        setButtonState('idle');
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen || !address) return null;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setButtonState('saving');

    const payload: Address = {
      id: address.id,
      street: street,
      number: parseInt(number, 10) || 0,
      city: selectedCity,
      state: selectedStateAbbr,
      zip_code: zipCode,
    };
    
    try {
      await onSave(payload);
      setButtonState('success');
      setTimeout(() => {
        onClose(); // Close modal automatically on success
      }, 1500);
    } catch (error) {
      console.error("Failed to save from modal:", error);
      setButtonState('error');
      // Optionally reset to idle after showing error for a bit
      setTimeout(() => setButtonState('idle'), 2500);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
    >
      <div 
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-7 relative animate-in fade-in-0 zoom-in-95"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors rounded-full p-1"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 font-aleo">Edit Address</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset disabled={buttonState === 'saving' || buttonState === 'success'}>
            {/* Street and Number */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-3/4">
                  <label className="text-sm font-semibold text-gray-600">Street</label>
                  <input
                    type="text" name="street" value={street} onChange={(e) => setStreet(e.target.value)}
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required
                  />
              </div>
              <div className="w-full sm:w-1/4">
                  <label className="text-sm font-semibold text-gray-600">Number</label>
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]*" name="number" value={number} onChange={(e) => setNumber(e.target.value)}
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required
                  />
              </div>
            </div>
            
            {/* Country and State */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600">Country</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-full mt-1 p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all h-auto">
                      <SelectValue placeholder="Country/Region" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600">State</label>
                <Select value={selectedStateAbbr} onValueChange={setSelectedStateAbbr} disabled={isLoadingLocations || locationStates.length === 0}>
                  <SelectTrigger className="w-full mt-1 p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all h-auto">
                      <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                      {isLoadingLocations && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                      {locationsError && <SelectItem value="error" disabled>{locationsError}</SelectItem>}
                      {locationStates.map((state) => (
                          <SelectItem key={state.abbreviation} value={state.abbreviation}>
                              {state.name}
                          </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* City and ZIP */}
             <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600">City</label>
                 <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedStateAbbr || availableCities.length === 0}>
                   <SelectTrigger className="w-full mt-1 p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all h-auto">
                       <SelectValue placeholder="Select City" />
                   </SelectTrigger>
                   <SelectContent>
                      {!selectedStateAbbr && <SelectItem value="no-state" disabled>Select a state first</SelectItem>}
                      {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                              {city}
                          </SelectItem>
                      ))}
                   </SelectContent>
                 </Select>
               </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600">ZIP Code</label>
                <input
                  type="text" name="zip_code" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required
                />
              </div>
            </div>
          </fieldset>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t mt-6">
            <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="px-6 py-2 rounded-full"
                disabled={buttonState === 'saving' || buttonState === 'success'}
            >
              Cancel
            </Button>
            <Button 
                type="submit" 
                className="px-6 py-2 rounded-full w-36 transition-all duration-300"
                disabled={buttonState === 'saving' || buttonState === 'success'}
            >
              {buttonState === 'idle' && 'Save Changes'}
              {buttonState === 'saving' && <Loader2 className="animate-spin" />}
              {buttonState === 'success' && <Check />}
              {buttonState === 'error' && 'Error!'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
