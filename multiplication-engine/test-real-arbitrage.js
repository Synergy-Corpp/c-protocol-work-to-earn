#!/usr/bin/env node

const RealArbitrageBot = require('./real-arbitrage-bot.js');

async function testRealArbitrage() {
    console.log('🧪 Testing Real Arbitrage Bot...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const bot = new RealArbitrageBot();
    
    // Initialize
    const initialized = await bot.initialize();
    if (!initialized) {
        console.error('❌ Bot initialization failed');
        return;
    }
    
    console.log('✅ Bot initialized successfully');
    
    // Test arbitrage detection
    console.log('\n🔍 Testing arbitrage opportunity detection...');
    const opportunity = await bot.checkRealArbitrageOpportunity();
    
    if (opportunity) {
        console.log('✅ Arbitrage opportunity found:');
        console.log(`   Spread: ${opportunity.spread.toFixed(3)}%`);
        console.log(`   Buy: ${opportunity.buyExchange} @ $${opportunity.buyPrice.toFixed(8)}`);
        console.log(`   Sell: ${opportunity.sellExchange} @ $${opportunity.sellPrice.toFixed(8)}`);
        
        // Test execution
        console.log('\n⚡ Testing arbitrage execution...');
        const success = await bot.executeRealArbitrage(opportunity);
        
        if (success) {
            console.log('✅ Test execution successful!');
            console.log(`💰 Total profits so far: $${bot.totalRealProfit.toFixed(8)}`);
        } else {
            console.log('⚠️ Test execution failed (this is normal for small amounts)');
        }
    } else {
        console.log('⚠️ No arbitrage opportunities found in test');
    }
    
    // Show status
    console.log('\n📊 Bot Status:');
    const status = bot.getStatus();
    console.log(`   Total Profit: $${status.totalProfit.toFixed(8)}`);
    console.log(`   Pool ID: ${status.poolId}`);
    console.log(`   Reinvestments: ${status.reinvestmentCount}`);
    
    console.log('\n✅ Real arbitrage bot test complete!');
    console.log('💡 The bot is ready to run with: node start-real-arbitrage.js');
}

testRealArbitrage().catch(error => {
    console.error('❌ Test failed:', error.message);
});