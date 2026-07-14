import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundEffects } from '../hooks/useSoundEffects';

export const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const { playSuccessSound } = useSoundEffects();

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setIsLoaded(true);
        playSuccessSound();
        setTimeout(onComplete, 1200); // Wait for exit animation
      }
      setProgress(current);
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete, playSuccessSound]);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ 
            y: '-100%', 
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }
          }}
          className="fixed inset-0 z-[99999] bg-[var(--bg-primary)] flex flex-col justify-end p-8 md:p-16"
        >
          <div className="flex justify-between items-end overflow-hidden w-full">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[10vw] md:text-[15vw] leading-none font-display text-[var(--text-main)]"
            >
              MACRO<span className="text-[var(--text-lime)]">FI</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-6xl md:text-9xl font-mono text-[var(--text-lime)] font-bold tabular-nums"
            >
              {progress}%
            </motion.div>
          </div>
          
          <div className="w-full h-1 bg-[var(--border-color)] mt-8 overflow-hidden">
            <motion.div 
              className="h-full bg-[var(--text-lime)]"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
