import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { useGenLayer } from '../hooks/useGenLayer';
import { Magnetic } from './Magnetic';

export const LenderDashboard: React.FC<{ genLayer: ReturnType<typeof useGenLayer> }> = ({ genLayer }) => {
  const { address, contractAddress, network } = genLayer;
  
  const [pools, setPools] = useState<any[]>([]);
  const [treasury, setTreasury] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // In a real app, you would fetch these from the contract via useGenLayer
  // For the sake of this mock, we will use static or derived values for now
  
  return (
    <div className="flex flex-col gap-8 w-full mt-12 pt-12 border-t-2 border-[var(--border-color)]">
      <h3 className="text-4xl font-display text-[var(--text-main)] uppercase tracking-wide flex items-center gap-4">
        <Briefcase className="w-10 h-10" /> Lender & Liquidity
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Treasury Panel */}
        <div className="brutalist-panel p-8 bg-[var(--color-brand-grey)] border-[var(--border-color)]">
          <h4 className="text-[var(--text-lime)] text-2xl font-display uppercase tracking-widest mb-6">
            Global Treasury
          </h4>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-mono text-zinc-500 uppercase">Total TVL (GEN)</span>
              <span className="text-2xl font-bold">14,200</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-mono text-zinc-500 uppercase">Total Borrowed</span>
              <span className="text-2xl font-bold text-orange-500">8,450</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="font-mono text-zinc-500 uppercase">Reserve Ratio</span>
              <span className="text-2xl font-bold text-[var(--text-lime)]">20%</span>
            </div>
          </div>
        </div>

        {/* Deposit/Withdraw Panel */}
        <div className="brutalist-panel p-8">
          <h4 className="text-[var(--text-main)] text-2xl font-display uppercase tracking-widest mb-6">
            Manage Liquidity (POOL-1)
          </h4>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-zinc-500 uppercase">Deposit Amount (GEN Wei)</label>
              <div className="flex gap-2">
                <input type="number" className="bg-transparent border border-zinc-700 p-3 flex-1 outline-none focus:border-[var(--text-lime)]" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
                <Magnetic>
                  <button className="btn-primary py-3 px-6 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" /> DEPOSIT
                  </button>
                </Magnetic>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-zinc-500 uppercase">Withdraw Amount (GEN Wei)</label>
              <div className="flex gap-2">
                <input type="number" className="bg-transparent border border-zinc-700 p-3 flex-1 outline-none focus:border-orange-500" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                <button className="btn-outline border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black py-3 px-6 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4" /> WITHDRAW
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
