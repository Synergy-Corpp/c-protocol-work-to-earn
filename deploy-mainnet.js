#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 NODE 233 Mainnet Deployment Script');
console.log('=====================================');

async function runCommand(command, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔄 ${description}...`);
        console.log(`   Command: ${command}`);
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ ${description} failed:`, error);
                reject(error);
                return;
            }
            
            if (stderr) {
                console.log(`⚠️ Warning: ${stderr}`);
            }
            
            console.log(`✅ ${description} completed`);
            if (stdout) {
                console.log(stdout);
            }
            
            resolve(stdout);
        });
    });
}

async function deployToMainnet() {
    try {
        console.log('\n📋 Pre-deployment Checklist:');
        console.log('   - Solana CLI configured for mainnet');
        console.log('   - Wallet has sufficient SOL for deployment');
        console.log('   - Program IDs updated in code');
        console.log('   - Anchor.toml configured for mainnet');
        
        // Check Solana configuration
        await runCommand('solana config get', 'Checking Solana configuration');
        
        // Check wallet balance
        await runCommand('solana balance', 'Checking wallet balance');
        
        console.log('\n🔨 Building programs...');
        
        // Build multiplication engine
        await runCommand('cd multiplication-engine && anchor build', 'Building Multiplication Engine');
        
        // Build c-protocol  
        await runCommand('cd c-protocol && anchor build', 'Building C Protocol');
        
        console.log('\n🚀 Deploying to mainnet...');
        
        // Deploy multiplication engine
        const multiplyOutput = await runCommand(
            'cd multiplication-engine && anchor deploy --provider.cluster mainnet',
            'Deploying Multiplication Engine to mainnet'
        );
        
        // Deploy c-protocol
        const cprotocolOutput = await runCommand(
            'cd c-protocol && anchor deploy --provider.cluster mainnet', 
            'Deploying C Protocol to mainnet'
        );
        
        console.log('\n💰 Creating $C token...');
        
        // Create $C token
        const tokenOutput = await runCommand(
            'cd multiplication-engine && node create-token.js',
            'Creating $C token on mainnet'
        );
        
        console.log('\n📝 Deployment Summary:');
        console.log('=====================');
        console.log('✅ Multiplication Engine deployed');
        console.log('✅ C Protocol deployed');
        console.log('✅ $C Token created');
        
        // Extract program IDs from output
        const programIds = extractProgramIds(multiplyOutput, cprotocolOutput);
        const tokenInfo = extractTokenInfo(tokenOutput);
        
        // Save deployment info
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: 'mainnet',
            programs: programIds,
            token: tokenInfo
        };
        
        fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
        
        console.log('\n📄 Deployment info saved to deployment-info.json');
        console.log('\n🎯 Next Steps:');
        console.log('   1. Update HTML with real program IDs and token mint');
        console.log('   2. Initialize DEX monitoring with token address');
        console.log('   3. Start burn engine with token mint and authority');
        console.log('   4. Test with small amounts');
        
        console.log('\n🌟 NODE 233 Successfully Deployed to Mainnet! 🌟');
        
    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('   - Check Solana CLI is installed and configured');
        console.log('   - Ensure wallet has sufficient SOL');
        console.log('   - Verify Anchor.toml configuration');
        console.log('   - Check network connectivity');
        process.exit(1);
    }
}

function extractProgramIds(multiplyOutput, cprotocolOutput) {
    const programIds = {};
    
    // Extract from deployment output
    const multiplyMatch = multiplyOutput.match(/Program Id: ([1-9A-HJ-NP-Za-km-z]{32,44})/);
    if (multiplyMatch) {
        programIds.multiplication_engine = multiplyMatch[1];
    }
    
    const cprotocolMatch = cprotocolOutput.match(/Program Id: ([1-9A-HJ-NP-Za-km-z]{32,44})/);
    if (cprotocolMatch) {
        programIds.c_protocol = cprotocolMatch[1];
    }
    
    return programIds;
}

function extractTokenInfo(tokenOutput) {
    const tokenInfo = {};
    
    const mintMatch = tokenOutput.match(/\$C Token Address: ([1-9A-HJ-NP-Za-km-z]{32,44})/);
    if (mintMatch) {
        tokenInfo.mint = mintMatch[1];
    }
    
    const accountMatch = tokenOutput.match(/Minted 1B \$C tokens to: ([1-9A-HJ-NP-Za-km-z]{32,44})/);
    if (accountMatch) {
        tokenInfo.founderAccount = accountMatch[1];
    }
    
    return tokenInfo;
}

// Run deployment if called directly
if (require.main === module) {
    deployToMainnet();
}

module.exports = { deployToMainnet };