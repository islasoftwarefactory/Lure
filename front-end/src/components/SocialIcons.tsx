import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TikTokIcon from '../assets/icons/home/TikTok.svg';
import PinterestIcon from '../assets/icons/home/Pinterest.svg';
import InstagramIcon from '../assets/icons/home/Instagram.svg';
import ContactIcon from '../assets/icons/home/Contact.svg';

export const SocialIcons: React.FC = () => {
  return (
    <div className="p-4 h-[60px] flex justify-end space-x-4">
      <SocialIconLink to="/contact" icon={ContactIcon} alt="Contact" />
      <SocialIconLink to="/instagram" icon={InstagramIcon} alt="Instagram" />
      <SocialIconLink to="/tiktok" icon={TikTokIcon} alt="TikTok" />
      <SocialIconLink to="/pinterest" icon={PinterestIcon} alt="Pinterest" />
    </div>
  );
};

interface SocialIconLinkProps {
  to: string;
  icon: string;
  alt: string;
}

const SocialIconLink: React.FC<SocialIconLinkProps> = ({ to, icon, alt }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="bg-gray-200 rounded-full p-2 transition duration-300 ease-in-out hover:shadow-md"
  >
    <Link to={to} className="text-black">
      <img src={icon} alt={alt} className="w-6 h-6" />
    </Link>
  </motion.div>
);