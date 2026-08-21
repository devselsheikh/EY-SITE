import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useLocation } from 'react-router';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  
  // Determine color scheme based on current route
  const isDaycare = location.pathname.startsWith('/daycare');
  const isEduHub = location.pathname.startsWith('/eduhub');

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when scrolled down more than 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Color schemes for different sections
  const getColorScheme = () => {
    if (isDaycare) {
      return 'from-peach-400 via-coral-500 to-pink-500';
    } else if (isEduHub) {
      return 'from-blue-500 to-blue-700';
    } else {
      return 'from-coral-500 to-pink-500';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-50 hidden md:flex w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${getColorScheme()} text-white shadow-2xl hover:shadow-3xl transition-all items-center justify-center group cursor-pointer`}
          aria-label="Scroll to top"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
          </motion.div>
          
          {/* Ripple effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 0.2, scale: 1.2 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap pointer-events-none hidden sm:block"
          >
            Back to top
            <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}