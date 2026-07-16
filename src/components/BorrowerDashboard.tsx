import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Check, X, Github, Twitter, Wallet, FileText } from 'lucide-react';
import { useGenLayer } from '../hooks/useGenLayer';
import { Magnetic } from './Magnetic';

export const BorrowerDashboard: React.FC<{ genLayer: ReturnType<typeof useGenLayer> }> = ({ genLayer }) => {
  const { 
    address, 
    linkSocials, 
    getBorrowerProfile, 
    getAllLoans, 
    applyForLoan, 
    acceptConditionalOffer, 
    repayLoan, 
    evaluateLoan,
    isEvaluating 
  } = genLayer;
  
  const [profile, setProfile] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [pitch, setPitch] = useState('');
  const [githubContribs, setGithubContribs] = useState('');
  const [daoVotes, setDaoVotes] = useState('');
  const [walletAgeDays, setWalletAgeDays] = useState('');
  const [collat, setCollat] = useState('');
  const [docHash, setDocHash] = useState('');
  const [selfieHash, setSelfieHash] = useState('');
  const [poaHash, setPoaHash] = useState('');
  
  const loadData = async () => {
    if (address) {
      const p = await getBorrowerProfile(address);
      setProfile(p);
      const allLoans = await getAllLoans();
      setLoans(allLoans.filter((l: any) => l.borrower.toLowerCase() === address.toLowerCase()));
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [address]);

  return (
    <div className="flex flex-col gap-8 w-full mt-12 pt-12 border-t-2 border-[var(--border-color)]">
      <h3 className="text-4xl font-display text-[var(--text-main)] uppercase tracking-wide">
        Borrower Identity & Loans
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Trust Profile Panel */}
        <div className="brutalist-panel p-8">
          <h4 className="text-[var(--text-lime)] text-2xl font-display uppercase tracking-widest mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" /> TRUST PROFILE
          </h4>
          
          {profile && (profile.is_verified || profile.kyc_status === 'VERIFIED') ? (
            <div className="flex flex-col gap-4">
              <div className="bg-black p-4 border border-[var(--text-lime)] flex justify-between items-center">
                <span className="font-mono text-zinc-500 uppercase">Trust Score</span>
                <span className="text-3xl font-bold text-[var(--text-lime)]">{profile.trust_score}</span>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                <span className="text-xs text-zinc-500 font-mono uppercase">Repayment Engine</span>
                <span className="text-sm font-mono text-white">Total Repaid: {profile.total_loans_repaid || 0}</span>
                <span className="text-sm font-mono text-white">Late Repayments: {profile.late_repayments || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
                <Github className="w-4 h-4" /> {profile.github_handle || 'Not Linked'}
              </div>
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
                <Twitter className="w-4 h-4" /> {profile.twitter_handle || 'Not Linked'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-zinc-400 mb-2">Link social accounts to unlock under-collateralized loans (up to 80% LTV) via AI verification.</p>
              <input type="text" placeholder="GitHub Username" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)]" value={github} onChange={e => setGithub(e.target.value)} />
              <input type="text" placeholder="Twitter Username" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)]" value={twitter} onChange={e => setTwitter(e.target.value)} />
              <Magnetic>
                <button onClick={() => genLayer.linkSocials(github, twitter)} className="btn-outline w-full py-3 mt-2">LINK ACCOUNTS</button>
              </Magnetic>
              
              <div className="border-t border-zinc-800 my-2 pt-4">
                <h5 className="text-[var(--text-lime)] text-lg font-display uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> ZERO-KNOWLEDGE KYC
                </h5>
                <p className="text-xs text-zinc-400 mb-4">Submit hashes of your identity documents for AI verification. Your original files never leave your device.</p>
                <input type="text" placeholder="ID Document Hash" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] w-full mb-2" value={docHash} onChange={e => setDocHash(e.target.value)} />
                <input type="text" placeholder="Selfie Hash" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] w-full mb-2" value={selfieHash} onChange={e => setSelfieHash(e.target.value)} />
                <input type="text" placeholder="Proof of Address Hash" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] w-full mb-2" value={poaHash} onChange={e => setPoaHash(e.target.value)} />
                <Magnetic>
                  <button onClick={() => genLayer.submitIdentityVerification('PASSPORT', docHash, selfieHash, poaHash)} className="bg-zinc-800 text-white font-mono hover:bg-[var(--text-lime)] hover:text-black transition-colors w-full py-3 mt-2 border border-zinc-700 hover:border-[var(--text-lime)]">SUBMIT KYC HASHES</button>
                </Magnetic>
              </div>
            </div>
          )}
        </div>

        {/* Apply for Loan Panel */}
        <div className="brutalist-panel p-8">
          <h4 className="text-[var(--text-lime)] text-2xl font-display uppercase tracking-widest mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6" /> NEW LOAN
          </h4>
          <div className="flex flex-col gap-4">
            <textarea placeholder="Describe your loan purpose..." rows={3} className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] resize-none" value={pitch} onChange={e => setPitch(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="GitHub Contribs" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] text-sm" value={githubContribs} onChange={e => setGithubContribs(e.target.value)} />
              <input type="number" placeholder="DAO Votes" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] text-sm" value={daoVotes} onChange={e => setDaoVotes(e.target.value)} />
              <input type="number" placeholder="Wallet Age (Days)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] text-sm" value={walletAgeDays} onChange={e => setWalletAgeDays(e.target.value)} />
            </div>
            <input type="number" placeholder="Collateral (GEN Wei)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)]" value={collat} onChange={e => setCollat(e.target.value)} />
            <Magnetic>
              <button onClick={() => applyForLoan('GLOBAL', pitch, parseInt(githubContribs||'0'), parseInt(daoVotes||'0'), parseInt(walletAgeDays||'0'), parseInt(collat||'0'))} className="btn-primary w-full py-3 mt-2">SUBMIT APPLICATION</button>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Loan History / Counter Offers */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[var(--text-main)] text-2xl font-display uppercase tracking-widest mt-4">ACTIVE LOANS & OFFERS</h4>
        {loans.length === 0 && <p className="text-zinc-500 font-mono text-sm">No active loans found.</p>}
        {loans.map((loan, idx) => (
          <div key={idx} className="brutalist-panel p-6 border-l-4 border-l-[var(--text-lime)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-xl">{loan.app_id}</span>
              <span className={`px-3 py-1 text-xs font-bold uppercase ${loan.status === 'APPROVED' ? 'bg-[var(--text-lime)] text-black' : loan.status === 'COUNTER_OFFER' ? 'bg-orange-500 text-black' : loan.status === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                {loan.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="flex flex-col"><span className="text-xs text-zinc-500 uppercase">Collateral</span><span className="font-mono">{loan.collateral} Wei</span></div>
              <div className="flex flex-col"><span className="text-xs text-zinc-500 uppercase">Debt</span><span className="font-mono text-red-400">{loan.debt} Wei</span></div>
            </div>

            {loan.ai_notes && (
              <div className="mt-4 p-4 bg-black/50 border border-zinc-800 text-zinc-300 italic text-sm border-l-4 border-l-orange-500 flex flex-col gap-3">
                <div>
                  <span className="block font-bold text-orange-500 not-italic uppercase text-xs mb-1">AI Underwriter Notes:</span>
                  {loan.ai_notes}
                </div>
                {loan.confidence !== undefined && (
                  <div>
                    <span className="font-bold text-[var(--text-lime)] not-italic uppercase text-xs">Confidence Score: </span>
                    <span className="font-mono text-white not-italic bg-[var(--text-lime)]/20 px-2 py-0.5 rounded">{loan.confidence}%</span>
                  </div>
                )}
                {loan.positive_factors && loan.positive_factors.length > 0 && (
                  <div>
                    <span className="block font-bold text-[var(--text-lime)] not-italic uppercase text-xs mb-1">Positive Factors:</span>
                    <ul className="list-disc pl-4 marker:text-[var(--text-lime)] text-xs not-italic text-zinc-400">
                      {loan.positive_factors.map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}
                {loan.risk_factors && loan.risk_factors.length > 0 && (
                  <div>
                    <span className="block font-bold text-red-500 not-italic uppercase text-xs mb-1">Risk Factors:</span>
                    <ul className="list-disc pl-4 marker:text-red-500 text-xs not-italic text-zinc-400">
                      {loan.risk_factors.map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 mt-4">
              {loan.status === 'PENDING' && (
                <button onClick={() => evaluateLoan(loan.app_id)} className="btn-outline py-2 px-4 text-sm" disabled={isEvaluating}>
                  {isEvaluating ? 'EVALUATING...' : 'TRIGGER AI EVALUATION'}
                </button>
              )}
              {loan.status === 'COUNTER_OFFER' && (
                <button onClick={() => acceptConditionalOffer(loan.app_id)} className="btn-primary bg-orange-500 text-black py-2 px-4 text-sm">
                  ACCEPT OFFER
                </button>
              )}
              {loan.status === 'APPROVED' && loan.debt !== '0' && (
                <div className="flex flex-col gap-2 w-full">
                    <button onClick={() => genLayer.repayLoan(loan.app_id, parseInt(loan.debt))} className="btn-outline border-[var(--text-lime)] text-[var(--text-lime)] py-2 px-4 text-sm w-full">
                    REPAY LOAN
                    </button>
                    <p className="text-[10px] text-zinc-500 font-mono text-center">Repayment behavior dynamically updates your AI Trust Score.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
