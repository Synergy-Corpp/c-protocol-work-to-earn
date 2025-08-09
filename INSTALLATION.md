# Installation Guide

## 1. Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## 2. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

## 3. Install Solana CLI
```bash
# Method 1: Using pre-built binaries
curl -sSfL https://release.solana.com/v1.18.4/install | sh
export PATH="/Users/$USER/.local/share/solana/install/active_release/bin:$PATH"

# Method 2: If above fails, use homebrew
brew install solana
```

## 4. Install Anchor
```bash
# Install Anchor version manager
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install latest Anchor
avm install latest
avm use latest
```

## 5. Set up Solana for devnet
```bash
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/id.json
```

## 6. Get devnet SOL
```bash
solana airdrop 2
```

## 7. Deploy the contract
```bash
cd /Users/leonmcdanels/Desktop/coin-flip-game
anchor build
anchor deploy
```

## 8. Run frontend
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000 in your browser!

## Alternative: Use Solana Playground
If installation is complex, you can use Solana Playground online:
1. Go to https://beta.solpg.io/
2. Upload the smart contract code
3. Deploy directly from the browser
4. Test with the web interface