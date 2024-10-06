import React from 'react';
import googlePayLogo from '../assets/icons/payments/google-pay.svg?url';
import applePayLogo from '../assets/icons/payments/apple-pay.svg?url';

export function Footer() {
  return (
    <footer className="bg-[#ffffff]">
      <div className="border-t border-black"> {/* Adicionada esta linha */}
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <div className="md:justify-self-center">
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms and Conditions</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Printing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Refund Policy</a></li>
              </ul>
            </div>
            <div className="md:justify-self-center">
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><a href="mailto:suporte@lure.contact" className="text-gray-600 hover:text-gray-900">suporte@lure.contact</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Shipping and Returns</a></li>
              </ul>
              <div className="mt-6 flex space-x-4">
                <img src={googlePayLogo} alt="Google Pay" className="w-12 h-8 object-contain" />
                <img src={applePayLogo} alt="Apple Pay" className="w-12 h-8 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}