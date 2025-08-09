#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');

async function findMyPool() {
    console.log('🔍 FINDING YOUR ACTUAL POOL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const tokenMint = new PublicKey('FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP');
    const poolId = new PublicKey('AWzDhpbRcudYMsg7kBtc4gJMnUD9ik9Jst11xj4g7ei3');
    
    console.log('\n📊 CHECKING POOL EXISTENCE:');
    console.log(`Token: ${tokenMint.toString()}`);
    console.log(`Pool ID: ${poolId.toString()}`);
    
    try {
        // Check if pool account exists
        const poolInfo = await connection.getAccountInfo(poolId);
        
        if (poolInfo) {
            console.log('✅ Pool account EXISTS on blockchain');
            console.log(`   Owner: ${poolInfo.owner.toString()}`);
            console.log(`   Data length: ${poolInfo.data.length} bytes`);
            
            // Determine which DEX this pool belongs to
            const owner = poolInfo.owner.toString();
            
            if (owner === '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8') {
                console.log('🌊 This is a RAYDIUM pool');
                console.log('\n🔗 DIRECT RAYDIUM LINKS:');
                console.log(`https://raydium.io/liquidity/add/?mode=add&pool_id=${poolId.toString()}`);
                console.log(`https://raydium.io/swap/?outputCurrency=${tokenMint.toString()}`);
            } else if (owner === '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP') {
                console.log('🐋 This is an ORCA pool');
                console.log('\n🔗 DIRECT ORCA LINKS:');
                console.log(`https://www.orca.so/pools?tokens=${tokenMint.toString()}`);
            } else {
                console.log(`🤔 Unknown DEX - Owner: ${owner}`);
            }
            
        } else {
            console.log('❌ Pool account does NOT exist');
            console.log('   This might explain why you can\'t find it!');
        }
        
    } catch (error) {
        console.log('❌ Error checking pool:', error.message);
    }
    
    console.log('\n🔍 ALTERNATIVE WAYS TO FIND YOUR POOL:');
    console.log('\n1. Check your wallet transaction history:');
    console.log('   • Look for the pool creation transaction');
    console.log('   • Transaction should show which DEX was used');
    
    console.log('\n2. Search by token on different DEXs:');
    console.log('   • Raydium.io/pools - search by token');
    console.log('   • Orca.so - search by token');
    console.log('   • Jupiter.ag - check if it routes through any DEX');
    
    console.log('\n3. Use Solscan to investigate:');
    console.log(`   • https://solscan.io/token/${tokenMint.toString()}`);
    console.log('   • Check "Holders" tab for pool accounts');
    
    console.log('\n4. Check DexScreener:');
    console.log(`   • https://dexscreener.com/solana/${tokenMint.toString()}`);
    console.log('   • Shows all pools for your token');
    
    console.log('\n🤔 IF POOL DOESN\'T EXIST:');
    console.log('You might need to CREATE a new pool:');
    console.log('   • Go to Raydium.io');
    console.log('   • Click "Create Pool"');
    console.log('   • Add your token + SOL');
    console.log('   • This creates the initial liquidity pool');
    
    console.log('\n📱 MOBILE OPTION:');
    console.log('Try the Raydium mobile app:');
    console.log('   • Sometimes finds pools the web version misses');
    console.log('   • Connect Phantom wallet');
    console.log('   • Search for your token');
}

findMyPool().catch(console.error);