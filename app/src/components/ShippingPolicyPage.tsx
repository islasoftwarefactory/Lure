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

export function ShippingPolicyPage() {
    const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();

    // GA4 page_view event
    useEffect(() => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Shipping Policy',
                page_location: window.location.href,
                page_path: '/shipping-policy'
            });

            console.log('GA4 page_view event fired for shipping policy page:', {
                page_title: 'Shipping Policy',
                page_location: window.location.href,
                page_path: '/shipping-policy'
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
                            Shipping Policy
                        </h1>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="prose prose-lg max-w-none">
                            <p className="text-sm text-gray-600 mb-6">Last Updated: June 24, 2025</p>
                            
                            <div className="mb-8">
                                <p className="mb-4">At Lure, we are committed to providing you with a seamless shopping experience and delivering your favorite clothing items efficiently. Our unique cross-docking logistics model ensures your products reach you as quickly as possible from their origin.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">1. Order Processing Time</h2>
                            <div className="mb-6">
                                <p className="mb-4">Once you place an order, our team requires <strong>1-3 business days</strong> to process and prepare your items for shipment. This includes order verification, quality check, and packaging in Brazil before they begin their journey.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">2. Our Cross-Docking Model & International Shipping</h2>
                            <div className="mb-6">
                                <p className="mb-4">Lure operates on a sophisticated <strong>cross-docking fulfillment model</strong>. This means your products are consolidated and shipped from Brazil directly to a specialized cross-dock facility in the United States. Upon arrival in the U.S., your shipment is quickly deconsolidated (broken down into individual customer orders) and immediately transferred to local delivery carriers <strong>without being stored in a traditional warehouse</strong>. This strategic approach minimizes storage costs and accelerates the final delivery to your doorstep.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">3. Estimated Delivery Times</h2>
                            <div className="mb-6">
                                <p className="mb-4">Given our international shipping and cross-docking process, our estimated delivery times are as follows:</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>Standard Shipping:</strong> <strong>7 to 15 business days</strong> from the date your order is placed.</li>
                                </ul>
                                <p className="mb-4">Please note that these are estimated delivery times. While we strive to meet these timeframes, actual delivery times may vary due to factors beyond our control, such as customs processing, carrier delays, or unforeseen logistical challenges.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">4. Shipping Costs</h2>
                            <div className="mb-6">
                                <p className="mb-4">Shipping costs are calculated based on your order value and chosen shipping method. You will see the exact shipping cost displayed at checkout before you complete your purchase.</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>Free Shipping:</strong> We may offer free standard shipping on orders exceeding a certain value, as indicated on our website during promotional periods.</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">5. Order Tracking</h2>
                            <div className="mb-6">
                                <p className="mb-4">Once your order has been shipped from our cross-dock facility in the U.S., you will receive a shipping confirmation email containing a tracking number. You can use this tracking number to monitor the progress of your delivery directly on the carrier's website.</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li>Please allow up to <strong>24-48 business hours</strong> for the tracking information to become active after you receive your shipping confirmation.</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">6. Customs Duties, Taxes, and Import Fees</h2>
                            <div className="mb-6">
                                <p className="mb-4">As your products are shipped internationally from Brazil to the United States, your order may be subject to import duties, taxes, and customs fees levied by U.S. Customs and Border Protection.</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>Customers are responsible for all applicable import duties, taxes, and customs fees.</strong> These charges are typically collected by the shipping carrier upon delivery and are not included in your order total or shipping cost.</li>
                                    <li>We advise customers to contact their local customs office for current charges before placing an order to avoid unexpected fees. Lure is unable to provide estimates for these charges.</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">7. Incorrect Shipping Addresses</h2>
                            <div className="mb-6">
                                <p className="mb-4">It is the customer's responsibility to provide an accurate and complete shipping address at the time of purchase. Lure is not responsible for orders delivered to incorrect addresses provided by the customer.</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li>If an order is returned to us due to an incorrect address, you may be responsible for re-shipping fees.</li>
                                    <li>If you realize you've made an error in your shipping address, please contact us immediately at <strong>contact@lureclo.com</strong>. We will do our best to correct it before the order is shipped, but changes are not guaranteed once processing begins.</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">8. Lost or Damaged Packages</h2>
                            <div className="mb-6">
                                <p className="mb-4">In the rare event that your package is lost in transit or arrives damaged, please contact us at <strong>contact@lureclo.com</strong> within <strong>7 days</strong> of the expected delivery date for lost packages or within <strong>3 days</strong> of delivery for damaged packages. We will work with the shipping carrier to investigate the issue and find a suitable resolution.</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mt-8">
                                <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                                <p className="mb-2">If you have any questions about your order's shipping or our shipping policy, please contact us at:</p>
                                <p className="mb-2"><strong>Email:</strong> contact@lureclo.com</p>
                                <p><strong>Contact Page:</strong> <a href="/contact" className="text-blue-600 hover:text-blue-800">Contact Us</a></p>
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