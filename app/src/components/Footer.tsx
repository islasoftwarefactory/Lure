import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/icons/home/footer.svg';

export function Footer() {
  return (
    <footer 
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
      }} 
      className="bg-[#ffffff] w-full min-h-[600px] md:min-h-[600px]"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start md:mr-[-400px]" style={{ 
          maxWidth: '1800px',
        }}>
          {/* Grupo das 4 primeiras colunas */}
          <div className="flex flex-col md:flex-row space-y-10 md:space-y-0 md:space-x-16 lg:space-x-32 md:ml-[-100px]">
            {/* Shopping Information Column */}
            <div className="w-full md:w-48">
              <h3 className="font-semibold mb-4 text-lg">Shopping Information</h3>
              <ul className="space-y-3">
                <li><Link to="/shipping-policy" className="text-gray-600 hover:text-gray-900 font-semibold">Shipping Policy</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Returns & Exchanges</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Payment Methods</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Order Tracking</Link></li>
              </ul>
            </div>

            {/* Help & Support Column */}
            <div className="w-full md:w-48">
              <h3 className="font-semibold mb-4 text-lg">Help & Support</h3>
              <ul className="space-y-3">
                <li><Link to="/contact" className="text-gray-600 hover:text-gray-900 font-semibold">Contact Us</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Help Center</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">FAQs</Link></li>
              </ul>
            </div>

            {/* About Company Column */}
            <div className="w-full md:w-48">
              <h3 className="font-semibold mb-4 text-lg">About Company</h3>
              <ul className="space-y-3">
                <li><Link to="/about-us" className="text-gray-600 hover:text-gray-900 font-semibold">About Us</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Accessibility</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="w-full md:w-48">
              <h3 className="font-semibold mb-4 text-lg">Legal</h3>
              <ul className="space-y-3">
                <li><Link to="/terms-of-service" className="text-gray-600 hover:text-gray-900 font-semibold">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="text-gray-600 hover:text-gray-900 font-semibold">Privacy Policy</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Manage Cookies</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column - Temporariamente comentado */}
        </div>

        {/* Divider Line with Lure text */}
        <div className="relative w-full md:w-[calc(100%+400px)] md:ml-[-200px] mt-24 md:mt-[150px] mb-12">
          <span className="absolute -top-14 left-0 text-[#231f20] font-semibold text-4xl">
            𝐋𝐔𝐑𝐄
          </span>
          <div className="border-t-2 border-gray-300 w-full"></div>
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <span className="text-[#79808a] font-semibold text-sm text-center md:text-left mb-2 md:mb-0">
              2025 Lure® All rights reserved.
            </span>
            <div className="space-x-4 text-[#79808a] font-semibold text-sm">
              {/* Links de privacidade e termos podem ser adicionados aqui se necessário */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}