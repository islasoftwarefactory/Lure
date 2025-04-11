'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import GooglePayIcon from '../assets/icons/payments/google-pay.svg'
import ApplePayIcon from '../assets/icons/payments/apple-pay.svg'
import { ShippingConfirmation } from './ShippingConfirmation'
import { SideCart } from './SideCart'
import { SocialIcons } from './SocialIcons'
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { Footer } from './Footer'
import { useAuth } from '../context/AuthContext'
import { CartItem } from '../context/CartContext'

// Interface atualizada para incluir cidades
interface USStateWithCities {
  name: string;
  abbreviation: string;
  cities: string[]; // Array de nomes de cidades
}

// Interface para a estrutura completa do Gist
interface LocationData {
  country: string;
  states: USStateWithCities[];
}

export function CheckoutComponent() {
  const location = useLocation();
  const cartItems: CartItem[] = location.state?.items || [];
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedStateAbbr, setSelectedStateAbbr] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [email, setEmail] = useState('')
  const [checkoutStep, setCheckoutStep] = useState('initial')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Armazena apenas os estados do país buscado
  const [locationStates, setLocationStates] = useState<USStateWithCities[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [locationsError, setLocationsError] = useState<string | null>(null)

  // Busca dados de país, estados e cidades do Gist
  useEffect(() => {
    const fetchLocationData = async (countryIdentifier: string) => {
      if (countryIdentifier !== 'United States') {
        setLocationStates([]);
        setSelectedStateAbbr('');
        setAvailableCities([]);
        setSelectedCity('');
        setLocationsError('Data for the selected country is not available.');
        setIsLoadingLocations(false);
        return;
      }

      setIsLoadingLocations(true);
      setLocationsError(null);
      setLocationStates([]);
      setSelectedStateAbbr('');
      setAvailableCities([]);
      setSelectedCity('');

      const gistUrl = 'https://gist.githubusercontent.com/Migguell/f1da1cf08e555a0c3c75c78ab8fe91f2/raw/ec08c5ae38728ed432128a3ab1ebfe4feec5a5ec/StatesEUA';
      console.log(`Fetching location data for ${countryIdentifier} from: ${gistUrl}`);
      try {
        const response = await fetch(gistUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: LocationData = await response.json();

        if (data && data.country === countryIdentifier && Array.isArray(data.states)) {
          const validStates = data.states.filter((s: any) => s.name && s.abbreviation && Array.isArray(s.cities));
          setLocationStates(validStates);
          console.log(`Location data loaded for ${data.country}: ${validStates.length} states`);
        } else {
           throw new Error("Invalid data format or country mismatch.");
        }
      } catch (error: any) {
        console.error("Error fetching location data:", error);
        setLocationsError(`Failed to load data for ${countryIdentifier}.`);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    if (selectedCountry) {
      fetchLocationData(selectedCountry);
    } else {
        setLocationStates([]);
        setSelectedStateAbbr('');
        setAvailableCities([]);
        setSelectedCity('');
        setIsLoadingLocations(false);
    }
  }, [selectedCountry]);

  // Atualiza cidades disponíveis quando o estado selecionado muda
  useEffect(() => {
    if (selectedStateAbbr) {
      const selectedStateData = locationStates.find(s => s.abbreviation === selectedStateAbbr);
      setAvailableCities(selectedStateData ? selectedStateData.cities : []);
      setSelectedCity('');
      console.log(`Cities for ${selectedStateAbbr} set:`, selectedStateData?.cities);
    } else {
      setAvailableCities([]);
      setSelectedCity('');
    }
  }, [selectedStateAbbr, locationStates]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!selectedCity) newErrors.city = 'City is required';
    if (!selectedStateAbbr) newErrors.state = 'State is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!selectedCountry) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitInitial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Submitting checkout with:", { email, firstName, lastName, address, selectedCity, selectedStateAbbr, postalCode, selectedCountry });
      try {
        const response = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email,
            firstName,
            lastName,
            address,
            city: selectedCity,
            state: selectedStateAbbr,
            postalCode,
            country: selectedCountry,
            cartItems
          })
        });

        if (response.ok) {
          console.log("Checkout session created successfully.");
          setCheckoutStep('shipping');
        } else {
           const errorData = await response.text();
           console.error('Checkout session API error:', response.status, errorData);
           setErrors({ form: `Failed to proceed (${response.status}). Please try again.` });
        }
      } catch (error) {
        console.error('Error creating checkout session:', error);
        setErrors({ form: "An unexpected error occurred. Please try again." });
      }
    } else {
       console.log("Form validation failed:", errors);
    }
  };

  const fullAddress = `${address}, ${selectedCity}, ${selectedStateAbbr} ${postalCode}, ${selectedCountry}`

  const handleContinueToPayment = () => {
    console.log('Continuing to payment');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main className="flex-grow pt-[calc(2rem+80px)] bg-[#f2f2f2]">
        <div className="container mx-auto p-4 md:p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {checkoutStep === 'initial' ? (
              <>
                <div className="col-span-1">
                  <h1 className="text-4xl font-aleo font-bold text-center mb-6">Express checkout</h1>
                  <div className="flex gap-4 mb-6">
                    <Button variant="outline" className="flex-1 h-16 flex items-center justify-center bg-white">
                      <img src={GooglePayIcon} alt="Google Pay" className="h-10" />
                    </Button>
                    <Button variant="outline" className="flex-1 h-16 flex items-center justify-center bg-white">
                      <img src={ApplePayIcon} alt="Apple Pay" className="h-10" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmitInitial} className="space-y-6">
                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle className="font-aleo text-2xl font-bold">Contact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="font-aleo text-base">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Your email address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={`font-aleo ${errors.email ? 'border-red-500' : ''}`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.email}</p>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="newsletter"
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <Label htmlFor="newsletter" className="font-aleo text-sm">
                              Email me with news and offers
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle className="font-aleo text-2xl font-bold">Shipping address</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                              <SelectTrigger className={`font-aleo ${errors.country ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Country/Region" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="United States" className="font-aleo">United States</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.country && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.country}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Input 
                              placeholder="First name" 
                              value={firstName} 
                              onChange={(e) => setFirstName(e.target.value)}
                              className={`font-aleo ${errors.firstName ? 'border-red-500' : ''}`}
                            />
                            {errors.firstName && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.firstName}</p>}
                          </div>
                          <div>
                            <Input 
                              placeholder="Last name" 
                              value={lastName} 
                              onChange={(e) => setLastName(e.target.value)}
                              className={`font-aleo ${errors.lastName ? 'border-red-500' : ''}`}
                            />
                            {errors.lastName && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.lastName}</p>}
                          </div>
                        </div>

                        <div>
                          <Input 
                            placeholder="Address" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)}
                            className={`font-aleo ${errors.address ? 'border-red-500' : ''}`}
                          />
                          {errors.address && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.address}</p>}
                        </div>

                        <Input 
                          placeholder="Apartment, suite, etc. (optional)" 
                          className="font-aleo"
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Select
                              value={selectedStateAbbr}
                              onValueChange={setSelectedStateAbbr}
                              disabled={!selectedCountry || isLoadingLocations || !!locationsError || locationStates.length === 0}
                            >
                              <SelectTrigger className={`font-aleo ${errors.state ? 'border-red-500' : ''} ${!selectedCountry || isLoadingLocations || !!locationsError || locationStates.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                <SelectValue placeholder="State" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingLocations ? (
                                  <SelectItem value="loading" disabled className="font-aleo">Loading...</SelectItem>
                                ) : !selectedCountry ? (
                                   <SelectItem value="sel_country" disabled className="font-aleo">Select country</SelectItem>
                                ) : locationsError ? (
                                   <SelectItem value="error" disabled className="font-aleo text-red-500">{locationsError}</SelectItem>
                                ) : locationStates.length === 0 ? (
                                    <SelectItem value="no_states" disabled className="font-aleo">No states found</SelectItem>
                                ) : (
                                  locationStates.map((stateData) => (
                                    <SelectItem
                                      key={stateData.abbreviation}
                                      value={stateData.abbreviation}
                                      className="font-aleo"
                                    >
                                      {stateData.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {errors.state && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.state}</p>}
                          </div>
                          <div>
                            <Select
                              value={selectedCity}
                              onValueChange={setSelectedCity}
                              disabled={!selectedStateAbbr || availableCities.length === 0 || isLoadingLocations || !!locationsError}
                            >
                              <SelectTrigger className={`font-aleo ${errors.city ? 'border-red-500' : ''} ${!selectedStateAbbr || availableCities.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                <SelectValue placeholder="City" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingLocations ? (
                                   <SelectItem value="loading" disabled className="font-aleo">...</SelectItem>
                                ) : !selectedStateAbbr ? (
                                  <SelectItem value="select_state" disabled className="font-aleo">Select state first</SelectItem>
                                ) : availableCities.length === 0 && selectedStateAbbr ? (
                                   <SelectItem value="no_cities" disabled className="font-aleo">No cities listed</SelectItem>
                                ) : (
                                  availableCities.map((cityName) => (
                                    <SelectItem
                                      key={cityName}
                                      value={cityName}
                                      className="font-aleo"
                                    >
                                      {cityName}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {errors.city && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.city}</p>}
                          </div>
                          <div>
                            <Input
                              placeholder="ZIP code"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              className={`font-aleo ${errors.postalCode ? 'border-red-500' : ''}`}
                              maxLength={5}
                              type="tel"
                              pattern="[0-9]*"
                            />
                            {errors.postalCode && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.postalCode}</p>}
                          </div>
                        </div>

                        <Input 
                          placeholder="Phone (optional)" 
                          className="font-aleo"
                        />
                      </CardContent>
                    </Card>

                    {errors.form && <p className="text-red-500 text-center font-bold mt-4">{errors.form}</p>}
                    <Button type="submit" className="w-full bg-black text-white font-aleo text-lg font-bold">
                      Continue to shipping
                    </Button>
                  </form>
                </div>

                <div className="col-span-1 sticky top-6">
                  <Card className="bg-white h-fit">
                    <CardHeader>
                      <CardTitle className="font-aleo text-2xl font-bold">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cartItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                            <div>
                              <p className="font-aleo font-bold text-base">{item.name}</p>
                              <p className="font-aleo text-sm text-black">Size: {item.size} | Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-aleo font-bold text-base">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between items-center">
                        <span className="font-aleo text-base">Subtotal</span>
                        <span className="font-aleo font-bold text-base">${cartItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-aleo text-base">Shipping</span>
                        <span className="font-aleo text-base">Calculated at next step</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-aleo text-2xl font-bold">Total</span>
                        <span className="font-aleo text-2xl font-bold">${cartItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <ShippingConfirmation
                email={email}
                address={fullAddress}
                onChangeContact={() => setCheckoutStep('initial')}
                onChangeShipping={() => setCheckoutStep('initial')}
                onContinue={handleContinueToPayment}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />

      <div className="fixed bottom-4 right-4 z-50">
        <SocialIcons />
      </div>

      <SideCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        setItems={(newItems) => {
          // Handle cart item updates
        }}
      />
    </div>
  )
}