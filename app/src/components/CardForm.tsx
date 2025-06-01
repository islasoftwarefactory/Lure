import React, { useState, FormEvent } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CardFormProps {
  clientSecret: string;
  billingDetails: {
    name: string;
    email: string;
    address: { postal_code: string };
  };
  onPaymentSuccess: () => void;
  onPaymentError: (message: string) => void;
}

export default function CardForm({ clientSecret, billingDetails, onPaymentSuccess, onPaymentError }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Debug stripe and elements instances
  console.log('CardForm init - stripe:', stripe, 'elements:', elements);
  // Show placeholder while Stripe.js and Elements load
  if (!stripe || !elements) {
    return <div className="p-4 text-center text-gray-500">Loading payment methods…</div>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsProcessing(true);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          address: {
            postal_code: billingDetails.address.postal_code,
          },
        },
      },
    });

    if (result.error) {
      const message = result.error.message || 'Payment failed';
      setErrorMessage(message);
      onPaymentError(message);
      setIsProcessing(false);
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      onPaymentSuccess();
    } else {
      const message = 'Payment processing';
      setErrorMessage(message);
      onPaymentError(message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-300 p-3 rounded bg-white">
            <CardElement
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1a1a1a',
                    '::placeholder': { color: '#a0aec0' },
                  },
                  invalid: { color: '#e53e3e' },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full bg-black text-white">
        {isProcessing ? 'Processing...' : 'Pay'}
      </Button>
    </form>
  );
} 