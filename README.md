# $GOR Coin Flip Game

A decentralized coin flip game built for the Gorbagana chain (Solana fork).

## Features

- **Fair Randomness**: Uses Solana's slot hash for pseudo-random number generation
- **House Edge**: Configurable house edge (default 2%)
- **Token Integration**: Works with $GOR tokens
- **Event Logging**: All game results are logged on-chain
- **Responsive UI**: Modern React/Next.js frontend with wallet integration

## Smart Contract

The smart contract is built with the Anchor framework and includes:

- `initialize_game`: Sets up the game parameters
- `place_bet`: Allows players to place bets and play
- `fund_house`: Allows funding the house vault

### Game Mechanics

1. Players choose heads (true) or tails (false)
2. They place a bet within the min/max limits
3. A pseudo-random number is generated using the slot hash
4. Winners receive 2x their bet minus house edge
5. All results are emitted as events

## Setup

### Prerequisites

- Rust and Cargo
- Solana CLI
- Anchor CLI
- Node.js and npm/yarn

### Smart Contract Deployment

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Update program ID in lib.rs and Anchor.toml
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Configuration

### For Gorbagana Chain

1. Update the RPC endpoint in `WalletProvider.tsx`
2. Replace the program ID with your deployed program ID
3. Update the token mint address for $GOR
4. Configure network settings in Anchor.toml

### Game Parameters

- **House Edge**: 200 basis points (2%)
- **Min Bet**: 0.001 SOL equivalent
- **Max Bet**: 1 SOL equivalent

## Testing

```bash
# Run smart contract tests
anchor test

# Run frontend in development
cd frontend && npm run dev
```

## Security Considerations

- The randomness uses slot hash which is deterministic but unpredictable
- For production, consider using Chainlink VRF or similar oracle
- House vault should be managed by a multisig wallet
- Regular security audits recommended

## License

MIT License