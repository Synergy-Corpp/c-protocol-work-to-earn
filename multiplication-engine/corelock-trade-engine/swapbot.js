require('dotenv').config();
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Jupiter } = require('@jup-ag/core');
const bs58 = require('bs58');

// Load environment variables
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_MINT = process.env.TOKEN_MINT;

// Solana setup
const connection = new Connection(https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}, 'confirmed');
const wallet = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));

async function runSwap(amountIn) {
  const jupiter = await Jupiter.load({
    connection,
    cluster: 'mainnet-beta',
    user: wallet,
  });

  const inputMint = new PublicKey("So11111111111111111111111111111111111111112");
  const outputMint = new PublicKey(TOKEN_MINT);

  const routes = await jupiter.computeRoutes({
    inputMint,
    outputMint,
    amount: amountIn,
    slippage: 1,
    forceFetch: true,
  });

  if (!routes || routes.routesInfos.length === 0) {
    console.log("❌ No swap route found.");
    return;
  }

  const { execute } = await jupiter.exchange({ routeInfo: routes.routesInfos[0] });
  const result = await execute();
  console.log("✅ Swap successful. Tx ID:", result?.txid);
}

runSwap(10000000); // 0.01 SOL in lamports
