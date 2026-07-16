import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenLayer } from '../hooks/useGenLayer';
import { TrendingUp, TrendingDown, Minus, Activity, Server, Radio, Crosshair, RefreshCcw } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { SplitText } from './SplitText';
import { Magnetic } from './Magnetic';
import { BorrowerDashboard } from './BorrowerDashboard';

export const Dashboard: React.FC<{ 
  genLayer: ReturnType<typeof useGenLayer>
}> = ({ genLayer }) => {
  const { protocolState, isEvaluating, isFetching, adjustRates, fetchProtocolState } = genLayer;
  const { playHoverSound, playClickSound } = useSoundEffects();

  const currentRate = protocolState?.current_base_rate ?? 0.0;
  const logs = protocolState?.logs ?? [];

  return (
    <div className="w-full flex flex-col font-sans">
      
      {/* Top Banner / Hero section for Dashboard */}
      <div className="w-full bg-[var(--color-brand-grey)] py-8 px-6 border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">
          <div>
            <h2 className="text-lg font-mono text-[var(--color-brand-offwhite)] tracking-widest mb-1 opacity-50 uppercase">
              Current Base Rate
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl md:text-8xl leading-none font-bold text-impact text-[var(--text-lime)]">
                {currentRate.toFixed(2)}
              </span>
              <span className="text-3xl text-[var(--text-lime)] font-mono">%</span>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <Magnetic>
              <button 
                onClick={() => {
                  playClickSound();
                  adjustRates();
                }}
                onMouseEnter={playHoverSound}
                disabled={isEvaluating}
                className="btn-primary w-full md:w-auto py-4 px-8 text-lg"
              >
                <span className="flex items-center gap-3">
                  {isEvaluating ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Crosshair className="w-5 h-5" />
                  )}
                  {isEvaluating 
                    ? 'ANALYZING...' 
                    : 'EXECUTE SUBJECTIVE CONSENSUS'}
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex flex-col gap-12">
        {/* Latest Rationale */}
        <AnimatePresence>
          {protocolState?.last_update_rationale && protocolState.update_counter > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="brutalist-panel p-8 md:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Activity className="w-64 h-64 text-[var(--text-lime)]" />
              </div>
              <h4 className="text-[var(--text-lime)] text-3xl font-display uppercase tracking-widest mb-6 relative z-10">
                LATEST INTELLIGENCE REPORT
              </h4>
              <p className="text-xl md:text-2xl font-sans leading-relaxed text-[var(--text-main)] relative z-10 max-w-4xl w-full break-words whitespace-normal text-wrap-pretty">
                {protocolState.last_update_rationale}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ledger View */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b-2 border-[var(--border-color)] pb-4">
            <h3 className="text-5xl font-display text-[var(--text-main)] uppercase tracking-wide">
              <SplitText text="PROTOCOL LEDGER" />
            </h3>
            <button 
              onClick={fetchProtocolState} 
              disabled={isFetching} 
              data-cursor-hover
              data-cursor-text="SYNC"
              className="btn-outline py-2 px-6 flex items-center gap-2"
            >
              <RefreshCcw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>SYNC</span>
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {logs.length === 0 ? (
              <div className="brutalist-panel p-20 flex flex-col items-center justify-center text-[var(--border-color)] border-dashed border-4">
                <Radio className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-display text-3xl tracking-widest opacity-50">NO LOGS FOUND</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="brutalist-panel p-6 flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center hover:bg-[var(--color-brand-grey)]"
                >
                  <div className="flex items-center gap-6 min-w-[200px]">
                    <div className={`p-4 flex items-center justify-center
                      ${log.action === 'INCREASE' ? 'bg-red-500 text-black' : 
                        log.action === 'DECREASE' ? 'bg-[var(--text-lime)] text-black' : 
                        'bg-zinc-800 text-white'}`}
                    >
                      {log.action === 'INCREASE' && <TrendingUp className="w-8 h-8" />}
                      {log.action === 'DECREASE' && <TrendingDown className="w-8 h-8" />}
                      {log.action === 'HOLD' && <Minus className="w-8 h-8" />}
                    </div>
                    <div>
                      <h4 className="font-display text-3xl tracking-wider uppercase">{log.action}</h4>
                      <p className="text-zinc-500 text-sm font-mono mt-1">BLOCK #{log.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-[var(--bg-primary)] p-4 border border-[var(--border-color)]">
                    <div className="flex flex-col items-end">
                      <span className="text-zinc-500 text-xs font-mono tracking-widest">PREV</span>
                      <span className="font-display text-2xl opacity-50">{log.old_rate.toFixed(2)}%</span>
                    </div>
                    <div className="text-[var(--text-lime)]">→</div>
                    <div className="flex flex-col items-start">
                      <span className="text-[var(--text-lime)] text-xs font-mono tracking-widest opacity-50">NEW</span>
                      <span className="text-[var(--text-lime)] font-display text-3xl">{log.new_rate.toFixed(2)}%</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <span className="text-zinc-500 text-xs font-mono tracking-widest block mb-2 uppercase">VALIDATOR CONSENSUS</span>
                    <p className="text-[var(--text-main)] opacity-80 text-base leading-relaxed">{log.rationale}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Borrower Identity & Loan Section */}
        <BorrowerDashboard genLayer={genLayer} />
      </div>
    </div>
  );
};
