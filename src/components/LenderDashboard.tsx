import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { useGenLayer } from '../hooks/useGenLayer';
import { Magnetic } from './Magnetic';

export const LenderDashboard: React.FC<{ genLayer: ReturnType<typeof useGenLayer> }> = ({ genLayer }) => {
  const { address, contractAddress, network, raiseDispute, arbitrateDispute } = genLayer;
  
  const [pools, setPools] = useState<any[]>([]);
  const [treasury, setTreasury] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Dispute state
  const [disputeAppId, setDisputeAppId] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [arbitrateId, setArbitrateId] = useState('');

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
            Yield Staking (GLOBAL)
          </h4>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-zinc-500 uppercase">Stake Amount (GEN Wei)</label>
              <div className="flex gap-2">
                <input type="number" className="bg-transparent border border-zinc-700 p-3 flex-1 outline-none focus:border-[var(--text-lime)]" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
                <Magnetic>
                  <button onClick={() => genLayer.stake('GLOBAL', parseInt(depositAmount))} className="btn-primary py-3 px-6 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" /> STAKE
                  </button>
                </Magnetic>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-zinc-500 uppercase">Unstake Amount (GEN Wei)</label>
              <div className="flex gap-2">
                <input type="number" className="bg-transparent border border-zinc-700 p-3 flex-1 outline-none focus:border-orange-500" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                <button onClick={() => genLayer.unstake('GLOBAL', parseInt(withdrawAmount))} className="btn-outline border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black py-3 px-6 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4" /> UNSTAKE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISPUTE CENTER */}
      <div className="brutalist-panel p-8 border border-red-900/50 relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        <h4 className="text-red-500 text-2xl font-display uppercase tracking-widest mb-6">
          AI Dispute Center
        </h4>
        <p className="text-zinc-400 font-mono text-sm mb-6 max-w-2xl">
          Report fraudulent borrowers. The AI Oracle will independently verify external evidence. If proven, the borrower is slashed and marked DEFAULT_SLASHED.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h5 className="text-[var(--text-main)] font-mono text-sm uppercase">Raise a Dispute</h5>
            <input type="text" placeholder="Loan Application ID (e.g. APP-1)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-red-500" value={disputeAppId} onChange={e => setDisputeAppId(e.target.value)} />
            <input type="text" placeholder="Reason (e.g. Borrower rugged the DAO)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-red-500" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} />
            <input type="text" placeholder="Evidence URL (GitHub/Twitter proof)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-red-500" value={disputeEvidence} onChange={e => setDisputeEvidence(e.target.value)} />
            <Magnetic>
              <button onClick={() => raiseDispute(disputeAppId, disputeReason, disputeEvidence)} className="bg-red-900/30 text-red-400 border border-red-900 hover:bg-red-500 hover:text-black transition-colors w-full py-3 mt-2 font-mono uppercase tracking-widest">SUBMIT DISPUTE</button>
            </Magnetic>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-[var(--text-main)] font-mono text-sm uppercase">Arbitrate Pending Dispute</h5>
            <input type="text" placeholder="Dispute ID (e.g. DISPUTE-1)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-orange-500" value={arbitrateId} onChange={e => setArbitrateId(e.target.value)} />
            <Magnetic>
              <button onClick={() => arbitrateDispute(arbitrateId)} className="bg-orange-900/30 text-orange-400 border border-orange-900 hover:bg-orange-500 hover:text-black transition-colors w-full py-3 mt-2 font-mono uppercase tracking-widest">TRIGGER AI ARBITRATION</button>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* KEEPER LIQUIDATION TERMINAL */}
      <div className="brutalist-panel p-8 border border-purple-900/50 relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-900/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        <h4 className="text-purple-500 text-2xl font-display uppercase tracking-widest mb-6">
          Keeper Liquidation Terminal (Bounties)
        </h4>
        <p className="text-zinc-400 font-mono text-sm mb-6 max-w-2xl">
          Scan the protocol for unhealthy loans. Trigger an AI re-evaluation of the borrower's social score and github metrics. If liquidated, earn a massive liquidation fee straight to your staking balance.
        </p>

        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Target Loan ID (e.g. APP-1)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-purple-500" value={(window as any).liqAppId || ''} onChange={e => (window as any).liqAppId = e.target.value} />
          <Magnetic>
            <button onClick={() => genLayer.aiLiquidate((window as any).liqAppId)} className="bg-purple-900/30 text-purple-400 border border-purple-900 hover:bg-purple-500 hover:text-black transition-colors w-full py-3 mt-2 font-mono uppercase tracking-widest">TRIGGER AI LIQUIDATION</button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
};
