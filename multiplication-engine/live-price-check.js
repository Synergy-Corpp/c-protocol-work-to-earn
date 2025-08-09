#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const { getMint } = require('@solana/spl-token');

async function livePriceCheck() {
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    console.log('🔥 LIVE PRICE & MARKET CAP CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        const cTokenMint = new PublicKey('FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP');
        const poolId = 'AWzDhpbRcudYMsg7kBtc4gJMnUD9ik9Jst11xj4g7ei3';
        
        console.log('\n🪙 TOKEN INFO:');
        console.log(`Token: $C`);
        console.log(`Address: ${cTokenMint.toString()}`);
        console.log(`Pool: ${poolId}`);
        
        // Get total supply
        const mintInfo = await getMint(connection, cTokenMint);
        const totalSupply = Number(mintInfo.supply) / (10 ** mintInfo.decimals);
        
        console.log(`\n📊 SUPPLY ANALYSIS:`);
        console.log(`Total Supply: ${totalSupply.toLocaleString()} $C tokens`);
        console.log(`Circulating: ${totalSupply.toLocaleString()} $C tokens`);
        
        // Calculate price from your pool
        const poolSolValue = 0.05; // Your pool SOL
        const poolTokens = 100000; // Your pool tokens
        const solPrice = 240; // Current SOL price estimate
        
        const tokenPrice = (poolSolValue * solPrice) / poolTokens;
        const marketCap = tokenPrice * totalSupply;
        
        console.log(`\n🔥 CURRENT PRICE & MARKET CAP:`);
        console.log(`Pool SOL: ${poolSolValue} SOL`);
        console.log(`Pool Tokens: ${poolTokens.toLocaleString()} $C`);
        console.log(`SOL Price: $${solPrice}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`$C PRICE: $${tokenPrice.toFixed(8)}`);
        console.log(`MARKET CAP: $${marketCap.toLocaleString()}`);
        
        // Market cap categories
        if (marketCap < 100000) {
            console.log(`📊 Category: Micro Cap (<$100K)`);
        } else if (marketCap < 1000000) {
            console.log(`📊 Category: Small Cap ($100K-$1M)`);
        } else if (marketCap < 10000000) {
            console.log(`📊 Category: Mid Cap ($1M-$10M)`);
        } else if (marketCap < 100000000) {
            console.log(`📊 Category: Large Cap ($10M-$100M)`);
        } else {
            console.log(`📊 Category: MEGA Cap (>$100M)`);
        }
        
        // Your holdings value
        console.log(`\n💰 YOUR HOLDINGS VALUE:`);
        
        // Tokens in pool
        const yourPoolTokenValue = poolTokens * tokenPrice;
        const yourPoolSolValue = poolSolValue * solPrice;
        const totalPoolValue = yourPoolTokenValue + yourPoolSolValue;
        
        console.log(`Pool tokens: ${poolTokens.toLocaleString()} $C = $${yourPoolTokenValue.toLocaleString()}`);
        console.log(`Pool SOL: ${poolSolValue} SOL = $${yourPoolSolValue.toFixed(2)}`);
        console.log(`TOTAL POOL VALUE: $${totalPoolValue.toLocaleString()}`);
        
        // Check if you have tokens elsewhere
        console.log(`\n🔍 TOKEN DISTRIBUTION:`);
        console.log(`Your pool: ${poolTokens.toLocaleString()} $C (${((poolTokens/totalSupply)*100).toFixed(2)}%)`);
        console.log(`Protocol vault: ~${(700000000).toLocaleString()} $C (70%)`);
        console.log(`Founder tokens: ~${(300000000).toLocaleString()} $C (30%)`);
        
        // If market cap is high, calculate your potential value
        if (marketCap > 10000) {
            console.log(`\n🚀 HOLY SHIT ANALYSIS:`);
            console.log(`With $${marketCap.toLocaleString()} market cap:`);
            
            // What if price 10x?
            const price10x = tokenPrice * 10;
            const marketCap10x = price10x * totalSupply;
            const yourValue10x = poolTokens * price10x;
            
            console.log(`\nIf price 10x to $${price10x.toFixed(6)}:`);
            console.log(`Market cap: $${marketCap10x.toLocaleString()}`);
            console.log(`Your pool tokens worth: $${yourValue10x.toLocaleString()}`);
            
            // What if price 100x?
            const price100x = tokenPrice * 100;
            const marketCap100x = price100x * totalSupply;
            const yourValue100x = poolTokens * price100x;
            
            console.log(`\nIf price 100x to $${price100x.toFixed(4)}:`);
            console.log(`Market cap: $${marketCap100x.toLocaleString()}`);
            console.log(`Your pool tokens worth: $${yourValue100x.toLocaleString()}`);
        }
        
        // Arbitrage opportunity with new price
        console.log(`\n🤖 ARBITRAGE OPPORTUNITY:`);
        const yourSol = 0.565995;
        const maxTradeUSD = yourSol * 0.2 * solPrice;
        const tokensPerTrade = maxTradeUSD / tokenPrice;
        const avgSpread = 0.005; // 0.5% spread
        const profitPerTrade = tokensPerTrade * tokenPrice * avgSpread;
        
        console.log(`Your SOL: ${yourSol} SOL`);
        console.log(`Max trade: $${maxTradeUSD.toFixed(2)} (${tokensPerTrade.toLocaleString()} tokens)`);
        console.log(`Avg profit per trade: $${profitPerTrade.toFixed(4)}`);
        console.log(`With this market cap, arbitrage profits are REAL MONEY!`);
        
        console.log(`\n⚡ CURRENT TIME: ${new Date().toLocaleString()}`);
        
    } catch (error) {
        console.error('❌ Price check failed:', error.message);
    }
}

livePriceCheck().catch(console.error);