import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { ShieldAlert, Activity, Layers, Zap, Triangle } from 'lucide-react';
import './index.css';

const client = createClient({
  chain: studionet,
});

const CONTRACT_ADDRESS = '0x202Ba5E61E305a5510b90d7e53c5fB5a7e5d9E88';

function App() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  useEffect(() => {
    async function fetchLoans() {
      try {
        setLoading(true);
        const res = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: 'get_all_loans',
          args: []
        });
        const parsed = JSON.parse(res as string);
        setLoans(parsed);
      } catch (err) {
        console.error("Error fetching loans:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLoans();
  }, []);

  return (
    <div className="app-container">
      {/* Magnetic Follower Cursor */}
      <motion.div
        className="magnetic-cursor"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      />
      
      {/* Ambient Background */}
      <div className="ambient-bg">
        <div className="ambient-blob accent"></div>
      </div>

      <nav className="navbar glass-panel">
        <div className="logo">
          <Triangle size={24} className="text-accent" />
          <h1>MACROFI <span className="text-accent">CORE</span></h1>
        </div>
        <div className="nav-links">
          <button className="nav-link"><Activity size={18}/> Dashboard</button>
          <button className="nav-link"><Layers size={18}/> Pools</button>
          <button className="nav-link"><ShieldAlert size={18}/> Governance</button>
        </div>
        <button className="glow-btn connect-btn">Connect Wallet</button>
      </nav>

      <main className="main-content">
        <section className="hero">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="hero-title">Constitutional AI <br/>Lending Protocol</h2>
            <p className="hero-subtitle">Decentralized underwriting powered by GenVM. Escrow arbitration, reputation slashing, and macro-economic circuit breakers.</p>
          </motion.div>
        </section>

        <section className="dashboard-grid">
          {/* Active Loans Panel */}
          <div className="glass-panel stat-card">
            <div className="card-header">
              <Zap className="text-accent" />
              <h3>Active Loans</h3>
            </div>
            {loading ? (
              <div className="loader"></div>
            ) : (
              <div className="loan-list">
                {loans.length === 0 ? (
                  <p className="empty-state">No active loans found. Awaiting underwriters.</p>
                ) : (
                  loans.map((loan: any, i) => (
                    <div key={i} className="loan-item">
                      <div className="loan-id">{loan.app_id}</div>
                      <div className="loan-status" data-status={loan.status}>{loan.status}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Network Health */}
          <div className="glass-panel stat-card">
             <div className="card-header">
              <Activity className="text-accent" />
              <h3>System Status</h3>
            </div>
            <div className="status-metrics">
              <div className="metric">
                <span className="label">Circuit Breaker</span>
                <span className="value text-accent">ACTIVE</span>
              </div>
              <div className="metric">
                <span className="label">Oracle Sync</span>
                <span className="value">SYNCED</span>
              </div>
              <div className="metric">
                <span className="label">Trust Index</span>
                <span className="value">99.8%</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .app-container {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          padding: 24px;
        }

        .magnetic-cursor {
          position: fixed;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          border: 1px solid var(--accent);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          mix-blend-mode: difference;
        }

        .ambient-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: -1;
        }

        .ambient-blob {
          position: absolute;
          width: 60vw;
          height: 60vw;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.05;
          top: -20vh;
          right: -10vw;
        }

        .ambient-blob.accent {
          background: var(--accent);
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          margin-bottom: 64px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo h1 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .nav-links {
          display: flex;
          gap: 32px;
        }

        .nav-link {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: var(--text);
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero {
          margin-bottom: 80px;
          text-align: center;
        }

        .hero-title {
          font-size: 4.5rem;
          line-height: 1.1;
          font-weight: 800;
          margin-bottom: 24px;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.6);
          max-width: 600px;
          margin: 0 auto;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .stat-card {
          padding: 32px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .empty-state {
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
        }

        .status-metrics {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 12px;
        }

        .metric .label {
          color: rgba(255,255,255,0.6);
        }

        .metric .value {
          font-weight: 600;
        }

        .loader {
          width: 24px;
          height: 24px;
          border: 2px solid var(--glass-border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
