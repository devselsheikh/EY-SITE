import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router';
import { useCMS } from '../hooks/useCMS';

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const cms = useCMS();
  const cta = cms.ctaSettings;

  const isDaycare = location.pathname.startsWith('/daycare') || location.pathname === '/blog';
  const isEduHub = location.pathname.startsWith('/eduhub');
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Daycare pages have their own sticky bottom bar; landing page is a branch selector — no CTA needed
  if (isDaycare || isLanding) return null;

  if (!isEduHub) return null;

  const config = { primary: { label: cta.eduhub.stickyPrimaryLabel, link: cta.eduhub.stickyPrimaryLink }, secondary: { label: cta.eduhub.stickySecondaryLabel, link: cta.eduhub.stickySecondaryLink }, color: 'bg-blue-600 hover:bg-blue-700', secondaryColor: 'bg-blue-800/80 hover:bg-blue-700' };

  const primary = config.primary;
  const secondary = config.secondary;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          <div className="px-4 pb-4 pt-2 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-2xl">
            <div className="flex gap-2">
              {secondary.label && secondary.link && (
                <Link
                  to={secondary.link}
                  className={`flex-1 flex items-center justify-center py-3 rounded-2xl ${config.secondaryColor} text-white font-semibold text-sm transition-colors`}
                >
                  {secondary.label}
                </Link>
              )}
              {primary.label && primary.link && (
                <Link
                  to={primary.link}
                  className={`flex-1 flex items-center justify-center py-3 rounded-2xl ${config.color} text-white font-bold text-sm transition-colors shadow-lg`}
                >
                  {primary.label}
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
