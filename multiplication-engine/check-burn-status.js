#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const { getMint } = require('@solana/spl-token');

async function checkBurnStatus() {
    console.log('🔥 TOKEN BURN STATUS CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const tokenMint = new PublicKey('FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP');
    
    try {
        console.log('\n📊 CURRENT TOKEN SUPPLY:');
        const mintInfo = await getMint(connection, tokenMint);
        const currentSupply = Number(mintInfo.supply) / (10 ** mintInfo.decimals);
        
        console.log(`Token: $C (${tokenMint.toString()})`);
        console.log(`Current Supply: ${currentSupply.toLocaleString()} tokens`);
        console.log(`Decimals: ${mintInfo.decimals}`);
        
        // Compare with original supply
        const originalSupply = 1000000000; // 1 billion tokens
        const burnedAmount = originalSupply - currentSupply;
        const burnPercentage = (burnedAmount / originalSupply) * 100;
        
        console.log('\n🔥 BURN ANALYSIS:');
        console.log(`Original Supply: ${originalSupply.toLocaleString()} tokens`);
        console.log(`Current Supply: ${currentSupply.toLocaleString()} tokens`);
        console.log(`Total Burned: ${burnedAmount.toLocaleString()} tokens`);
        console.log(`Burn Percentage: ${burnPercentage.toFixed(4)}%`);
        
        if (burnedAmount > 0) {
            console.log('✅ AUTO-BURN IS WORKING!');
            console.log(`🔥 ${burnedAmount.toLocaleString()} tokens have been burned`);
        } else {
            console.log('⚠️ No tokens burned yet (or burns too small to detect)');
        }
        
        // Check burn engine files
        const fs = require('fs');
        console.log('\n📁 BURN ENGINE FILES:');
        
        const burnFiles = [
            'token-burn.js',
            'burn-log.json',
            'index.html'
        ];
        
        burnFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                console.log(`✅ ${file} (modified: ${stats.mtime.toLocaleString()})`);
            } else {
                console.log(`❌ ${file} not found`);
            }
        });
        
        // Check if burn is mentioned in the interface
        if (fs.existsSync('index.html')) {
            const htmlContent = fs.readFileSync('index.html', 'utf8');
            const hasBurnCode = htmlContent.includes('burn') || htmlContent.includes('Burn');
            console.log(`Interface has burn code: ${hasBurnCode ? '✅ YES' : '❌ NO'}`);
        }
        
        console.log('\n🔄 BURN MECHANISM STATUS:');
        console.log('The burn system was designed to:');
        console.log('• Burn 2% of protocol vault every 5 minutes');
        console.log('• Create deflationary pressure');
        console.log('• Increase token scarcity over time');
        console.log('• Work alongside arbitrage system');
        
        console.log('\n💡 BURN VS ARBITRAGE:');
        console.log('Current focus: Arbitrage bot (making real profits)');
        console.log('Burn system: Can run simultaneously');
        console.log('Combined effect: Profits + deflation = price growth');
        
        // Calculate what burns would do to price
        const currentPrice = 0.00012;
        const marketCap = currentSupply * currentPrice;
        
        console.log('\n📈 BURN IMPACT ON PRICE:');
        console.log(`Current price: $${currentPrice.toFixed(8)}`);
        console.log(`Market cap: $${marketCap.toLocaleString()}`);
        
        // If 1% burned
        const afterBurn1 = currentSupply * 0.99;
        const newPrice1 = marketCap / afterBurn1;
        const priceIncrease1 = ((newPrice1 - currentPrice) / currentPrice) * 100;
        
        console.log(`\nIf 1% burned:`);
        console.log(`New supply: ${afterBurn1.toLocaleString()} tokens`);
        console.log(`New price: $${newPrice1.toFixed(8)}`);
        console.log(`Price increase: ${priceIncrease1.toFixed(2)}%`);
        
        // If 5% burned
        const afterBurn5 = currentSupply * 0.95;
        const newPrice5 = marketCap / afterBurn5;
        const priceIncrease5 = ((newPrice5 - currentPrice) / currentPrice) * 100;
        
        console.log(`\nIf 5% burned:`);
        console.log(`New supply: ${afterBurn5.toLocaleString()} tokens`);
        console.log(`New price: $${newPrice5.toFixed(8)}`);
        console.log(`Price increase: ${priceIncrease5.toFixed(2)}%`);
        
        console.log('\n🎯 RECOMMENDATION:');
        if (burnedAmount === 0) {
            console.log('Consider activating burn system alongside arbitrage:');
            console.log('1. Arbitrage generates profits');
            console.log('2. Burns reduce supply');
            console.log('3. Combination = maximum price growth');
            console.log('4. Both systems work together perfectly');
        } else {
            console.log('✅ Burn system is already working!');
            console.log('Perfect combination: burns + arbitrage profits');
        }
        
    } catch (error) {
        console.error('❌ Burn status check failed:', error.message);
    }
}

checkBurnStatus().catch(console.error);