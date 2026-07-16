import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { useGenLayer } from '../hooks/useGenLayer';
import { Magnetic } from './Magnetic';

export const LenderDashboard: React.FC<{ genLayer: ReturnType<typeof useGenLayer> }> = ({ genLayer }) => {
  const { address, contractAddress, network, raiseDispute, arbitrateDispute, protocolState } = genLayer;
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Dispute state
  const [disputeAppId, setDisputeAppId] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [arbitrateId, setArbitrateId] = useState('');
  const [liqAppId, setLiqAppId] = useState('');
  const [propTitle, setPropTitle] = useState('');
  const [propConst, setPropConst] = useState('');
  const [propId, setPropId] = useState('');
  
  // Treasury Derived Stats
  const treasury = protocolState?.treasury || { total_deposited_wei: 0, total_borrowed_wei: 0 };
  const deposited = Number(treasury.total_deposited_wei) / 1e18;
  const borrowed = Number(treasury.total_borrowed_wei) / 1e18;
  const reserveRatio = deposited > 0 ? (((deposited - borrowed) / deposited) * 100).toFixed(1) : "0.0";
  
  return (
    <div className="flex flex-col gap-8 w-full mt-12 pt-12 border-t-2 border-[var(--border-color)]">
      <h3 className="text-4xl font-display text-[var(--text-main)] uppercase tracking-wide flex items-center gap-4">
        <Briefcase className="w-10 h-10" /> Lender & Liquidity
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Treasury Panel */}
        <div className="brutalist-panel p-8 bg-[var(--color-brand-grey)] border-[var(--border-color)]">
          <h4 className="text-[var(--text-lime)] text-2xl font-display uppercase tracking-widest mb-6 flex items-center gap-2">
            <RefreshCcw className={`w-5 h-5 ${genLayer.isFetching ? 'animate-spin' : ''}`} /> Global Treasury
          </h4>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-mono text-zinc-500 uppercase">Total TVL (GEN)</span>
              <span className="text-2xl font-bold">{deposited.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-mono text-zinc-500 uppercase">Total Borrowed</span>
              <span className="text-2xl font-bold text-orange-500">{borrowed.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="font-mono text-zinc-500 uppercase">Reserve Ratio</span>
              <span className={`text-2xl font-bold ${Number(reserveRatio) < 20 ? 'text-red-500' : 'text-[var(--text-lime)]'}`}>{reserveRatio}%</span>
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
              <label className="font-mono text-xs text-zinc-500 uppercase">Stake Amount (GEN)</label>
              <div className="flex gap-2">
                <input type="number" className="bg-transparent border border-zinc-700 p-3 flex-1 outline-none focus:border-[var(--text-lime)]" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
                <Magnetic>
                  <button onClick={() => genLayer.stake('GLOBAL', Math.floor(Number(depositAmount) * 1e18))} className="btn-primary py-3 px-6 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" /> STAKE
                  </button>
                </Magnetic>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-zinc-500 uppercase">Unstake Amount (GEN)</label>
              <div className="flex gap-2">
                <input type="number" className="bg-transparent border border-zinc-700 p-3 flex-1 outline-none focus:border-orange-500" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                <button onClick={() => genLayer.unstake('GLOBAL', Math.floor(Number(withdrawAmount) * 1e18))} className="btn-outline border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black py-3 px-6 flex items-center gap-2">
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
          <input type="text" placeholder="Target Loan ID (e.g. APP-1)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-purple-500" value={liqAppId} onChange={e => setLiqAppId(e.target.value)} />
          <Magnetic>
            <button onClick={() => genLayer.aiLiquidate(liqAppId)} className="bg-purple-900/30 text-purple-400 border border-purple-900 hover:bg-purple-500 hover:text-black transition-colors w-full py-3 mt-2 font-mono uppercase tracking-widest">TRIGGER AI LIQUIDATION</button>
          </Magnetic>
        </div>
      </div>

      {/* AI DAO GOVERNANCE TERMINAL */}
      <div className="brutalist-panel p-8 border border-emerald-900/50 relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        <h4 className="text-emerald-500 text-2xl font-display uppercase tracking-widest mb-6">
          <i className="fa-solid fa-gavel"></i> Constitutional DAO Governance
        </h4>
        <p className="text-zinc-400 font-mono text-sm mb-6 max-w-2xl">
          Submit proposals to upgrade the protocol constitution. The AI Oracle acts as the Supreme Court and pre-screens proposals for malicious intent. Passed proposals will be voted on using Proof-of-Reputation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h5 className="text-[var(--text-main)] font-mono text-sm uppercase">Submit Proposal</h5>
            <input type="text" placeholder="Title (e.g. Decrease global interest to 3%)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-emerald-500" value={propTitle} onChange={e => setPropTitle(e.target.value)} />
            <textarea placeholder="New Constitution Text..." className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-emerald-500 min-h-[100px]" value={propConst} onChange={e => setPropConst(e.target.value)} />
            <Magnetic>
              <button onClick={() => genLayer.submitProposal(propTitle, propConst)} className="bg-emerald-900/30 text-emerald-400 border border-emerald-900 hover:bg-emerald-500 hover:text-black transition-colors w-full py-3 mt-2 font-mono uppercase tracking-widest">SUBMIT PROPOSAL</button>
            </Magnetic>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-[var(--text-main)] font-mono text-sm uppercase">Vote & Execute</h5>
            <input type="text" placeholder="Proposal ID (e.g. PROP-1)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-emerald-500" value={propId} onChange={e => setPropId(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Magnetic>
                <button onClick={() => genLayer.voteProposal(propId, true)} className="bg-green-900/30 text-green-400 border border-green-900 hover:bg-green-500 hover:text-black transition-colors w-full py-3 font-mono uppercase tracking-widest">VOTE YES</button>
              </Magnetic>
              <Magnetic>
                <button onClick={() => genLayer.voteProposal(propId, false)} className="bg-red-900/30 text-red-400 border border-red-900 hover:bg-red-500 hover:text-black transition-colors w-full py-3 font-mono uppercase tracking-widest">VOTE NO</button>
              </Magnetic>
            </div>
            <Magnetic>
              <button onClick={() => genLayer.executeProposal(propId)} className="bg-zinc-900 text-zinc-400 border border-zinc-700 hover:bg-white hover:text-black transition-colors w-full py-3 mt-2 font-mono uppercase tracking-widest">EXECUTE PROPOSAL</button>
            </Magnetic>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;
