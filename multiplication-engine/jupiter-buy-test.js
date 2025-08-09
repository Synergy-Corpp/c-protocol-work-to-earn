#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');

async function testJupiterAvailability() {
    console.log('🔍 CHECKING JUPITER AVAILABILITY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const tokenMint = 'FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP';
    
    console.log('\n🪙 Your Token Details:');
    console.log(`Token Address: ${tokenMint}`);
    console.log(`Pool ID: AWzDhpbRcudYMsg7kBtc4gJMnUD9ik9Jst11xj4g7ei3`);
    
    console.log('\n🔗 Direct Links to Try:');
    console.log('\n1. JUPITER DIRECT SWAP:');
    console.log(`https://jup.ag/swap/SOL-${tokenMint}`);
    
    console.log('\n2. RAYDIUM DIRECT POOL:');
    console.log(`https://raydium.io/liquidity-pools/?tab=add&pool_id=AWzDhpbRcudYMsg7kBtc4gJMnUD9ik9Jst11xj4g7ei3`);
    
    console.log('\n3. RAYDIUM POOL SEARCH:');
    console.log(`https://raydium.io/pools/`);
    console.log(`Search for: ${tokenMint}`);
    
    console.log('\n💡 WHICH APPROACH TO USE:');
    console.log('\n🔄 FOR BUYING YOUR TOKEN (Price Impact):');
    console.log('• Use Jupiter swap: SOL → Your Token');
    console.log('• Creates buy pressure');
    console.log('• Increases token price immediately');
    console.log('• Uses existing pool liquidity');
    console.log('• Example: Swap 0.1 SOL for tokens');
    
    console.log('\n🏊 FOR ADDING LIQUIDITY (Pool Growth):');
    console.log('• Use Raydium add liquidity');
    console.log('• Adds both SOL + tokens to pool');
    console.log('• Increases pool depth');
    console.log('• Better long-term stability');
    console.log('• Example: Add 0.1 SOL + 200K tokens');
    
    console.log('\n🎯 RECOMMENDATION FOR $50:');
    console.log('Option A: Buy tokens on Jupiter');
    console.log('  • Swap 0.21 SOL → tokens');
    console.log('  • Immediate price pump');
    console.log('  • Uses existing $24 pool');
    console.log('');
    console.log('Option B: Add liquidity on Raydium');
    console.log('  • Add 0.21 SOL + 420K tokens');
    console.log('  • Triples pool size to $74');
    console.log('  • Better for long-term trading');
    
    console.log('\n⚡ HYBRID APPROACH:');
    console.log('1. First: Buy some tokens on Jupiter (creates price pump)');
    console.log('2. Then: Add liquidity with the rest (stabilizes price)');
    console.log('3. Result: Price increase + better liquidity');
    
    console.log('\n🔍 TRY THESE STEPS:');
    console.log('1. Go to jup.ag');
    console.log('2. Connect Phantom wallet');
    console.log('3. Set: SOL → paste your token address');
    console.log('4. If it finds your token = you can buy');
    console.log('5. If not found = pool too small for Jupiter');
}

testJupiterAvailability();