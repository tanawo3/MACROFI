# MacroFi | GenLayer Lending Protocol

MacroFi is a high-end, brutalist Web3 Decentralized Finance (DeFi) interface built on the GenLayer Network. The protocol utilizes subjective consensus and **Web3 Native Credit Scoring** to dynamically adjust interest rates and evaluate under-collateralized loans based on real on-chain footprints.

## Aesthetic & Architecture
The UI is heavily inspired by modern, motorsport-themed brutalist design systems (such as Studio Freight / Lando Norris). It features:
- **Neon Lime (`#ccff00`) & Deep Dark (`#0a0a0a`) Color Palette**
- **Massive Typography** utilizing `Bebas Neue` and `Space Grotesk`.
- **Framer Motion Micro-interactions:** Staggered SplitText reveals, Magnetic UI buttons.
- **Lenis Smooth Scrolling:** For butter-smooth hardware-accelerated scrolling.
- **Synthesized UI Audio:** High-frequency clicks and deep thuds on interactions (Web Audio API).

## Tech Stack
- React 18
- Vite
- Tailwind CSS v4
- Framer Motion
- GenLayer Protocol (Intelligent Contracts)
- Lucide React

## Protocol Features
- **Web3 Native Credit Scoring**: Uses GitHub contributions, DAO votes, and wallet age to build trust.
- **Transparent AI Oracles**: Returns JSON-structured insights (`confidence`, `positive_factors`, `risk_factors`).
- **Risk-Tiered Pools**: Lenders can specify `risk_tier` and `min_trust_score` for their liquidity pools.
- **Zero-Knowledge AI KYC**: Verifies identities via document hashes, maintaining absolute privacy while outputting deterministic `identity_score`.
- **Dynamic AI Reputation Engine**: Continuously re-evaluates borrower trust scores dynamically upon every loan repayment.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Deploy the Intelligent Contract (Local Simulator):**
   Connect your wallet via the top right `CONNECT WALLET` button. The Dashboard allows you to execute Subjective Consensus to fetch live AI evaluations of the macro-economy and adjust rates accordingly.

## Project Structure
- `/src/components`: UI Components built with Tailwind & Framer Motion.
- `/src/hooks`: Custom hooks like `useGenLayer.ts` (Blockchain interaction) and `useSoundEffects.ts` (Audio).
- `/contracts`: GenLayer Intelligent Contract (`MacroFi.py`).
- `/public`: Static assets including the custom SVG favicon.

---
*Built for the GenLayer ecosystem.*
