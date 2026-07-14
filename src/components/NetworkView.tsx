import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, Cpu, Network } from 'lucide-react';
import { useGenLayer } from '../hooks/useGenLayer';

export const NetworkView: React.FC<{ 
  genLayer: ReturnType<typeof useGenLayer>
}> = ({ genLayer }) => {
  const { address } = genLayer;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto w-full px-6 py-12 flex flex-col gap-12 font-sans"
    >
      <div className="border-b-2 border-[var(--border-color)] pb-4 flex justify-between items-end">
        <h3 className="text-5xl font-display text-[var(--text-main)] uppercase tracking-wide">
          NETWORK STATUS
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="brutalist-panel p-8 relative overflow-hidden group hover:border-[var(--text-lime)] transition-colors">
          <Server className="w-12 h-12 text-[var(--text-lime)] mb-6" />
          <h4 className="text-[var(--text-main)] text-sm font-mono opacity-50 mb-2">ACTIVE NODE ID</h4>
          <p className="text-2xl md:text-3xl font-mono text-[var(--text-main)] break-all">
            {address ? address : 'DISCONNECTED'}
          </p>
        </div>

        <div className="brutalist-panel p-8 relative overflow-hidden group hover:border-[var(--text-lime)] transition-colors">
          <Activity className="w-12 h-12 text-[var(--text-lime)] mb-6" />
          <h4 className="text-[var(--text-main)] text-sm font-mono opacity-50 mb-2">NETWORK LATENCY</h4>
          <p className="text-2xl md:text-3xl font-mono text-[var(--text-main)]">
            24ms
          </p>
        </div>

        <div className="brutalist-panel p-8 relative overflow-hidden group hover:border-[var(--text-lime)] transition-colors">
          <Cpu className="w-12 h-12 text-[var(--text-lime)] mb-6" />
          <h4 className="text-[var(--text-main)] text-sm font-mono opacity-50 mb-2">CONSENSUS ENGINE</h4>
          <p className="text-2xl md:text-3xl font-mono text-[var(--text-main)]">
            GENLAYER V1.0
          </p>
        </div>

        <div className="brutalist-panel p-8 relative overflow-hidden group hover:border-[var(--text-lime)] transition-colors">
          <Network className="w-12 h-12 text-[var(--text-lime)] mb-6" />
          <h4 className="text-[var(--text-main)] text-sm font-mono opacity-50 mb-2">INTELLIGENT CONTRACTS</h4>
          <p className="text-2xl md:text-3xl font-mono text-[var(--text-main)]">
            1 ACTIVE
          </p>
        </div>
      </div>
    </motion.div>
  );
};
