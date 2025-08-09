#!/usr/bin/env node

const RealArbitrageBot = require('./real-arbitrage-bot.js');

async function startRealArbitrageSystem() {
    console.log('🚀 NODE 233 Real Arbitrage System Starting...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const bot = new RealArbitrageBot();
    
    // Initialize the bot
    const initialized = await bot.initialize();
    if (!initialized) {
        console.error('❌ Failed to initialize arbitrage bot');
        process.exit(1);
    }
    
    console.log('✅ Arbitrage bot initialized successfully');
    console.log(`🪙 Token: FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP`);
    console.log(`🏊 Pool: AWzDhpbRcudYMsg7kBtc4gJMnUD9ik9Jst11xj4g7ei3`);
    console.log('');
    
    // Check initial balances
    try {
        const solBalance = await bot.connection.getBalance(bot.authority.publicKey);
        const solAmount = solBalance / 1e9;
        
        console.log('💰 Initial Balance Check:');
        console.log(`   SOL Balance: ${solAmount.toFixed(6)} SOL`);
        
        if (solAmount < 0.005) {
            console.log('⚠️  Low SOL balance detected');
            console.log('💡 Bot will execute micro-trades with available funds');
        } else {
            console.log('✅ Sufficient SOL for arbitrage operations');
        }
        console.log('');
        
    } catch (error) {
        console.error('❌ Balance check failed:', error.message);
    }
    
    // Start the arbitrage bot
    console.log('🎯 Starting real arbitrage execution...');
    console.log('   • Monitoring price differences across DEXs');
    console.log('   • Executing profitable micro-trades');  
    console.log('   • Auto-reinvesting profits into your pool');
    console.log('   • Building liquidity organically');
    console.log('');
    console.log('Press Ctrl+C to stop the bot');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await bot.startRealArbitrageBot();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down arbitrage bot...');
        bot.stopBot();
        
        // Show final stats
        const status = bot.getStatus();
        console.log('📊 Final Statistics:');
        console.log(`   Total Profit: $${status.totalProfit.toFixed(6)}`);
        console.log(`   Reinvestments: ${status.reinvestmentCount}`);
        console.log(`   Pool ID: ${status.poolId}`);
        console.log('');
        console.log('✅ Bot stopped successfully');
        process.exit(0);
    });
}

// Auto-start
startRealArbitrageSystem().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});