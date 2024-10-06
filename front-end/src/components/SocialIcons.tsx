import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react'; // Importando apenas o ícone Mail
import TikTokIcon from '../assets/icons/home/TikTok.svg';
import PinterestIcon from '../assets/icons/home/Pinterest.svg';
import InstagramIcon from '../assets/icons/home/Instagram.svg';

export const SocialIcons: React.FC = () => {
  return (
    <div className="p-4 h-[60px] flex justify-end space-x-4">
      <SocialIconLink to="/contact" icon={Mail} alt="Contact" /> {/* Usando o componente Mail para contato */}
      <SocialIconLink to="/instagram" icon={InstagramIcon} alt="Instagram" />
      <SocialIconLink to="/tiktok" icon={TikTokIcon} alt="TikTok" />
      <SocialIconLink to="/pinterest" icon={PinterestIcon} alt="Pinterest" />
    </div>
  );
};

interface SocialIconLinkProps {
  to: string;
  icon: React.ElementType | string;
  alt: string;
}

const SocialIconLink: React.FC<SocialIconLinkProps> = ({ to, icon: Icon, alt }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="bg-gray-200 rounded-full p-2 transition duration-300 ease-in-out hover:shadow-md"
  >
    <Link to={to} className="text-black">
      {typeof Icon === 'string' ? (
        <img src={Icon} alt={alt} className="w-6 h-6" />
      ) : (
        <Icon size={24} aria-label={alt} />
      )}
    </Link>
  </motion.div>
);