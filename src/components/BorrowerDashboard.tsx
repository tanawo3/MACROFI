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
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [occupation, setOccupation] = useState('');
  const [pitch, setPitch] = useState('');
  const [githubContribs, setGithubContribs] = useState('');
  const [daoVotes, setDaoVotes] = useState('');
  const [walletAgeDays, setWalletAgeDays] = useState('');
  const [collat, setCollat] = useState('');
  const [loanType, setLoanType] = useState('PERSONAL');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
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
          
          {profile && Object.keys(profile).length > 1 && (profile.is_verified === true || profile.kyc_status === 'VERIFIED') ? (
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
              <div className="flex flex-col gap-1 mt-2 mb-2">
                <span className="text-sm font-semibold text-white">{profile.full_name || 'Anonymous'}</span>
                <span className="text-xs text-zinc-400">{profile.occupation || 'No Occupation'} • {profile.country || 'Unknown Country'}</span>
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
              <input type="text" placeholder="Full Name" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)]" value={fullName} onChange={e => setFullName(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Country" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)]" value={country} onChange={e => setCountry(e.target.value)} />
                <input type="text" placeholder="Occupation" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)]" value={occupation} onChange={e => setOccupation(e.target.value)} />
              </div>
              <input type="text" placeholder="GitHub Username" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)]" value={github} onChange={e => setGithub(e.target.value)} />
              <input type="text" placeholder="Twitter Username" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)]" value={twitter} onChange={e => setTwitter(e.target.value)} />
              <Magnetic>
                <button onClick={async () => { await genLayer.linkSocials(fullName, country, occupation, github, twitter); await genLayer.fetchProtocolState(); }} className="btn-outline w-full py-3 mt-2">LINK ACCOUNTS</button>
              </Magnetic>
            </div>
          )}
          
          {/* ZERO-KNOWLEDGE KYC — Always visible */}
          <div className="border-t border-zinc-800 my-4 pt-4">
            <h5 className="text-[var(--text-lime)] text-lg font-display uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> ZERO-KNOWLEDGE KYC
            </h5>
            <p className="text-xs text-zinc-400 mb-4">Submit hashes of your identity documents for AI verification. Your original files never leave your device. Boosts Trust Score by +2000.</p>
            <input type="text" placeholder="ID Document Hash" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] w-full mb-2" value={docHash} onChange={e => setDocHash(e.target.value)} />
            <input type="text" placeholder="Selfie Hash" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] w-full mb-2" value={selfieHash} onChange={e => setSelfieHash(e.target.value)} />
            <input type="text" placeholder="Proof of Address Hash" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] w-full mb-2" value={poaHash} onChange={e => setPoaHash(e.target.value)} />
            <Magnetic>
              <button onClick={() => genLayer.submitIdentityVerification('PASSPORT', docHash, selfieHash, poaHash)} className="bg-zinc-800 text-white font-mono hover:bg-[var(--text-lime)] hover:text-black transition-colors w-full py-3 mt-2 border border-zinc-700 hover:border-[var(--text-lime)]">SUBMIT KYC HASHES</button>
            </Magnetic>
          </div>
        </div>

        {/* Apply for Loan Panel */}
        <div className="brutalist-panel p-8">
          <h4 className="text-[var(--text-lime)] text-2xl font-display uppercase tracking-widest mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6" /> NEW LOAN
          </h4>
          <div className="flex flex-col gap-4">
            {/* Loan Type Selector */}
            <select value={loanType} onChange={e => setLoanType(e.target.value)} className="bg-black border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] text-white font-mono uppercase">
              <option value="PERSONAL">Personal Loan</option>
              <option value="BUSINESS">Business Loan</option>
              <option value="CREATOR">Creator Loan</option>
              <option value="FREELANCER">Freelancer Loan</option>
              <option value="DAO_CONTRIBUTOR">DAO Contributor Loan</option>
            </select>
            <textarea placeholder="Describe your loan purpose..." rows={3} className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] resize-none" value={pitch} onChange={e => setPitch(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Requested Amount (GEN)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] text-sm" value={requestedAmount} onChange={e => setRequestedAmount(e.target.value)} />
              <input type="number" placeholder="Duration (Days)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] text-sm" value={durationDays} onChange={e => setDurationDays(e.target.value)} />
            </div>
            <input type="number" placeholder="Monthly Income (USD)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)]" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="GitHub Contribs" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] text-sm" value={githubContribs} onChange={e => setGithubContribs(e.target.value)} />
              <input type="number" placeholder="DAO Votes" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] text-sm" value={daoVotes} onChange={e => setDaoVotes(e.target.value)} />
              <input type="number" placeholder="Wallet Age (Days)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)] text-sm" value={walletAgeDays} onChange={e => setWalletAgeDays(e.target.value)} />
            </div>
            <input type="number" placeholder="Collateral (GEN Wei)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-[var(--text-lime)]" value={collat} onChange={e => setCollat(e.target.value)} />
            <Magnetic>
              <button onClick={() => applyForLoan('GLOBAL', pitch, loanType, parseInt(requestedAmount||'0'), parseInt(durationDays||'30'), parseInt(monthlyIncome||'0'), parseInt(githubContribs||'0'), parseInt(daoVotes||'0'), parseInt(walletAgeDays||'0'), parseInt(collat||'0'))} className="btn-primary w-full py-3 mt-2">SUBMIT APPLICATION</button>
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
               {/* existing loan UI */}
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

      {/* BORROWER DEFENSE CENTER */}
      <div className="brutalist-panel p-8 border border-blue-900/50 relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        <h4 className="text-blue-500 text-2xl font-display uppercase tracking-widest mb-6">
          Defense Terminal (Appeals)
        </h4>
        <p className="text-zinc-400 font-mono text-sm mb-6 max-w-2xl">
          Has a Lender raised an unfair dispute against you? Submit your defense reason and evidence here. The AI Oracle will cross-examine both claims based on the Protocol Constitution.
        </p>

        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Dispute ID (e.g. DISPUTE-1)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-blue-500" value={(window as any).defenseId || ''} onChange={e => (window as any).defenseId = e.target.value} />
          <input type="text" placeholder="Your Defense (e.g. I did not rug, the market crashed)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-blue-500" value={(window as any).defenseReason || ''} onChange={e => (window as any).defenseReason = e.target.value} />
          <input type="text" placeholder="Evidence URL (GitHub/Twitter proof)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-blue-500" value={(window as any).defenseUrl || ''} onChange={e => (window as any).defenseUrl = e.target.value} />
          <Magnetic>
            <button onClick={() => genLayer.submitDefense((window as any).defenseId, (window as any).defenseReason, (window as any).defenseUrl)} className="bg-blue-900/30 text-blue-400 border border-blue-900 hover:bg-blue-500 hover:text-black transition-colors w-full py-3 mt-2 font-mono uppercase tracking-widest">SUBMIT DEFENSE</button>
          </Magnetic>
        </div>
      </div>

      {/* AI VOUCHING / CREDIT DELEGATION CENTER */}
      <div className="brutalist-panel p-8 border border-purple-900/50 relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-900/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        <h4 className="text-purple-500 text-2xl font-display uppercase tracking-widest mb-6 flex items-center gap-3">
          <i className="fa-solid fa-handshake"></i> AI Vouching (Social Credit)
        </h4>
        <p className="text-zinc-400 font-mono text-sm mb-6 max-w-2xl">
          Delegate your Web3 Trust Score to a junior borrower. The AI Underwriter will evaluate your evidence. <br/>
          <strong className="text-red-400">WARNING:</strong> If the borrower defaults, your Trust Score will be slashed!
        </p>

        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Borrower Address (0x...)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-purple-500 font-mono" value={(window as any).vouchBorrower || ''} onChange={e => (window as any).vouchBorrower = e.target.value} />
          <textarea placeholder="Evidence (e.g. We built an AI protocol together, here is the repo URL...)" className="bg-transparent border border-zinc-700 p-3 outline-none focus:border-purple-500 min-h-[100px]" value={(window as any).vouchEvidence || ''} onChange={e => (window as any).vouchEvidence = e.target.value} />
          
          <Magnetic>
            <button onClick={() => genLayer.aiVouch((window as any).vouchBorrower, (window as any).vouchEvidence)} className="bg-purple-900/30 text-purple-400 border border-purple-900 hover:bg-purple-500 hover:text-black transition-colors w-full py-3 mt-2 font-mono uppercase tracking-widest">SUBMIT AI VOUCH</button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
};

export default BorrowerDashboard;
