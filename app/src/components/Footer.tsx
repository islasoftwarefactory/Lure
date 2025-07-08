import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/icons/home/footer.svg';

export function Footer() {
  return (
    <footer style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'bottom',
      backgroundSize: 'cover',
      minHeight: '600px',
      width: '100%'
    }} className="bg-[#ffffff]">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex" style={{ 
          maxWidth: '1800px',
          marginRight: '-400px'
        }}>
          {/* Grupo das 4 primeiras colunas */}
          <div className="flex" style={{ marginLeft: '-100px' }}>
            {/* Shopping Information Column */}
            <div className="w-48">
              <h3 className="font-semibold mb-4">Shopping Information</h3>
              <ul className="space-y-3">
                <li><Link to="/shipping-policy" className="text-gray-600 hover:text-gray-900 font-semibold">Shipping Policy</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Returns & Exchanges</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Payment Methods</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Order Tracking</Link></li>
              </ul>
            </div>

            {/* Help & Support Column */}
            <div className="w-48 ml-32">
              <h3 className="font-semibold mb-4">Help & Support</h3>
              <ul className="space-y-3">
                <li><Link to="/contact" className="text-gray-600 hover:text-gray-900 font-semibold">Contact Us</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Help Center</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">FAQs</Link></li>
              </ul>
            </div>

            {/* About Company Column */}
            <div className="w-48 ml-32">
              <h3 className="font-semibold mb-4">About Company</h3>
              <ul className="space-y-3">
                <li><Link to="/about-us" className="text-gray-600 hover:text-gray-900 font-semibold">About Us</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 font-semibold">Accessibility</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="w-48 ml-32">
              <h3 className="font-semibold mb-4">Legal</h3>
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
        <div className="relative" style={{ 
          width: 'calc(100% + 400px)',
          marginLeft: '-200px',
          marginTop: '150px',
          marginBottom: '48px'
        }}>
          <span className="absolute -top-14 left-0 text-[#231f20] font-semibold text-4xl">
            𝐋𝐔𝐑𝐄
          </span>
          <div className="border-t-2 border-gray-300 w-full"></div>
          <span className="absolute top-4 left-0 text-[#79808a] font-semibold text-sm">
            2025 Lure® All rights reserved.
          </span>
          {/* Empty div where bottom links used to be, to keep layout consistent */}
          <div className="absolute top-4 right-0 space-x-4 text-[#79808a] font-semibold text-sm">
          </div>
        </div>
      </div>
    </footer>
  );
}