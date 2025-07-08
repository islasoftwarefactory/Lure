import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/icons/home/footer.svg';
import { ChevronDown } from 'lucide-react';

interface FooterLink {
  to: string;
  label: string;
}

interface FooterSectionProps {
  title: string;
  links: FooterLink[];
}

// Reusable component for expandable sections
const FooterSection = ({ title, links }: FooterSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full md:w-48">
      <h3
        className="font-semibold mb-4 text-lg cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </h3>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <ul className="space-y-3 pt-2">
          {links.map((link, index) => (
            <li key={index}>
              <Link to={link.to} className="text-gray-600 hover:text-gray-900 font-semibold">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export function Footer() {
  const sections: FooterSectionProps[] = [
    {
      title: 'Shopping Information',
      links: [
        { to: '/shipping-policy', label: 'Shipping Policy' },
        { to: '#', label: 'Returns & Exchanges' },
        { to: '#', label: 'Payment Methods' },
        { to: '#', label: 'Order Tracking' },
      ],
    },
    {
      title: 'Help & Support',
      links: [
        { to: '/contact', label: 'Contact Us' },
        { to: '#', label: 'Help Center' },
        { to: '#', label: 'FAQs' },
      ],
    },
    {
      title: 'About Company',
      links: [
        { to: '/about-us', label: 'About Us' },
        { to: '#', label: 'Accessibility' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { to: '/terms-of-service', label: 'Terms of Service' },
        { to: '/privacy-policy', label: 'Privacy Policy' },
        { to: '#', label: 'Manage Cookies' },
      ],
    },
  ];

  return (
    <footer 
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
      }} 
      className="bg-[#ffffff] w-full min-h-[600px] md:min-h-[600px] flex flex-col"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full flex flex-col flex-1">
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start md:mr-[-400px]" style={{ 
            maxWidth: '1800px',
          }}>
            {/* Grupo das 4 primeiras colunas */}
            <div className="flex flex-col md:flex-row space-y-10 md:space-y-0 md:space-x-16 lg:space-x-32 md:ml-[-100px]">
              {sections.map((section, index) => (
                <FooterSection key={index} title={section.title} links={section.links} />
              ))}
            </div>

            {/* Newsletter Column - Temporariamente comentado */}
          </div>
        </div>

        {/* Divider Line with Lure text */}
        <div className="relative w-full md:w-[calc(100%+400px)] md:ml-[-200px] mt-auto pt-8">
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