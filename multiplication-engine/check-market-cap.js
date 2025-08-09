#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const { getMint } = require('@solana/spl-token');

async function checkMarketCap() {
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    console.log('📊 MARKET CAP & BALANCE CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        // Your token and wallets
        const cTokenMint = new PublicKey('FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP');
        const authorityWallet = new PublicKey('BPYapeoALDbgotQvFfxmjALjpzmF2fWsDwYpctFraxjp');
        const phantomWallet = new PublicKey('BbBgQKSrv67WaohSHa7SSJZYrUbT5wC6MatdbBrqCgAn');
        const poolId = 'AWzDhpbRcudYMsg7kBtc4gJMnUD9ik9Jst11xj4g7ei3';
        
        // Check token supply
        console.log('\n🪙 TOKEN SUPPLY ANALYSIS:');
        const mintInfo = await getMint(connection, cTokenMint);
        const totalSupply = Number(mintInfo.supply) / (10 ** mintInfo.decimals);
        
        console.log(`Token Address: ${cTokenMint.toString()}`);
        console.log(`Total Supply: ${totalSupply.toLocaleString()} $C tokens`);
        console.log(`Decimals: ${mintInfo.decimals}`);
        
        // Calculate market cap based on pool
        const poolSolValue = 0.05; // Your pool has 0.05 SOL
        const poolTokens = 100000; // Your pool has 100,000 tokens
        const solPrice = 240; // Estimate
        
        const tokenPriceFromPool = (poolSolValue * solPrice) / poolTokens;
        const marketCapFromPool = tokenPriceFromPool * totalSupply;
        
        console.log('\n💰 MARKET CAP CALCULATION:');
        console.log(`Pool SOL: ${poolSolValue} SOL ($${(poolSolValue * solPrice).toFixed(2)})`);
        console.log(`Pool Tokens: ${poolTokens.toLocaleString()} $C`);
        console.log(`Price per token: $${tokenPriceFromPool.toFixed(8)}`);
        console.log(`MARKET CAP: $${marketCapFromPool.toLocaleString()}`);
        
        if (marketCapFromPool > 1000000) {
            console.log(`🚀 HOLY SHIT! Your token has a $${(marketCapFromPool / 1000000).toFixed(1)}M market cap!`);
        }
        
        // Check current balances
        console.log('\n💰 CURRENT BALANCES:');
        const authoritySol = await connection.getBalance(authorityWallet);
        const phantomSol = await connection.getBalance(phantomWallet);
        
        console.log(`Authority SOL: ${(authoritySol / 1e9).toFixed(6)} SOL ($${((authoritySol / 1e9) * solPrice).toFixed(2)})`);
        console.log(`Phantom SOL: ${(phantomSol / 1e9).toFixed(6)} SOL ($${((phantomSol / 1e9) * solPrice).toFixed(2)})`);
        console.log(`Total SOL: ${((authoritySol + phantomSol) / 1e9).toFixed(6)} SOL ($${(((authoritySol + phantomSol) / 1e9) * solPrice).toFixed(2)})`);
        
        // Pool value calculation
        const yourPoolValue = poolTokens * tokenPriceFromPool;
        console.log('\n🏊 YOUR POOL VALUE:');
        console.log(`Your tokens in pool: ${poolTokens.toLocaleString()} $C`);
        console.log(`Value of your tokens: $${yourPoolValue.toLocaleString()}`);
        console.log(`Your SOL in pool: ${poolSolValue} SOL ($${(poolSolValue * solPrice).toFixed(2)})`);
        console.log(`TOTAL POOL VALUE: $${(yourPoolValue + poolSolValue * solPrice).toLocaleString()}`);
        
        // Check if any trades happened
        console.log('\n📈 ARBITRAGE STATUS:');
        const currentTime = new Date().toLocaleTimeString();
        console.log(`Current time: ${currentTime}`);
        
        // Look for reinvestment log
        const fs = require('fs');
        if (fs.existsSync('reinvestment-log.json')) {
            const log = JSON.parse(fs.readFileSync('reinvestment-log.json'));
            console.log(`✅ Found ${log.length} arbitrage trades executed`);
            const totalReinvested = log.reduce((sum, trade) => sum + trade.amount, 0);
            console.log(`💰 Total profits reinvested: $${totalReinvested.toFixed(8)}`);
            
            if (log.length > 0) {
                const lastTrade = log[log.length - 1];
                console.log(`Last trade: ${new Date(lastTrade.timestamp).toLocaleString()}`);
                console.log(`Last profit: $${lastTrade.amount.toFixed(8)}`);
            }
        } else {
            console.log('⚠️ No arbitrage trades executed yet (file not found)');
        }
        
        console.log('\n🎯 RECOMMENDATIONS:');
        if (marketCapFromPool > 10000000) {
            console.log(`🔥 MASSIVE OPPORTUNITY: $${(marketCapFromPool / 1000000).toFixed(1)}M market cap!`);
            console.log(`🔥 Your pool position is worth $${(yourPoolValue + poolSolValue * solPrice).toLocaleString()}!`);
            console.log(`💡 Consider adding liquidity to capture more trading fees`);
            console.log(`💡 Your arbitrage bot could make HUGE profits with this volume`);
        }
        
        if (authoritySol / 1e9 < 0.1) {
            console.log(`📢 Add more SOL to authority wallet for bigger arbitrage trades`);
            console.log(`📢 With this market cap, even 0.1 SOL could generate significant profits`);
        }
        
    } catch (error) {
        console.error('❌ Check failed:', error.message);
    }
}

checkMarketCap().catch(console.error);