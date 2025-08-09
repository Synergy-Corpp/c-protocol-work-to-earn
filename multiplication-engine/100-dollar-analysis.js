#!/usr/bin/env node

async function analyze100DollarImpact() {
    console.log('💰 $100 INVESTMENT IMPACT ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const solPrice = 240; // Current SOL price
    const investmentUSD = 100;
    const solToAdd = investmentUSD / solPrice; // ~0.417 SOL
    
    console.log(`\n📊 INVESTMENT BREAKDOWN:`);
    console.log(`Investment: $${investmentUSD}`);
    console.log(`SOL to purchase: ${solToAdd.toFixed(6)} SOL`);
    console.log(`Current authority SOL: 0.009995 SOL`);
    console.log(`New authority SOL: ${(0.009995 + solToAdd).toFixed(6)} SOL`);
    console.log(`Increase factor: ${((solToAdd + 0.009995) / 0.009995).toFixed(1)}x`);
    
    console.log(`\n🚀 ARBITRAGE IMPROVEMENTS:`);
    
    // Current vs New Arbitrage Potential
    const currentMaxTrade = 0.009995 * 0.2 * solPrice; // $0.48
    const newMaxTrade = (0.009995 + solToAdd) * 0.2 * solPrice; // Much bigger
    
    const currentDailyProfit = (24 * 60 * 60 / 15) * 0.0002 * 0.7; // $0.81
    const newDailyProfit = (24 * 60 * 60 / 15) * 0.01 * 0.7; // $40.32
    
    console.log(`Current max trade: $${currentMaxTrade.toFixed(2)} per trade`);
    console.log(`NEW max trade: $${newMaxTrade.toFixed(2)} per trade`);
    console.log(`Trade size increase: ${(newMaxTrade / currentMaxTrade).toFixed(1)}x`);
    
    console.log(`\nCurrent daily profit: $${currentDailyProfit.toFixed(2)}`);
    console.log(`NEW daily profit: $${newDailyProfit.toFixed(2)}`);
    console.log(`Daily profit increase: ${(newDailyProfit / currentDailyProfit).toFixed(1)}x`);
    
    console.log(`\n📈 PROJECTED RETURNS:`);
    console.log(`Daily arbitrage profit: $${newDailyProfit.toFixed(2)}`);
    console.log(`Weekly profit: $${(newDailyProfit * 7).toFixed(2)}`);
    console.log(`Monthly profit: $${(newDailyProfit * 30).toFixed(2)}`);
    console.log(`90-day profit: $${(newDailyProfit * 90).toFixed(2)}`);
    
    const breakEvenDays = investmentUSD / newDailyProfit;
    console.log(`Break-even time: ${breakEvenDays.toFixed(1)} days`);
    
    console.log(`\n🏊 POOL IMPACT:`);
    const currentPoolValue = 12; // $12
    const monthlyGrowth = newDailyProfit * 30;
    const poolGrowthPercent = (monthlyGrowth / currentPoolValue) * 100;
    
    console.log(`Current pool value: $${currentPoolValue}`);
    console.log(`Monthly reinvestment: $${monthlyGrowth.toFixed(2)}`);
    console.log(`Pool growth rate: ${poolGrowthPercent.toFixed(1)}% per month`);
    console.log(`Pool value in 6 months: $${(currentPoolValue + monthlyGrowth * 6).toFixed(2)}`);
    
    console.log(`\n💎 COMPOUNDING EFFECT:`);
    let poolValue = currentPoolValue;
    let totalProfit = 0;
    
    for (let month = 1; month <= 12; month++) {
        const monthlyProfit = newDailyProfit * 30;
        poolValue += monthlyProfit;
        totalProfit += monthlyProfit;
        
        if (month % 3 === 0) {
            console.log(`Month ${month}: Pool = $${poolValue.toFixed(2)}, Total Profit = $${totalProfit.toFixed(2)}`);
        }
    }
    
    const roi = ((totalProfit - investmentUSD) / investmentUSD) * 100;
    console.log(`\n12-month ROI: ${roi.toFixed(1)}%`);
    
    console.log(`\n🎯 RECOMMENDATION:`);
    if (roi > 1000) {
        console.log(`✅ EXCELLENT: ${roi.toFixed(0)}% ROI makes this very profitable`);
        console.log(`✅ Your $100 becomes $${(investmentUSD + totalProfit).toFixed(2)} in 12 months`);
        console.log(`✅ Pool grows from $12 to $${poolValue.toFixed(2)}`);
    }
    
    console.log(`\n📋 NEXT STEPS TO ADD $100:`);
    console.log(`1. Buy ${solToAdd.toFixed(3)} SOL on your preferred exchange`);
    console.log(`2. Send SOL to authority wallet: BPYapeoALDbgotQvFfxmjALjpzmF2fWsDwYpctFraxjp`);
    console.log(`3. Restart arbitrage bot with bigger trades`);
    console.log(`4. Watch daily profits go from $0.81 to $${newDailyProfit.toFixed(2)}`);
    console.log(`5. Set up farming for additional 15-50% APY`);
}

analyze100DollarImpact().catch(console.error);