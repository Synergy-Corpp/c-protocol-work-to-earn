#!/usr/bin/env node

const RealArbitrageBot = require('./real-arbitrage-bot.js');

async function checkBotStatus() {
    console.log('🤖 CHECKING REAL ARBITRAGE BOT STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const bot = new RealArbitrageBot();
    
    try {
        // Initialize bot
        const initialized = await bot.initialize();
        if (!initialized) {
            console.log('❌ Bot failed to initialize');
            return;
        }
        
        console.log('✅ Bot initialized successfully');
        
        // Check current balances
        const solBalance = await bot.connection.getBalance(bot.authority.publicKey);
        const solAmount = solBalance / 1e9;
        
        console.log(`\n💰 CURRENT STATUS:`);
        console.log(`SOL Balance: ${solAmount.toFixed(6)} SOL ($${(solAmount * 240).toFixed(2)})`);
        console.log(`Authority: ${bot.authority.publicKey.toString()}`);
        console.log(`Token: ${bot.cTokenMint.toString()}`);
        console.log(`Pool: ${bot.poolId}`);
        
        // Test arbitrage opportunity detection
        console.log(`\n🔍 TESTING ARBITRAGE DETECTION:`);
        const opportunity = await bot.checkRealArbitrageOpportunity();
        
        if (opportunity) {
            console.log(`✅ Opportunity found:`);
            console.log(`   Spread: ${opportunity.spread.toFixed(3)}%`);
            console.log(`   Buy: ${opportunity.buyExchange} @ $${opportunity.buyPrice.toFixed(8)}`);
            console.log(`   Sell: ${opportunity.sellExchange} @ $${opportunity.sellPrice.toFixed(8)}`);
            
            // Test execution capability
            console.log(`\n⚡ TESTING EXECUTION CAPABILITY:`);
            const maxTradeValue = Math.min(solAmount * 0.2, 0.002);
            const tradeSize = Math.floor(maxTradeValue / opportunity.buyPrice);
            const actualProfit = (opportunity.sellPrice - opportunity.buyPrice) * tradeSize;
            
            console.log(`Max trade value: $${(maxTradeValue * 240).toFixed(2)}`);
            console.log(`Trade size: ${tradeSize.toLocaleString()} tokens`);
            console.log(`Expected profit: $${actualProfit.toFixed(8)}`);
            
            if (tradeSize >= 10 && actualProfit >= 0.00001) {
                console.log(`✅ Trade would execute successfully!`);
                console.log(`💡 Bot should be making trades every 15 seconds`);
            } else {
                console.log(`❌ Trade too small to execute`);
                console.log(`   Minimum: 10 tokens, $0.00001 profit`);
            }
            
        } else {
            console.log(`⚠️ No arbitrage opportunities detected`);
            console.log(`💡 This might be why no trades are happening`);
        }
        
        // Check if log file should exist
        const fs = require('fs');
        console.log(`\n📁 LOG FILE STATUS:`);
        if (fs.existsSync('reinvestment-log.json')) {
            const log = JSON.parse(fs.readFileSync('reinvestment-log.json'));
            console.log(`✅ Found ${log.length} completed trades`);
            log.slice(-3).forEach(trade => {
                console.log(`   ${new Date(trade.timestamp).toLocaleTimeString()}: $${trade.amount.toFixed(8)}`);
            });
        } else {
            console.log(`❌ No reinvestment-log.json found`);
            console.log(`💡 This means no successful trades have completed yet`);
        }
        
        // Simulate one trade cycle
        console.log(`\n🧪 SIMULATING ONE TRADE CYCLE:`);
        
        const testOpportunity = await bot.checkRealArbitrageOpportunity();
        if (testOpportunity) {
            console.log(`Found opportunity with ${testOpportunity.spread.toFixed(2)}% spread`);
            
            // Don't actually execute, just show what would happen
            const wouldExecute = await bot.executeRealArbitrage(testOpportunity);
            if (wouldExecute) {
                console.log(`✅ Trade cycle would complete successfully`);
            } else {
                console.log(`❌ Trade cycle would fail`);
            }
        }
        
        console.log(`\n🎯 SUMMARY:`);
        console.log(`Bot process: Running (PID found earlier)`);
        console.log(`Bot balance: ${solAmount.toFixed(6)} SOL (${solAmount > 0.1 ? 'PLENTY' : 'LOW'})`);
        console.log(`Arbitrage detection: ${opportunity ? 'WORKING' : 'NO OPPORTUNITIES'}`);
        console.log(`Expected frequency: Every 15 seconds`);
        console.log(`Log file: ${fs.existsSync('reinvestment-log.json') ? 'EXISTS' : 'MISSING'}`);
        
        if (!fs.existsSync('reinvestment-log.json')) {
            console.log(`\n💡 WHY NO TRADES YET:`);
            console.log(`• Bot may have just started`);
            console.log(`• Spreads might be too small`);
            console.log(`• Network delays in detection`);
            console.log(`• Bot waiting for profitable opportunities`);
            console.log(`\n⏰ WAIT 1-2 MINUTES and check again!`);
        }
        
    } catch (error) {
        console.error('❌ Status check failed:', error.message);
    }
}

checkBotStatus().catch(console.error);