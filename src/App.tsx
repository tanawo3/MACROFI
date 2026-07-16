import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Menu, RefreshCw } from 'lucide-react';
import { useGenLayer } from './hooks/useGenLayer';
import { Dashboard } from './components/Dashboard';
import { MarqueeStrip } from './components/MarqueeStrip';
import { Preloader } from './components/Preloader';
import Lenis from '@studio-freight/lenis';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Magnetic } from './components/Magnetic';
import { NavigationMenu } from './components/NavigationMenu';
import { NetworkView } from './components/NetworkView';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [isPreloaded, setIsPreloaded] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'network' | 'docs'>('dashboard');
  const { playHoverSound, playClickSound } = useSoundEffects();
  const genLayer = useGenLayer();
  const {
    address,
    isConnected,
    connect,
    disconnect,
    contractAddress,
    error
  } = genLayer;

  useEffect(() => {
    if (contractAddress && contractAddress !== "") {
      genLayer.fetchProtocolState();
    }
  }, [contractAddress, genLayer.fetchProtocolState]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="transition-colors duration-1000">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#18181b', color: '#fff', border: '1px solid #27272a', fontFamily: 'monospace' } }} />
      <Preloader onComplete={() => setIsPreloaded(true)} />
      <NavigationMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={(view) => {
          if (view === 'docs') {
            window.open('https://docs.genlayer.com', '_blank');
          } else {
            setCurrentView(view);
          }
        }}
      />
      <div className="noise-bg" />
      <div className="scanlines" />
      
      <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans flex flex-col selection:bg-[var(--text-lime)] selection:text-[var(--bg-primary)] ${isPreloaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
        
        {/* Navigation - Brutalist / Lando Style */}
        <header className="w-full border-b border-[var(--border-color)] px-6 py-3 flex justify-between items-center bg-[var(--bg-primary)] z-50 sticky top-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                playClickSound();
                setIsMenuOpen(true);
              }}
              onMouseEnter={playHoverSound}
              className="hover:text-[var(--text-lime)] transition-colors flex items-center gap-2"
              data-cursor-hover
              data-cursor-text="MENU"
            >
              <Menu className="w-6 h-6" />
              <span className="hidden md:inline font-mono uppercase tracking-widest text-sm">MENU</span>
            </button>
            <h1 className="text-3xl md:text-4xl text-impact m-0 tracking-widest text-[var(--text-main)]">
              MACRO<span className="text-[var(--text-lime)]">FI</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Magnetic>
              <button
                onClick={() => {
                  playClickSound();
                  isConnected ? disconnect() : connect();
                }}
                onMouseEnter={playHoverSound}
                data-cursor-hover
                data-cursor-text={isConnected ? "DISCONNECT" : "CONNECT"}
                className="btn-primary py-2 px-4 text-sm md:text-base font-bold"
              >
                <span>{isConnected ? `${address.slice(0,6)}...${address.slice(-4)}` : 'CONNECT WALLET'}</span>
              </button>
            </Magnetic>
            {isConnected && (
              <Magnetic>
                <button
                  disabled={genLayer.isDeploying}
                  onClick={async () => {
                    playClickSound();
                    localStorage.removeItem('MACROFI_CONTRACT_ADDRESS_V2');
                    genLayer.setContractAddress('');
                    await genLayer.deployContract();
                  }}
                  onMouseEnter={playHoverSound}
                  data-cursor-hover
                  data-cursor-text={genLayer.isDeploying ? "DEPLOYING" : "DEPLOY"}
                  className="btn-primary py-2 px-4 text-sm md:text-base font-bold bg-[var(--text-lime)] text-black border-2 border-[var(--text-lime)] hover:bg-transparent hover:text-[var(--text-lime)] disabled:opacity-50"
                  title="Deploy Contract"
                >
                  <span>{genLayer.isDeploying ? 'DEPLOYING...' : 'DEPLOY CONTRACT'}</span>
                </button>
              </Magnetic>
            )}
          </div>
        </header>

        <MarqueeStrip />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative z-0 w-full">
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full bg-red-600 text-white p-4 border-b border-black flex justify-between items-center"
              >
                <div className="flex items-center gap-3 max-w-7xl mx-auto w-full px-6">
                  <ShieldAlert className="w-6 h-6 shrink-0" />
                  <p className="font-mono text-sm uppercase font-bold">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!contractAddress || contractAddress === '' ? (
              <motion.div 
                key="deploy-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 w-full flex items-center justify-center p-6 min-h-[60vh]"
              >
                <div className="max-w-3xl w-full border border-white/10 bg-[#050505] p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--text-lime)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[var(--text-lime)] relative z-10">
                    SYSTEM OFFLINE
                  </h2>
                  <p className="text-white/60 font-mono text-sm max-w-lg mx-auto relative z-10">
                    A GenVM Intelligent Contract must be deployed to initialize the MACROFI protocol state. Reviewers: please deploy a new instance to begin.
                  </p>
                  <Magnetic>
                    <button 
                      onClick={async () => {
                        playClickSound();
                        await genLayer.deployContract();
                      }}
                      onMouseEnter={playHoverSound}
                      disabled={genLayer.isDeploying}
                      className="btn-primary mt-4 py-4 px-10 text-lg md:text-xl font-bold bg-[var(--text-lime)] text-black border-2 border-[var(--text-lime)] hover:bg-transparent hover:text-[var(--text-lime)] disabled:opacity-50 transition-all uppercase relative z-10"
                    >
                      {genLayer.isDeploying ? 'DEPLOYING TO GENLAYER...' : 'INITIALIZE PROTOCOL'}
                    </button>
                  </Magnetic>
                </div>
              </motion.div>
            ) : currentView === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 w-full"
              >
                <Dashboard genLayer={genLayer} />
              </motion.div>
            ) : (
              <motion.div 
                key="network"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 w-full"
              >
                <NetworkView genLayer={genLayer} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
