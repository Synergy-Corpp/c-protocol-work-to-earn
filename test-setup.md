# Testing the Coin Flip Game on Devnet

## Quick Test Setup

### 1. Install Dependencies
```bash
# Smart contract
cd /Users/leonmcdanels/Desktop/coin-flip-game
npm install -g @coral-xyz/anchor-cli
anchor build

# Frontend
cd frontend
npm install
```

### 2. Get Devnet SOL
- Install Phantom wallet browser extension
- Switch to Devnet in Phantom settings
- Get free devnet SOL from: https://faucet.solana.com/

### 3. Deploy Contract
```bash
# Generate new keypair for program
solana-keygen new -o program-keypair.json

# Update Anchor.toml with new program ID
anchor build
anchor deploy --provider.cluster devnet
```

### 4. Run Frontend
```bash
cd frontend
npm run dev
```

### 5. Test the Game
1. Open http://localhost:3000
2. Connect your Phantom wallet (make sure it's on devnet)
3. Place a small bet (like 0.01 SOL)
4. Choose heads or tails
5. Click "Flip Coin!"

## Current Status
- ✅ Smart contract ready
- ✅ Frontend UI complete  
- ⚠️ Needs deployment to get program ID
- ⚠️ Needs $GOR token integration (currently uses SOL for testing)

## Test on Devnet Now
The easiest way is to test with devnet SOL first, then adapt for $GOR tokens later.