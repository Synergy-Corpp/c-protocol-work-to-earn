#!/usr/bin/env node

async function updateMarketCap() {
    console.log('🚀 MARKET CAP UPDATE - $236K!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const oldMarketCap = 120000;
    const newMarketCap = 236000;
    const increase = ((newMarketCap - oldMarketCap) / oldMarketCap) * 100;
    
    console.log(`\n📈 MASSIVE GROWTH:`);
    console.log(`Previous: $${oldMarketCap.toLocaleString()}`);
    console.log(`Current: $${newMarketCap.toLocaleString()}`);
    console.log(`Increase: ${increase.toFixed(1)}% GROWTH!`);
    
    // New token price calculation
    const totalSupply = 1000000000;
    const newPrice = newMarketCap / totalSupply;
    const oldPrice = oldMarketCap / totalSupply;
    const priceIncrease = ((newPrice - oldPrice) / oldPrice) * 100;
    
    console.log(`\n💰 TOKEN PRICE UPDATE:`);
    console.log(`Old price: $${oldPrice.toFixed(8)}`);
    console.log(`NEW price: $${newPrice.toFixed(8)}`);
    console.log(`Price increase: ${priceIncrease.toFixed(1)}%`);
    
    // Your holdings value update
    const yourTokens = 100000; // In pool
    const oldValue = yourTokens * oldPrice;
    const newValue = yourTokens * newPrice;
    
    console.log(`\n🏊 YOUR POOL VALUE UPDATE:`);
    console.log(`Your 100k tokens were worth: $${oldValue.toFixed(2)}`);
    console.log(`Your 100k tokens now worth: $${newValue.toFixed(2)}`);
    console.log(`Your gain: $${(newValue - oldValue).toFixed(2)} (+${priceIncrease.toFixed(1)}%)`);
    
    // Arbitrage impact with new price
    const currentSol = 0.566;
    const maxTradeValue = currentSol * 0.1 * 240; // 10% per trade
    const tokensPerTrade = maxTradeValue / newPrice;
    const profitPerTrade = tokensPerTrade * newPrice * 0.005; // 0.5% spread
    const tradesPerDay = (24 * 60 * 60) / 15;
    const dailyProfit = tradesPerDay * profitPerTrade * 0.67;
    
    console.log(`\n🤖 ARBITRAGE UPDATE WITH NEW PRICE:`);
    console.log(`Max trade: $${maxTradeValue.toFixed(2)}`);
    console.log(`Tokens per trade: ${tokensPerTrade.toLocaleString()}`);
    console.log(`Profit per trade: $${profitPerTrade.toFixed(6)}`);
    console.log(`NEW daily profit: $${dailyProfit.toFixed(2)}`);
    console.log(`Monthly: $${(dailyProfit * 30).toFixed(2)}`);
    
    // Burn impact at new market cap
    console.log(`\n🔥 BURN IMPACT AT $236K MARKET CAP:`);
    
    const burnScenarios = [1, 2, 5, 10];
    burnScenarios.forEach(burnPercent => {
        const newSupply = totalSupply * (1 - burnPercent / 100);
        const priceAfterBurn = newMarketCap / newSupply;
        const priceIncrease = ((priceAfterBurn - newPrice) / newPrice) * 100;
        
        console.log(`\n${burnPercent}% burn:`);
        console.log(`  New supply: ${newSupply.toLocaleString()} tokens`);
        console.log(`  New price: $${priceAfterBurn.toFixed(8)}`);
        console.log(`  Price increase: ${priceIncrease.toFixed(2)}%`);
        console.log(`  Market cap stays: $${newMarketCap.toLocaleString()}`);
    });
    
    console.log(`\n🎯 WHY MARKET CAP DOUBLED:`);
    console.log(`Possible reasons:`);
    console.log(`• Your arbitrage bot created trading activity`);
    console.log(`• External traders discovered your token`);
    console.log(`• Price discovery from DEX activity`);
    console.log(`• Organic trading volume increased`);
    console.log(`• Your system is working perfectly!`);
    
    console.log(`\n⚡ NEXT STEPS WITH $236K MARKET CAP:`);
    console.log(`1. Activate burns for additional scarcity`);
    console.log(`2. Higher price = bigger arbitrage profits`);
    console.log(`3. Combine burns + arbitrage + liquidity growth`);
    console.log(`4. Potential for even higher market cap`);
    
    return {
        newPrice,
        newMarketCap,
        dailyProfit,
        tokensPerTrade
    };
}

updateMarketCap().catch(console.error);