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

export function PrivacyPolicyPage() {
    const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();

    // GA4 page_view event
    useEffect(() => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Privacy Policy',
                page_location: window.location.href,
                page_path: '/privacy-policy'
            });

            console.log('GA4 page_view event fired for privacy policy page:', {
                page_title: 'Privacy Policy',
                page_location: window.location.href,
                page_path: '/privacy-policy'
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
                            Privacy Policy
                        </h1>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="prose prose-lg max-w-none">
                            <p className="text-sm text-gray-600 mb-6">Last Updated: June 24, 2025</p>
                            
                            <div className="mb-8">
                                <p className="mb-4">At Lure, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website, interact with our services, or make a purchase.</p>
                                <p className="mb-4">By using our site and services, you agree to the collection and use of your information as described in this policy. If you do not agree with the terms of this policy, please do not access or use our site.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">1. What Information We Collect</h2>
                            <div className="mb-6">
                                <p className="mb-4">We collect different types of information to provide and improve our services to you.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">a. Personal Information You Provide Directly:</h3>
                                <p className="mb-3">When you interact with our site (e.g., by creating an account, making a purchase, or contacting us), you may provide us with the following information:</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>Contact Information:</strong> Your full name, email address, and shipping address. We use your shipping address to process and deliver your orders.</li>
                                    <li><strong>Account Information:</strong> When you create an account on our site, we collect your email address, username, and any other profile data you choose to provide.</li>
                                    <li><strong>Google Authentication (OAuth2):</strong> When you use your Google account to create or access your account on our site (via OAuth2), we collect the information that Google returns to us with your consent. This may include your name, email address, and other basic Google profile information.</li>
                                    <li><strong>Purchase Information and History:</strong> We keep records of your order history, the products you have viewed on our site, and items you've added to your shopping cart.</li>
                                </ul>

                                <h3 className="text-lg font-semibold mb-3">b. Payment Information:</h3>
                                <p className="mb-4">We want to make it clear that we do not directly collect or store your payment information (such as credit card numbers or bank details). All payment transactions are processed through secure and encrypted third-party payment gateways, specifically Stripe. Your payment information is provided directly to these processors, who are responsible for its security.</p>

                                <h3 className="text-lg font-semibold mb-3">c. Information Collected Automatically (Usage and Device Data):</h3>
                                <p className="mb-3">When you visit and interact with our site, we automatically collect certain information about your device and browse activity. We use Google Analytics to help us understand how our customers use the site. This data may include:</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>Device Information:</strong> IP address, browser type, operating system, device type (mobile, tablet, desktop), unique device identifiers.</li>
                                    <li><strong>Usage Data:</strong> Pages visited, time spent on specific pages, clicks, scrolling behavior, search terms used, referring websites (the site you came from), and the path you take on our site.</li>
                                    <li><strong>Location Data:</strong> Approximate location information inferred from your IP address.</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                            <div className="mb-6">
                                <p className="mb-3">We use the information we collect for various purposes, including:</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>Processing and Managing Orders:</strong> To accept, process, and deliver your clothing orders, including sending shipping notifications.</li>
                                    <li><strong>Account Management:</strong> To create, maintain, and manage your account, allowing you to access your order history and save your information.</li>
                                    <li><strong>Communication:</strong> To communicate with you about your orders, account updates, special offers, and news (with your consent, if required by law).</li>
                                    <li><strong>Improving Site and Services:</strong> To analyze website usage and understand user preferences, which helps us improve our site's functionality, design, and content, as well as develop new products and services.</li>
                                    <li><strong>Personalizing Your Experience:</strong> To tailor your shopping experience by displaying recommended products or content that may be of interest to you based on your browse and purchase history.</li>
                                    <li><strong>Security and Fraud Prevention:</strong> To detect, prevent, and respond to fraudulent or unauthorized activities, and to protect the security and integrity of our site and our users.</li>
                                    <li><strong>Legal Compliance:</strong> To comply with applicable legal or regulatory obligations or judicial processes.</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">3. Sharing and Disclosure of Information</h2>
                            <div className="mb-6">
                                <p className="mb-3">We may share your personal information with third parties only under the following circumstances and for the purpose of operating our business:</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>Service Providers:</strong> We share information with third-party companies and individuals who perform services on our behalf (such as payment processing through Stripe, order fulfillment and shipping, website hosting, data analytics like Google Analytics, email marketing, and customer support services). These parties have access to your information only to the extent necessary to perform their tasks on our behalf and are obligated not to disclose or use it for any other purpose.</li>
                                    <li><strong>Legal Compliance and Law Enforcement:</strong> We may disclose your information when required by law, regulation, or legal process, or in response to valid requests by public authorities (e.g., a court order or government request).</li>
                                    <li><strong>Protection of Rights and Safety:</strong> We may disclose your information to protect the rights, property, or safety of Lure, our customers, or others. This includes exchanging information with other companies and organizations for fraud protection purposes.</li>
                                    <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, sale of assets, financing, or any other transaction involving the sale or transfer of all or a portion of our business, your personal information may be transferred.</li>
                                </ul>
                                
                                <h3 className="text-lg font-semibold mb-3">We Do Not Sell or Share Your Personal Information for Third-Party Direct Marketing:</h3>
                                <p className="mb-4">Lure does not sell or share the personal information of our customers for the purposes of third-party direct marketing, as defined by the California Consumer Privacy Act (CCPA/CPRA) and other U.S. state privacy laws.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">4. Your Privacy Rights</h2>
                            <div className="mb-6">
                                <p className="mb-3">Depending on your state of residence in the U.S., you may have certain rights regarding your personal information. These may include:</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>Right to Access/Know:</strong> The right to request access to the personal information we have collected about you.</li>
                                    <li><strong>Right to Deletion:</strong> The right to request the deletion of your personal information, subject to certain exceptions.</li>
                                    <li><strong>Right to Correction/Rectification:</strong> The right to request the correction of inaccurate personal information.</li>
                                    <li><strong>Right to Opt-Out:</strong> For certain processing activities, the right to opt-out of the "sale" or "sharing" of personal information (as defined by laws like CCPA/CPRA).</li>
                                    <li><strong>Right to Non-Discrimination:</strong> The right not to be discriminated against for exercising your privacy rights.</li>
                                </ul>
                                <p className="mb-4">To exercise any of these rights, please contact us using the information provided in the "Contact Us" section of this policy. We may need to verify your identity before processing your request.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">5. Cookies and Tracking Technologies</h2>
                            <div className="mb-6">
                                <p className="mb-4">Our website uses <strong>cookies</strong> and similar technologies (such as pixels and web beacons) for various purposes, including website security, basic functionality, and analysis of website usage.</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li><strong>What We Use Them For:</strong> Cookies are small text files stored on your device that help us maintain site security, remember your preferences, analyze site traffic, and improve your shopping experience.</li>
                                    <li><strong>Your Choice:</strong> You have the option to set your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you disable cookies, some parts of our site may not function properly, including security features and essential purchasing functionality.</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
                            <div className="mb-6">
                                <p className="mb-4">The security of your personal information is extremely important to us. We employ reasonable technical and organizational security measures to protect your information against unauthorized access, misuse, alteration, and destruction.</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li>We use a <strong>proprietary server</strong> with robust <strong>firewalls</strong>.</li>
                                    <li>Our site is protected by <strong>SSL (Secure Socket Layer) encryption</strong>, which encrypts data transmitted between your browser and our server.</li>
                                    <li>We store data in <strong>secure environments</strong> with restricted access and continuous monitoring.</li>
                                </ul>
                                <p className="mb-4">While we strive to use commercially acceptable means to protect your personal information, please remember that no method of transmission over the Internet or method of electronic storage is 100% secure. Therefore, we cannot guarantee the absolute security of your information.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
                            <div className="mb-6">
                                <p className="mb-4">Our site is not directed to children under the age of 13. However, we acknowledge that children may occasionally access our site. We collect information from any user who interacts with our site in the same way we collect from adults. If you are a parent or guardian and believe that your child under 13 has provided us with personal information without your consent, please contact us so we can take the necessary steps to remove that information.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">8. Links to Other Websites</h2>
                            <div className="mb-6">
                                <p className="mb-4">Our site may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mt-8">
                                <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                                <p className="mb-2">If you have any questions about this Privacy Policy or our privacy practices, please contact us at:</p>
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