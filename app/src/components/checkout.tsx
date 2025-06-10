// @ts-nocheck
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
import { SideCart } from './SideCart'
import { SocialIcons } from './SocialIcons'
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { Footer } from './Footer'
import { useAuth } from '../context/AuthContext'
import { CartItem } from '../context/CartContext'
import api from '../services/api'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { useCart } from '../context/CartContext'

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

// Interface local CartItem - Verificar se ainda é necessária ou se podemos confiar
// na estrutura que vem do location.state agora que ProductPage envia corretamente.
// Mantê-la por enquanto para tipagem forte.
interface CartItem {
  id?: number | string; // ID do item no carrinho (pode não existir no fluxo "Buy Now")
  cart_item_id?: number; // ID do item no carrinho do backend (pode não existir no fluxo "Buy Now")
  productId: number;
  sizeId: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image?: string;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

function PaymentForm({ purchaseId }: { purchaseId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setError(null);
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-page/${purchaseId}`,
      },
      redirect: 'if_required',
    });
    if (stripeError) {
      setError(stripeError.message);
    } else {
      navigate(
        `/order-page/${purchaseId}`,
        { state: { justCompletedOrder: { id: purchaseId } }, replace: true }
      );
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement
        onReady={() => console.log('PaymentElement ready')}
        onLoadError={(event) => {
          const err = event.error || event;
          console.error('PaymentElement loaderror', err);
          setError(err.message || 'Error loading payment form');
        }}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="button" onClick={handleSubmit} className="w-full bg-black text-white font-aleo text-lg font-bold">
        Pay Now
      </button>
    </div>
  );
}

export function CheckoutComponent() {
  const location = useLocation();
  const { cartItems: contextCartItems } = useCart();
  const cartItems: CartItem[] =
    Array.isArray(location.state?.items) && location.state.items.length > 0
      ? location.state.items
      : contextCartItems;

  console.log('--- CHECKOUT: cartItems recebidos:', JSON.stringify(cartItems));

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
  const [addressNumber, setAddressNumber] = useState('')
  const [apartment, setApartment] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Armazena apenas os estados do país buscado
  const [locationStates, setLocationStates] = useState<USStateWithCities[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [locationsError, setLocationsError] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Debug: log critical state changes
  useEffect(() => {
    console.log('🔄 Checkout State:', { checkoutStep, purchaseId, clientSecret, paymentError })
  }, [checkoutStep, purchaseId, clientSecret, paymentError]);

  // Debug: effect for payment step
  useEffect(() => {
    if (checkoutStep === 'payment') {
      console.log('🚀 Entered payment step. purchaseId:', purchaseId, 'clientSecret:', clientSecret);
    }
  }, [checkoutStep, purchaseId, clientSecret]);

  // Mount Stripe Payment Method Messaging Element on payment step
  useEffect(() => {
    if (checkoutStep === 'payment' && clientSecret) {
      stripePromise.then((stripe) => {
        const elementsMsg = stripe.elements();
        const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const options = {
          amount: Math.round(cartTotal * 100),
          currency: 'USD',
          countryCode: 'US'
        };
        const messaging = elementsMsg.create('paymentMethodMessaging', options);
        messaging.mount('#payment-method-messaging-element');
      });
    }
  }, [checkoutStep, clientSecret, cartItems]);

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

      const gistUrl = 'https://gist.githubusercontent.com/Migguell/f1da1cf08e555a0c3c75c78ab8fe91f2/raw/8f0ed4accf94de2f14dcd3a344b6b2f33e230426/StatesEUA';
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
    // Reset errors antes de validar novamente
    setErrors({});
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!address.trim()) newErrors.address = 'Street address is required';
    if (!addressNumber.trim()) {
        newErrors.addressNumber = 'Number is required';
    } else if (!/^\d+$/.test(addressNumber.trim())) {
        newErrors.addressNumber = 'Number must contain only digits';
    }
    if (!selectedCity) newErrors.city = 'City is required';
    if (!selectedStateAbbr) newErrors.state = 'State is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!selectedCountry) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Resetar erros ANTES de validar
    setErrors({});
    if (!validateForm()) {
       console.log("Form validation failed:", errors); // Logar os erros de validação
       return;
    }

    const localToken = localStorage.getItem('authToken');
    if (!localToken || localToken === 'undefined') {
        setErrors({ form: "Authentication error. Please log in again." });
        console.error("Authentication token is missing locally.");
        return; // Sair se não houver token
    }

    setIsSubmitting(true);
    console.log("Form validated. Attempting to save address...");

    const addressPayload = {
        street: address,
        number: parseInt(addressNumber, 10),
        city: selectedCity,
        state: selectedStateAbbr,
        zip_code: postalCode,
        complement: apartment || null
    };

    let newAddressId: number | null = null;

    try {
        console.log("Sending address data:", addressPayload);
        const addressResponse = await api.post<{data: {id: number}}>('/address/create', addressPayload);
        newAddressId = addressResponse.data.data.id;
        console.log("Address saved successfully. Address ID:", newAddressId);

        if (!newAddressId) {
             throw new Error("Failed to get address ID after creation.");
        }

        const purchasePayload = {
            shipping_address_id: newAddressId,
            shipping_cost: 0.0,
            taxes: 0.0,
            items: cartItems.map(item => {
                console.log('--- CHECKOUT: Mapeando item do carrinho (Após correção):', JSON.stringify(item, null, 2));
                if (item.productId === undefined || item.sizeId === undefined) {
                     console.error("Item inválido recebido no checkout:", item);
                     throw new Error(`Invalid item data received in checkout: Missing productId or sizeId.`);
                }
                return {
                    product_id: item.productId,
                    size_id: item.sizeId,
                    quantity: item.quantity,
                    unit_price_at_purchase: item.price
                };
            })
        };
        console.log('--- CHECKOUT: purchasePayload pronto para envio (Após correção):', JSON.stringify(purchasePayload, null, 2));

        console.log("Attempting to create purchase...");
        const response = await api.post('/purchase/create', purchasePayload);
        const { purchase_id, client_secret } = response.data;
        console.log('Purchase created:', purchase_id, client_secret);
        if (!purchase_id || !client_secret) {
          throw new Error('Invalid server response: missing purchase_id or client_secret.');
        }
        setPurchaseId(purchase_id);
        setClientSecret(client_secret);
        // Move to payment step and let Pay Now button handle confirmation
        setCheckoutStep('payment');

    } catch (error: any) {
        console.error('Error during checkout process (API call):', error);
        const errorMessage = error.response?.data?.error || error.message || "An unexpected error occurred.";
        if (errorMessage.startsWith("Invalid item data")) {
             setErrors({ form: errorMessage });
        } else {
             setErrors({ form: `Checkout failed: ${errorMessage}` });
        }

    } finally {
        setIsSubmitting(false);
    }
  };

  const fullAddress = `${address}, ${selectedCity}, ${selectedStateAbbr} ${postalCode}, ${selectedCountry}`

  const handleContinueToPayment = () => {
    console.log('🔥 Continue to payment clicked. Current state:', { checkoutStep, purchaseId, clientSecret });
    setCheckoutStep('payment');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main className="flex-grow pt-[calc(2rem+80px)] bg-[#f2f2f2]">
        <div className="container mx-auto p-4 md:p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Coluna 1: Formulário de entrega */}
            <div>
              <form onSubmit={handlePlaceOrder} className="space-y-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                      <Input 
                            placeholder="Street address"
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                        className={`font-aleo ${errors.address ? 'border-red-500' : ''}`}
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.address}</p>}
                      </div>
                      <div>
                           <Input
                             placeholder="Number"
                             type="text"
                             inputMode="numeric"
                             pattern="[0-9]*"
                             value={addressNumber}
                             onChange={(e) => setAddressNumber(e.target.value)}
                             className={`font-aleo ${errors.addressNumber ? 'border-red-500' : ''}`}
                           />
                           {errors.addressNumber && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.addressNumber}</p>}
                       </div>
                    </div>

                    <Input 
                      placeholder="Apartment, suite, etc. (optional)" 
                      className="font-aleo"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
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

                {/* Payment card appears after address is submitted */}
                {checkoutStep === 'payment' && (
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div id="payment-method-messaging-element" className="mb-4"></div>
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm purchaseId={purchaseId!} />
                      </Elements>
                    </CardContent>
                  </Card>
                )}

                {/* Show errors */}
                {errors.form && <p className="text-red-500 text-center font-bold mt-4">{errors.form}</p>}
                {/* Place Order button only on initial step */}
                {checkoutStep === 'initial' && (
                  <Button
                    type="submit"
                    className="w-full bg-black text-white font-aleo text-lg font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processando…' : 'Place Order'}
                  </Button>
                )}
              </form>
            </div>

            {/* Coluna 2: Resumo + Pagamento */}
            <div className="space-y-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Order Summary</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {cartItems.map((item: any) => (
                     <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center">
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