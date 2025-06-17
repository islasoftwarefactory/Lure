import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
// import { TikTok } from 'lucide-react';
// import PinterestIcon from '../assets/icons/home/Pinterest.svg';
import InstagramIcon from '../assets/icons/home/instagram.svg';

export const SocialIcons: React.FC = () => {
  return (
    <div className="p-4 h-[60px] flex justify-end space-x-4">
      <SocialIconLink to="/contact" icon={Mail} alt="Contact" />
      <SocialIconLink 
        to="https://www.instagram.com/lure.us/" 
        icon={InstagramIcon} 
        alt="Instagram" 
        external
      />
      {/* <SocialIconLink 
        to="/tiktok" 
        icon={(props) => <TikTok {...props} fill="white" stroke="white" />} 
        alt="TikTok" 
      /> */}
      {/* <SocialIconLink to="/pinterest" icon={PinterestIcon} alt="Pinterest" /> */}
    </div>
  );
};

interface SocialIconLinkProps {
  to: string;
  icon: React.ElementType | string;
  alt: string;
  external?: boolean;
}

const SocialIconLink: React.FC<SocialIconLinkProps> = ({ to, icon: Icon, alt, external = false }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="bg-[#090707] rounded-full p-2 w-10 h-10 flex items-center justify-center transition duration-300 ease-in-out hover:shadow-md"
  >
    {external ? (
      <a href={to} target="_blank" rel="noopener noreferrer" className="text-white">
        {typeof Icon === 'string' ? (
          <img src={Icon} alt={alt} className="w-6 h-6" />
        ) : (
          <Icon size={24} aria-label={alt} />
        )}
      </a>
    ) : (
      <Link to={to} className="text-white">
        {typeof Icon === 'string' ? (
          <img src={Icon} alt={alt} className="w-6 h-6" />
        ) : (
          <Icon size={24} aria-label={alt} />
        )}
      </Link>
    )}
  </motion.div>
);