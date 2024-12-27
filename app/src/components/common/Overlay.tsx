import { motion } from 'framer-motion';

interface OverlayProps {
  isVisible: boolean;
  onClose?: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ isVisible, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-40"
      onClick={onClose}
    />
  );
}; 