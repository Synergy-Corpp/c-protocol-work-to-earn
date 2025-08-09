swap_bot_code = """
// swap-bot.js

require('dotenv').config();
const { Connection, PublicKey, Keypair, sendAndConfirmTransaction } = require('@solana/web3.js');
const { Jupiter, RouteInfo } = require('@jup-ag/core');
const bs58 = require('bs58');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

// ENV Variables
const JUPITER_RPC = 'https://mainnet.helius-rpc.com/?api-key=' + process.env.HELIUS_API_KEY;
const connection = new Connection(JUPITER_RPC);
const wallet = Keypair.fromSecretKey(bs58.decode(process.env.SOL_PRIVATE_KEY));
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// MEV Threshold Settings
const PROFIT_THRESHOLD = 0.0005; // adjust for slippage & gas
const HIGH_VALUE_WATCH = 20; // in SOL

// Utils
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Alert handler
async function sendTelegramMessage(msg) {
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, msg);
  } catch (e) {
    console.error('Telegram error:', e);
  }
}

// Start monitoring
(async () => {
  const jupiter = await Jupiter.load({ connection, cluster: 'mainnet-beta', user: wallet });

  console.log('[CoreLock] MEV SwapBot started...');
  await sendTelegramMessage('🚀 CoreLock SwapBot Online\nMonitoring MEV opportunities...');

  while (true) {
    try {
      const routes = await jupiter.computeRoutes({
        inputMint: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
        outputMint: new PublicKey(process.env.COIN_MINT), // Your token
        amount: 1e9, // 1 SOL in lamports
        slippage: 1,
      });

      if (routes.routesInfos.length === 0) {
        await sleep(1000);
        continue;
      }

      for (const route of routes.routesInfos) {
        const bestProfit = route.outAmount / 1e9; // Convert to SOL
        if (bestProfit > PROFIT_THRESHOLD) {
          const { execute } = await jupiter.exchange({ routeInfo: route });
          const txid = await execute();
          console.log('[CoreLock] Executed profitable swap: ', txid);

          await sendTelegramMessage(`💸 Profitable Swap Executed
🔁 Route: ${route.marketInfos[0].label}
💰 Output: ${bestProfit.toFixed(4)} SOL
🔗 https://solscan.io/tx/${txid}`);
        }
      }
    } catch (err) {
      console.error('[CoreLock] Error:', err);
    }

    await sleep(4000);
  }
})();
"""

import textwrap
from IPython.display import display, Markdown

# Split the code into manageable parts (if very long)
code_chunks = textwrap.wrap(swap_bot_code, width=4000)

for i, chunk in enumerate(code_chunks):
    display(Markdown(f"javascript\n{chunk}\n"))
