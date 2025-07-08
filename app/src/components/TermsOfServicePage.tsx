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

export function TermsOfServicePage() {
    const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();

    // GA4 page_view event
    useEffect(() => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Terms of Service',
                page_location: window.location.href,
                page_path: '/terms-of-service'
            });

            console.log('GA4 page_view event fired for terms of service page:', {
                page_title: 'Terms of Service',
                page_location: window.location.href,
                page_path: '/terms-of-service'
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
                            Terms of Service
                        </h1>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="prose prose-lg max-w-none">
                            <p className="text-sm text-gray-600 mb-6">Last Updated: June 24, 2025</p>
                            
                            <div className="mb-8">
                                <p className="mb-4">Please read these Terms of Service ("Terms," "Terms of Service") carefully before using our website (the "Service") operated by Lure ("us," "we," or "our").</p>
                                <p className="mb-4">Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service.</p>
                                <p className="mb-4">By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">1. User Accounts</h2>
                            <div className="mb-6">
                                <p className="mb-4">When you create an account with us, you guarantee that you are above the age of 13 and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.</p>
                                <p className="mb-4">You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party social media service.</p>
                                <p className="mb-4">You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
                                <p className="mb-4">You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you without appropriate authorization, or a name that is otherwise offensive, vulgar, or obscene.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">2. Use of Our Website</h2>
                            <div className="mb-6">
                                <p className="mb-4">You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Service. Prohibited behavior includes harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within our Service.</p>
                                <p className="mb-3">You must not use our website to:</p>
                                <ul className="list-disc list-inside mb-4 space-y-2">
                                    <li>Engage in any illegal activities.</li>
                                    <li>Transmit any harmful code, viruses, or other destructive files.</li>
                                    <li>Collect or store personal data about other users without their express consent.</li>
                                    <li>Impersonate any person or entity.</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">3. Intellectual Property</h2>
                            <div className="mb-6">
                                <p className="mb-4">The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Lure and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Lure.</p>
                                <p className="mb-4">You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service, use of the Service, or access to the Service without express written permission by us.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">4. Product Information and Pricing</h2>
                            <div className="mb-6">
                                <p className="mb-4">We strive to display accurate product descriptions, images, colors, and other details of our clothing products on the Service. However, we cannot guarantee that your device's display of any color will be accurate. All descriptions of products or product pricing are subject to change at any time without notice, at our sole discretion.</p>
                                <p className="mb-4">We reserve the right to discontinue any product at any time. Any offer for any product or service made on this Service is void where prohibited. We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected.</p>
                                <p className="mb-4">Prices for our products are subject to change without notice. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice (including after you have submitted your order).</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">5. Orders and Payments</h2>
                            <div className="mb-6">
                                <p className="mb-4">By placing an order through the Service, you warrant that you are legally capable of entering into binding contracts.</p>
                                <p className="mb-4">We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made.</p>
                                <p className="mb-4">All payments are processed through secure third-party payment gateways, such as Stripe. We do not store your payment card details on our servers. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Service.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">6. Shipping and Delivery</h2>
                            <div className="mb-6">
                                <p className="mb-4">Shipping and delivery terms are detailed in our separate <strong>Shipping Policy</strong>, which is incorporated into these Terms by reference. Please review our <a href="/shipping-policy" className="text-blue-600 hover:text-blue-800">Shipping Policy</a> for information on shipping methods, costs, delivery estimates, and international shipping.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">7. Returns, Refunds, and Exchanges</h2>
                            <div className="mb-6">
                                <p className="mb-4">Our policy on returns, refunds, and exchanges is outlined in our separate <strong>Returns Policy</strong>, which is incorporated into these Terms by reference. Please review our Returns Policy for details on eligibility, procedures, and conditions for returns and exchanges.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">8. User-Generated Content</h2>
                            <div className="mb-6">
                                <p className="mb-4">If our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material ("User Content"), you are solely responsible for the User Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>
                                <p className="mb-4">By posting User Content on or through the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such User Content on and through the Service. You retain any and all of your rights to any User Content you submit, post or display on or through the Service and you are responsible for protecting those rights.</p>
                                <p className="mb-4">You represent and warrant that: (i) the User Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your User Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.</p>
                                <p className="mb-4">We reserve the right, but not the obligation, to monitor and edit all User Content provided by users.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">9. Links to Other Websites</h2>
                            <div className="mb-6">
                                <p className="mb-4">Our Service may contain links to third-party websites or services that are not owned or controlled by Lure.</p>
                                <p className="mb-4">Lure has no control over and assumes no responsibility for the content, privacy policies, or practices of any third-party websites or services. We do not warrant the offerings of any of these entities/individuals or their websites.</p>
                                <p className="mb-4">You acknowledge and agree that Lure shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such third-party websites or services.</p>
                                <p className="mb-4">We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">10. Disclaimer of Warranties</h2>
                            <div className="mb-6">
                                <p className="mb-4">Your use of the Service (website and functionalities) is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.</p>
                                <p className="mb-4">Lure, its partners, and its licensors do not warrant that: a) the Service will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">11. Limitation of Liability</h2>
                            <div className="mb-6">
                                <p className="mb-4">In no event shall Lure, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">12. Indemnification</h2>
                            <div className="mb-6">
                                <p className="mb-4">You agree to defend, indemnify, and hold harmless Lure and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; or b) a breach of these Terms.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
                            <div className="mb-6">
                                <p className="mb-4">These Terms shall be governed and construed in accordance with the laws of Delaware and the federal laws of the United States, without regard to its conflict of law provisions.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">14. Dispute Resolution (Arbitration Clause & Class Action Waiver)</h2>
                            <div className="mb-6">
                                <p className="mb-4 font-semibold">Please Read This Section Carefully – It May Significantly Affect Your Legal Rights, Including Your Right to File a Lawsuit in Court.</p>
                                <p className="mb-4">Any dispute, claim, or controversy arising out of or relating to these Terms or the breach, termination, enforcement, interpretation, or validity thereof, including the determination of the scope or applicability of this agreement to arbitrate, shall be determined by <strong>binding arbitration</strong> in Los Angeles, California before one arbitrator. The arbitration shall be administered by JAMS or American Arbitration Association (AAA) pursuant to its Comprehensive Arbitration Rules and Procedures or Consumer Arbitration Rules and in accordance with the Expedited Procedures in those Rules. Judgment on the Award may be entered in any court having jurisdiction. This clause shall not preclude parties from seeking provisional remedies in aid of arbitration from a court of appropriate jurisdiction.</p>
                                <p className="mb-4"><strong>Class Action Waiver:</strong> You and Lure agree that each may bring claims against the other only in your or its individual capacity and not as a plaintiff or class member in any purported class or representative proceeding. Unless both you and Lure agree otherwise, the arbitrator may not consolidate more than one person's claims and may not otherwise preside over any form of a representative or class proceeding.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">15. Changes to These Terms</h2>
                            <div className="mb-6">
                                <p className="mb-4">We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                                <p className="mb-4">By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.</p>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">16. Termination</h2>
                            <div className="mb-6">
                                <p className="mb-4">We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                                <p className="mb-4">Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mt-8">
                                <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                                <p className="mb-2">If you have any questions about these Terms, please contact us:</p>
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