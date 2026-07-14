import React from 'react';
import { motion } from 'framer-motion';

export const MarqueeStrip = () => {
  return (
    <div className="w-full overflow-hidden bg-brand-lime py-2 border-y-2 border-brand-dark flex whitespace-nowrap" style={{ backgroundColor: 'var(--color-brand-lime)', borderColor: 'var(--color-brand-dark)' }}>
      <motion.div 
        animate={{ x: [0, -1035] }} 
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        className="flex items-center gap-12 font-display text-xl text-brand-dark uppercase tracking-widest"
        style={{ color: 'var(--color-brand-dark)' }}
      >
        {/* Repeat content to create seamless loop */}
        {[...Array(6)].map((_, i) => (
          <React.Fragment key={i}>
            <span className="font-bold">SUBJECTIVE CONSENSUS</span>
            <span className="text-xl opacity-50">✦</span>
            <span className="text-[var(--color-brand-dark)] opacity-40 hover:opacity-100 transition-opacity duration-300">GENLAYER NETWORK</span>
            <span className="text-xl opacity-50">✦</span>
            <span className="font-bold">POW LENDING</span>
            <span className="text-xl opacity-50">✦</span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
