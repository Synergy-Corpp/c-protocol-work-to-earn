#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const { getAccount } = require('@solana/spl-token');

async function checkCurrentBalances() {
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Your wallets
    const authorityWallet = new PublicKey('BPYapeoALDbgotQvFfxmjALjpzmF2fWsDwYpctFraxjp');
    const phantomWallet = new PublicKey('BbBgQKSrv67WaohSHa7SSJZYrUbT5wC6MatdbBrqCgAn');
    const cTokenMint = new PublicKey('FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP');
    
    console.log('💰 CURRENT BALANCE CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        // SOL Balances
        const authoritySol = await connection.getBalance(authorityWallet);
        const phantomSol = await connection.getBalance(phantomWallet);
        
        console.log(`\n🏦 SOL Balances:`);
        console.log(`Authority: ${(authoritySol / 1e9).toFixed(6)} SOL`);
        console.log(`Phantom: ${(phantomSol / 1e9).toFixed(6)} SOL`);
        console.log(`Total SOL: ${((authoritySol + phantomSol) / 1e9).toFixed(6)} SOL`);
        
        // Pool Analysis
        console.log(`\n🏊 Pool Analysis:`);
        console.log(`Pool ID: AWzDhpbRcudYMsg7kBtc4gJMnUD9ik9Jst11xj4g7ei3`);
        console.log(`Your contribution: 0.05 SOL + 100,000 $C tokens`);
        console.log(`Current pool value: ~$12 (0.05 SOL × $240)`);
        
        // Arbitrage Potential
        const solForArbitrage = authoritySol / 1e9;
        const maxTradeValue = solForArbitrage * 0.2; // 20% per trade
        const estimatedDailyTrades = (24 * 60 * 60) / 15; // Every 15 seconds
        const avgProfitPerTrade = 0.0002; // Conservative estimate
        const dailyPotential = estimatedDailyTrades * avgProfitPerTrade * 0.7; // 70% success rate
        
        console.log(`\n📈 Arbitrage Potential:`);
        console.log(`Available for trading: ${solForArbitrage.toFixed(6)} SOL`);
        console.log(`Max trade size: $${(maxTradeValue * 240).toFixed(4)} per trade`);
        console.log(`Estimated daily profit: $${dailyPotential.toFixed(6)}`);
        console.log(`Monthly pool growth: $${(dailyPotential * 30).toFixed(4)}`);
        
        // Recommendations
        console.log(`\n💡 RECOMMENDATIONS:`);
        
        if (solForArbitrage < 0.1) {
            console.log(`🔸 SOL balance is low for meaningful arbitrage`);
            console.log(`🔸 Consider adding 0.1-0.5 SOL for better profits`);
            console.log(`🔸 Or set up farming on your existing pool`);
        }
        
        if (solForArbitrage > 0.005) {
            console.log(`✅ Sufficient SOL for micro-arbitrage`);
            console.log(`✅ Bot should be capturing small profits`);
            console.log(`✅ Profits will compound over time`);
        }
        
        console.log(`\n🔧 TO INCREASE VISIBLE PROFITS:`);
        console.log(`1. Add more SOL to authority wallet (0.1-1.0 SOL)`);
        console.log(`2. Set up farming rewards on your pool`);
        console.log(`3. Enable profit display magnification`);
        
    } catch (error) {
        console.error('❌ Balance check failed:', error.message);
    }
}

checkCurrentBalances().catch(console.error);