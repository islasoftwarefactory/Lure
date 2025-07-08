// @ts-nocheck
'use client'

import React, { useEffect } from 'react';

// GA4 gtag declaration
declare global {
  function gtag(...args: any[]): void;
}

import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { SideCart } from "./SideCart";
import { useCart } from '../context/CartContext';

export function AboutUsPage() {
    const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();

    // GA4 page_view event
    useEffect(() => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'About Us',
                page_location: window.location.href,
                page_path: '/about-us'
            });

            console.log('GA4 page_view event fired for about us page:', {
                page_title: 'About Us',
                page_location: window.location.href,
                page_path: '/about-us'
            });
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
            <AnnouncementBar />
            <Header onCartClick={() => setIsCartOpen(true)} />

            <main className="flex-grow container mx-auto px-4 pt-32 sm:pt-36 pb-24 sm:pb-32 flex flex-col items-center">
                <div className="w-full max-w-6xl mx-auto space-y-8">
                    {/* Page Title */}
                    <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold font-aleo text-gray-900">
                            About Us
                        </h1>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="prose prose-lg max-w-none">
                            <div className="mb-8">
                                <p className="mb-4 text-lg">Welcome to Lure, where fashion meets innovation and quality meets accessibility. We're more than just a clothing brand - we're a movement toward redefining how you experience fashion.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                            <div className="mb-6">
                                <p className="mb-4">Lure was born from a vision to create exceptional clothing that speaks to the modern individual. Founded with the belief that everyone deserves access to high-quality, stylish apparel, we set out to bridge the gap between luxury fashion and everyday accessibility.</p>
                                <p className="mb-4">Our journey began with a simple question: Why should great fashion be limited by geography or traditional retail barriers? This question led us to develop our innovative cross-docking fulfillment model, bringing Brazilian craftsmanship and style directly to customers in the United States.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                            <div className="mb-6">
                                <p className="mb-4">At Lure, our mission is to democratize access to exceptional fashion by creating high-quality, contemporary clothing that empowers individuals to express their unique style. We're committed to:</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>Quality First:</strong> Every piece is crafted with attention to detail and built to last</li>
                                    <li><strong>Style Innovation:</strong> Bringing fresh, contemporary designs that resonate with modern lifestyles</li>
                                    <li><strong>Accessibility:</strong> Making premium fashion accessible through our efficient logistics model</li>
                                    <li><strong>Customer Experience:</strong> Providing seamless shopping experiences from discovery to delivery</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Authenticity</h3>
                                <p className="mb-4">We believe in staying true to our vision and creating genuine connections with our customers. Every design reflects our commitment to authentic self-expression.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">Innovation</h3>
                                <p className="mb-4">From our unique cross-docking logistics to our contemporary designs, innovation drives everything we do. We're constantly evolving to better serve our customers.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">Quality</h3>
                                <p className="mb-4">We never compromise on quality. Every material is carefully selected, every stitch purposefully placed, and every product thoroughly inspected.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">Community</h3>
                                <p className="mb-4">Fashion is personal, but it's also communal. We're building a community of individuals who appreciate quality, style, and the stories that clothes can tell.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                            <div className="mb-6">
                                <p className="mb-4">We envision a future where exceptional fashion knows no boundaries. Where quality craftsmanship meets innovative delivery systems, and where every individual has access to clothing that makes them feel confident, authentic, and uniquely themselves.</p>
                                <p className="mb-4">As we grow, we're committed to expanding our offerings while maintaining the personal touch and attention to quality that defines the Lure experience. We're building more than a brand - we're creating a new standard for how fashion connects with people's lives.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">Our Design Philosophy</h2>
                            <div className="mb-6">
                                <p className="mb-4">Every Lure piece begins with a story. Our design process combines contemporary aesthetics with timeless appeal, creating clothing that transcends seasonal trends. We focus on:</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>Versatility:</strong> Pieces that work seamlessly from day to night, casual to elevated</li>
                                    <li><strong>Comfort:</strong> Fabrics and cuts that feel as good as they look</li>
                                    <li><strong>Durability:</strong> Construction techniques that ensure longevity</li>
                                    <li><strong>Style:</strong> Contemporary designs that remain relevant season after season</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">Our Promise</h2>
                            <div className="mb-6">
                                <p className="mb-4">When you choose Lure, you're not just buying clothing - you're investing in a commitment to quality, innovation, and exceptional service. We promise to continue pushing boundaries, exceeding expectations, and creating fashion experiences that inspire confidence and self-expression.</p>
                                <p className="mb-4">Thank you for being part of our story. Together, we're redefining what fashion can be.</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mt-8">
                                <h3 className="text-lg font-semibold mb-3">Connect With Us</h3>
                                <p className="mb-2">We'd love to hear from you and answer any questions you might have about our brand, our process, or our products.</p>
                                <p className="mb-2"><strong>Email:</strong> contact@lureclo.com</p>
                                <p><strong>Contact Page:</strong> <a href="/contact" className="text-blue-600 hover:text-blue-800">Get in Touch</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <SideCart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                setItems={setCartItems}
            />
        </div>
    );
} 