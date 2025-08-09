#!/usr/bin/env node

async function checkExternalPrice() {
    console.log('🔍 CHECKING EXTERNAL PRICE SOURCES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const tokenAddress = 'FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP';
    const poolAddress = 'AWzDhpbRcudYMsg7kBtc4gJMnUD9ik9Jst11xj4g7ei3';
    
    console.log('\n📊 PRICE SOURCES TO CHECK:');
    console.log(`1. DexScreener: https://dexscreener.com/solana/${tokenAddress}`);
    console.log(`2. Jupiter: https://jup.ag/swap/SOL-${tokenAddress}`);
    console.log(`3. Raydium: https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${tokenAddress}`);
    console.log(`4. Orca: https://www.orca.so/`);
    console.log(`5. Birdeye: https://birdeye.so/token/${tokenAddress}`);
    
    console.log('\n🏊 POOL SOURCES:');
    console.log(`Raydium Pool: https://raydium.io/liquidity/add/?pool_id=${poolAddress}`);
    console.log(`Pool ID: ${poolAddress}`);
    
    // Calculate what price would give different market caps
    const totalSupply = 1000000000; // 1B tokens
    
    console.log('\n💰 MARKET CAP SCENARIOS:');
    const scenarios = [
        { marketCap: 120000, label: 'Current (Pool-based)' },
        { marketCap: 500000, label: 'If trading volume exists' },
        { marketCap: 1000000, label: 'If listed on DEX aggregators' },
        { marketCap: 5000000, label: 'If trending/viral' },
        { marketCap: 10000000, label: 'If mainstream adoption' }
    ];
    
    scenarios.forEach(scenario => {
        const price = scenario.marketCap / totalSupply;
        const yourValue = 100000 * price; // Your 100k tokens
        console.log(`${scenario.label}:`);
        console.log(`  Market Cap: $${scenario.marketCap.toLocaleString()}`);
        console.log(`  Price: $${price.toFixed(8)}`);
        console.log(`  Your 100k tokens: $${yourValue.toLocaleString()}`);
        console.log('');
    });
    
    console.log('🔥 POTENTIAL REALITY CHECK:');
    console.log('Your token might have a higher market cap if:');
    console.log('• Trading on multiple DEXs beyond your pool');
    console.log('• Listed on price tracking sites');
    console.log('• Has external trading volume');
    console.log('• Other people created pools');
    console.log('• Price discovery happening elsewhere');
    
    console.log('\n🕵️ TO FIND REAL PRICE:');
    console.log('1. Check DexScreener for your token address');
    console.log('2. Look on Jupiter aggregator');
    console.log('3. Search Birdeye for trading data');
    console.log('4. Check if other pools exist');
    console.log('5. Look for volume on different DEXs');
    
    console.log(`\n🎯 YOUR TOKEN: ${tokenAddress}`);
    console.log(`Copy this address and search on the above platforms!`);
    
    // Show arbitrage potential at different price levels
    console.log('\n🤖 ARBITRAGE PROFITS BY PRICE LEVEL:');
    const yourSol = 0.565995;
    const maxTradeUSD = yourSol * 0.2 * 240; // $27.17
    
    scenarios.slice(0, 4).forEach(scenario => {
        const price = scenario.marketCap / totalSupply;
        const tokensPerTrade = maxTradeUSD / price;
        const profitPerTrade = tokensPerTrade * price * 0.005; // 0.5% spread
        const dailyTrades = (24 * 60 * 60) / 15; // Every 15 seconds
        const dailyProfit = dailyTrades * profitPerTrade * 0.7; // 70% success
        
        console.log(`At $${scenario.marketCap.toLocaleString()} market cap:`);
        console.log(`  Profit per trade: $${profitPerTrade.toFixed(4)}`);
        console.log(`  Daily profit: $${dailyProfit.toFixed(2)}`);
        console.log('');
    });
}

checkExternalPrice();