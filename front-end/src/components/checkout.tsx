'use client'

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import GooglePayIcon from '../assets/icons/payments/google-pay.svg'
import ApplePayIcon from '../assets/icons/payments/apple-pay.svg'
import { AnnouncementBar } from './AnnouncementBar'
import { ShippingConfirmation } from './ShippingConfirmation'
import { Header } from './Header'
import { SideCart } from './SideCart'

export function CheckoutComponent() {
  const location = useLocation();
  const cartItems = location.state?.items || [];
  const navigate = useNavigate()
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [country, setCountry] = useState('Brazil')
  const [state, setState] = useState('')
  const [email, setEmail] = useState('')
  const [checkoutStep, setCheckoutStep] = useState('initial')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitInitial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form is valid, proceeding to payment');
      setCheckoutStep('shipping');
    } else {
      console.log('Form is invalid');
    }
  };

  const fullAddress = `${address}, ${city}, ${state} ${postalCode}, ${country}`

  const handleContinueToPayment = () => {
    // Implement logic to continue to payment
    console.log('Continuing to payment');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <div className="container mx-auto p-4 md:p-6 flex-grow">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {checkoutStep === 'initial' ? (
              <>
                <h1 className="text-2xl font-bold mb-6">Express checkout</h1>
                <div className="grid gap-4 mb-6">
                  <Button variant="outline" className="h-16 flex items-center justify-center bg-white">
                    <img src={GooglePayIcon} alt="Google Pay" className="h-10" />
                  </Button>
                  <Button variant="outline" className="h-16 flex items-center justify-center bg-white">
                    <img src={ApplePayIcon} alt="Apple Pay" className="h-10" />
                  </Button>
                </div>

                <form onSubmit={handleSubmitInitial} className="space-y-6">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Shipping address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Country/Region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Brazil">Brazil</SelectItem>
                          {/* Add more countries as needed */}
                        </SelectContent>
                      </Select>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input 
                            placeholder="First name" 
                            value={firstName} 
                            onChange={(e) => setFirstName(e.target.value)}
                            className={errors.firstName ? 'border-red-500' : ''}
                          />
                          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                          <Input 
                            placeholder="Last name" 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)}
                            className={errors.lastName ? 'border-red-500' : ''}
                          />
                          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div>
                        <Input 
                          placeholder="Postal code" 
                          value={postalCode} 
                          onChange={(e) => setPostalCode(e.target.value)}
                          className={errors.postalCode ? 'border-red-500' : ''}
                        />
                        {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                      </div>

                      <div>
                        <Input 
                          placeholder="Address" 
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)}
                          className={errors.address ? 'border-red-500' : ''}
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>

                      <Input placeholder="Apartment, suite, etc. (optional)" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input 
                            placeholder="City" 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)}
                            className={errors.city ? 'border-red-500' : ''}
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <Select value={state} onValueChange={setState}>
                            <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                              <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SP">São Paulo</SelectItem>
                              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                              {/* Add more states as needed */}
                            </SelectContent>
                          </Select>
                          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                        </div>
                      </div>

                      <Input placeholder="Phone (optional)" />
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full bg-black text-white">Continue to shipping</Button>
                </form>
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

          <div>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-500">Size: {item.size} | Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span>${cartItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>${cartItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SideCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        setItems={(newItems) => {
          setCartItems(newItems);
          // Se necessário, atualize o estado local ou faça outras operações
        }}
      />
    </div>
  )
}