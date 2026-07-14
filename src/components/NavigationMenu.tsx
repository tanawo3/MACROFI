import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SplitText } from './SplitText';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'dashboard' | 'network' | 'docs') => void;
}

const navLinks = [
  { name: 'DASHBOARD', num: '01', id: 'dashboard' as const },
  { name: 'NETWORK', num: '02', id: 'network' as const },
  { name: 'DOCS', num: '03', id: 'docs' as const }
];

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const { playHoverSound, playClickSound } = useSoundEffects();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] bg-[var(--bg-primary)] flex flex-col pt-32 px-6 md:px-16"
        >
          {/* Noise overlay inside the menu */}
          <div className="noise-bg pointer-events-none" />
          <div className="scanlines pointer-events-none" />

          {/* Close Button */}
          <div className="absolute top-8 right-6 md:right-16 z-10">
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              onMouseEnter={playHoverSound}
              data-cursor-hover
              data-cursor-text="CLOSE"
              className="text-[var(--text-main)] hover:text-[var(--text-lime)] transition-colors flex items-center gap-2 font-mono uppercase tracking-widest text-sm"
            >
              CLOSE <X className="w-8 h-8" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4 md:gap-8 max-w-7xl mx-auto w-full relative z-10">
            {navLinks.map((link, i) => (
              <motion.div 
                key={link.name}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50, transition: { delay: 0.1 * i } }}
                transition={{ duration: 0.6, delay: 0.2 + (i * 0.1), ease: [0.33, 1, 0.68, 1] }}
                className="group cursor-pointer flex items-baseline gap-4 md:gap-8 overflow-hidden"
                onMouseEnter={playHoverSound}
                onClick={() => {
                  playClickSound();
                  onNavigate(link.id);
                  onClose();
                }}
                data-cursor-hover
                data-cursor-text="GO"
              >
                <span className="font-mono text-sm md:text-xl text-[var(--color-brand-offwhite)] opacity-30 group-hover:opacity-100 transition-opacity">
                  {link.num}
                </span>
                <h1 className="text-6xl md:text-[10vw] font-display text-[var(--text-main)] uppercase tracking-tight leading-[0.8] transition-colors group-hover:text-[var(--text-lime)]">
                  <SplitText text={link.name} />
                </h1>
              </motion.div>
            ))}
          </div>

          {/* Footer of Menu */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="border-t border-[var(--border-color)] py-8 flex justify-between font-mono text-sm uppercase tracking-widest opacity-50 relative z-10"
          >
            <span>MACROFI OS V1.0</span>
            <span>GENLAYER NETWORK</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
