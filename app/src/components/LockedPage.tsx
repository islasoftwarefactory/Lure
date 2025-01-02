import React, { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';
import { SideCart } from './SideCart';
import { SocialIcons } from './SocialIcons';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from '@/assets/icons/home/Logo.svg';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
}

function CountdownTimer() {
  const [time, setTime] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date('2024-01-01T00:00:00').getTime();
      setTime({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      });
    };

    calculateTimeLeft();
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4 text-center my-4">
      <div>
        <div className="text-4xl font-extrabold font-aleo text-black">{time.days}</div>
        <div className="text-sm uppercase tracking-wider font-medium text-black">Days</div>
      </div>
      <div>
        <div className="text-4xl font-extrabold font-aleo text-black">{time.hours}</div>
        <div className="text-sm uppercase tracking-wider font-medium text-black">Hours</div>
      </div>
      <div>
        <div className="text-4xl font-extrabold font-aleo text-black">{time.minutes}</div>
        <div className="text-sm uppercase tracking-wider font-medium text-black">Minutes</div>
      </div>
      <div>
        <div className="text-4xl font-extrabold font-aleo text-black">{time.seconds}</div>
        <div className="text-sm uppercase tracking-wider font-medium text-black">Seconds</div>
      </div>
    </div>
  );
}

export function LockedPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2] text-black">
      <main className="flex-grow flex flex-col items-center justify-center p-4 animate-pageLoad">
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-24 z-10">
            <CountdownTimer />
          </div>
          <div className="w-[1000px] h-[600px] bg-white rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 flex flex-col items-center">
            <img 
              src={Logo} 
              alt="Logo" 
              className="w-32 h-32 drop-shadow-xl animate-float mb-4"
            />
            <div className="w-full max-w-2xl space-y-4">
              <h2 className="text-2xl font-extrabold font-aleo text-black text-center drop-shadow-sm">
                NEWSLETTER
              </h2>
              
              <div className="flex justify-center gap-6">
                <Button
                  type="button"
                  onClick={() => setContactMethod('email')}
                  className={`px-12 py-3 text-xl font-semibold rounded-full transition-all duration-300 shadow-[0_4px_14px_0_rgb(0,0,0,0.10)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.15)] hover:scale-105 ${
                    contactMethod === 'email' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-black border-2 border-black hover:bg-gray-100'
                  }`}
                >
                  EMAIL
                </Button>
                <Button
                  type="button"
                  onClick={() => setContactMethod('whatsapp')}
                  className={`px-12 py-3 text-xl font-semibold rounded-full transition-all duration-300 shadow-[0_4px_14px_0_rgb(0,0,0,0.10)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.15)] hover:scale-105 ${
                    contactMethod === 'whatsapp' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-black border-2 border-black hover:bg-gray-100'
                  }`}
                >
                  SMS
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4 w-full flex flex-col items-center">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full max-w-md border-2 border-black rounded-3xl p-3 text-lg focus:ring-2 focus:ring-black shadow-[0_2px_10px_rgb(0,0,0,0.06)] focus:shadow-[0_4px_16px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-[1.02]"
                  required
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full max-w-md border-2 border-black rounded-3xl p-3 text-lg focus:ring-2 focus:ring-black shadow-[0_2px_10px_rgb(0,0,0,0.06)] focus:shadow-[0_4px_16px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-[1.02]"
                  required
                />
                
                {contactMethod === 'email' ? (
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full max-w-md border-2 border-black rounded-3xl p-3 text-lg focus:ring-2 focus:ring-black shadow-[0_2px_10px_rgb(0,0,0,0.06)] focus:shadow-[0_4px_16px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-[1.02]"
                    required
                  />
                ) : (
                  <Input
                    type="tel"
                    placeholder="SMS"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full max-w-md border-2 border-black rounded-3xl p-3 text-lg focus:ring-2 focus:ring-black shadow-[0_2px_10px_rgb(0,0,0,0.06)] focus:shadow-[0_4px_16px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-[1.02]"
                    required
                  />
                )}

                <div className="flex justify-center mt-4">
                  <Button 
                    type="submit"
                    className="px-12 py-3 bg-black text-white text-xl font-semibold hover:bg-gray-800 transition-all duration-300 rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.20)] hover:shadow-[0_6px_24px_rgb(0,0,0,0.25)] hover:scale-105 transform"
                  >
                    SEND
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-50">
        <SocialIcons />
      </div>

      <SideCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        setItems={setCartItems}
      />
    </div>
  );
}
