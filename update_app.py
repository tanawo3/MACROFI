import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

replacement = '''          <AnimatePresence mode="wait">
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
            ) : currentView === 'dashboard' ? ('''

content = content.replace(
'''          <AnimatePresence mode="wait">
            {currentView === 'dashboard' ? (''', replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print('Updated MACROFI')
