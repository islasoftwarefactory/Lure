import React from 'react';
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
            {/* Support Column */}
            <div className="w-48">
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Shipping</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Returns</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Contact Us</a></li>
              </ul>
            </div>

            {/* About Column */}
            <div className="w-48 ml-32">  
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Sustainability</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Horween Leather</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Careers</a></li>
              </ul>
            </div>

            {/* Sales Column */}
            <div className="w-48 ml-32">
              <h3 className="font-semibold mb-4">Sales</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Press & Affiliates</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Where We're Sold</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Wholesale</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Discounted Gear</a></li>
              </ul>
            </div>

            {/* Explore Column */}
            <div className="w-48 ml-32">
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Become an Ambassador</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">The Nomadic Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Wallpapers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 font-semibold">Limited Edition</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column - Temporariamente comentado
          <div className="w-80 ml-64">
            <h3 className="text-sm mb-4 font-semibold">Explore with us! Sign up to receive exclusive access to product drops, company news, and more.</h3>
            <div className="flex items-center gap-2">
              <input 
                type="email" 
                placeholder="Email" 
                className="flex-1 px-4 py-2 border rounded-full bg-white font-semibold text-xs shadow-xl border-black/10"
              />
              <button className="px-4 py-2 bg-white text-black rounded-full border border-black/10 hover:bg-gray-50 font-semibold text-xs shadow-xl">
                Submit
              </button>
            </div>
          </div>
          */}
        </div>



        {/* Divider Line */}
        <div 
          className="border-t-2 border-gray-300" 
          style={{ 
            width: 'calc(100% + 400px)',
            marginLeft: '-200px',
            marginTop: '150px',
            marginBottom: '48px'
          }}
        ></div>
      </div>
    </footer>
  );
}