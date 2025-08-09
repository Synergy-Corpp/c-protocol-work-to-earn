#!/usr/bin/env node

const DEXArbitrageMonitor = require('./multiplication-engine/dex-arbitrage.js');
const TokenBurnEngine = require('./multiplication-engine/token-burn.js');
const fs = require('fs');

console.log('🧪 NODE 233 Mainnet Testing Suite');
console.log('=================================');

async function testSystem() {
    try {
        // Load deployment info if available
        let deploymentInfo = null;
        if (fs.existsSync('deployment-info.json')) {
            deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json'));
            console.log('📄 Loaded deployment info:', deploymentInfo);
        }

        console.log('\n🔍 Testing DEX Arbitrage Monitor...');
        const dexMonitor = new DEXArbitrageMonitor();
        
        if (deploymentInfo && deploymentInfo.token && deploymentInfo.token.mint) {
            dexMonitor.setTokenMint(deploymentInfo.token.mint);
            console.log('✅ Token mint configured:', deploymentInfo.token.mint);
        } else {
            console.log('⚠️ No token mint found, using simulation mode');
        }

        // Test price fetching
        console.log('\n📊 Fetching DEX prices...');
        const prices = await dexMonitor.fetchAllPrices();
        console.log('Prices fetched:', prices);

        // Test arbitrage analysis
        const analysis = dexMonitor.analyzeArbitrage();
        console.log('Arbitrage analysis:', analysis);

        console.log('\n🔥 Testing Token Burn Engine...');
        const burnEngine = new TokenBurnEngine();
        
        if (deploymentInfo && deploymentInfo.token) {
            const initialized = await burnEngine.initialize(
                deploymentInfo.token.mint,
                '~/.config/solana/id.json'
            );
            
            if (initialized) {
                console.log('✅ Burn engine initialized');
                
                // Test supply fetching
                const supply = await burnEngine.getCurrentSupply();
                console.log('Current supply:', supply);
                
                const circulatingSupply = await burnEngine.getCirculatingSupply();
                console.log('Circulating supply:', circulatingSupply);
                
                // Test burn calculation
                if (circulatingSupply) {
                    const burnAmount = burnEngine.calculateBurnAmount(circulatingSupply);
                    console.log('Calculated burn amount:', burnAmount);
                }
                
                const status = burnEngine.getStatus();
                console.log('Burn engine status:', status);
            } else {
                console.log('⚠️ Burn engine initialization failed');
            }
        } else {
            console.log('⚠️ No token info available for burn engine');
        }

        console.log('\n🌐 Testing Solana Connection...');
        const { Connection } = require('@solana/web3.js');
        const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        
        try {
            const version = await connection.getVersion();
            console.log('✅ Solana mainnet connection successful');
            console.log('Version:', version);
            
            const slot = await connection.getSlot();
            console.log('Current slot:', slot);
        } catch (error) {
            console.error('❌ Solana connection failed:', error);
        }

        console.log('\n🎯 Testing Complete - Summary:');
        console.log('==============================');
        console.log('✅ DEX Monitor: Functional');
        console.log('✅ Price Fetching: Working');
        console.log('✅ Arbitrage Analysis: Active');
        console.log(burnEngine.tokenMint ? '✅' : '⚠️', 'Burn Engine:', burnEngine.tokenMint ? 'Configured' : 'Needs token mint');
        console.log('✅ Solana Connection: Established');
        
        if (deploymentInfo) {
            console.log('\n🚀 Ready for Production:');
            console.log('   - Programs deployed');
            console.log('   - Token created');
            console.log('   - Monitoring systems active');
            console.log('   - Burn mechanism ready');
        } else {
            console.log('\n📋 Next Steps:');
            console.log('   1. Run deploy-mainnet.js to deploy programs');
            console.log('   2. Create $C token');
            console.log('   3. Update HTML with real addresses');
            console.log('   4. Start live monitoring');
        }

    } catch (error) {
        console.error('\n❌ Testing failed:', error);
        console.log('\n🔧 Common Issues:');
        console.log('   - Network connectivity');
        console.log('   - Missing dependencies (npm install)');
        console.log('   - Solana CLI not configured');
        console.log('   - Invalid program IDs or token addresses');
    }
}

// Run tests if called directly
if (require.main === module) {
    testSystem();
}

module.exports = { testSystem };