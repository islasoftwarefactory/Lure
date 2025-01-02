import React from 'react';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { SocialIcons } from './SocialIcons';
import { SideCart } from './SideCart';
import { useState } from 'react';

export function SoonPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-grow pt-[calc(2rem+80px)]">
        <div className="container mx-auto p-4">
          <iframe 
            src="/soon.html"
            title="3D Logo Viewer"
            className="w-full h-[600px] border-none rounded-lg shadow-lg"
            sandbox="allow-scripts allow-forms"
            loading="lazy"
          />
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
        setItems={setCartItems}
      />
    </div>
  );
} 