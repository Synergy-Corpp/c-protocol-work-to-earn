#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress, getAccount } = require('@solana/spl-token');

async function checkTokenHoldings() {
    console.log('🪙 TOKEN HOLDINGS CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const tokenMint = new PublicKey('FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP');
    
    const wallets = {
        'Authority': 'BPYapeoALDbgotQvFfxmjALjpzmF2fWsDwYpctFraxjp',
        'Phantom': 'BbBgQKSrv67WaohSHa7SSJZYrUbT5wC6MatdbBrqCgAn',
        'Protocol Vault': '7v3RkLvikBh2xRPcryZTj24Mp7EvhwKAfbozvStjXttZ'
    };
    
    let totalTokens = 0;
    
    for (const [name, address] of Object.entries(wallets)) {
        try {
            console.log(`\n🔍 Checking ${name}: ${address}`);
            
            // Get associated token account address
            const ata = await getAssociatedTokenAddress(
                tokenMint,
                new PublicKey(address)
            );
            
            console.log(`   Token Account: ${ata.toString()}`);
            
            try {
                // Check if account exists and get balance
                const tokenAccount = await getAccount(connection, ata);
                const balance = Number(tokenAccount.amount) / (10 ** 9);
                
                console.log(`   ✅ Balance: ${balance.toLocaleString()} $C tokens`);
                totalTokens += balance;
                
                if (balance > 0) {
                    const usdValue = balance * 0.00012;
                    console.log(`   💰 USD Value: $${usdValue.toFixed(2)}`);
                }
                
            } catch (accountError) {
                console.log(`   ❌ No token account found (balance: 0)`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error checking ${name}: ${error.message}`);
        }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`Total $C tokens found: ${totalTokens.toLocaleString()}`);
    console.log(`Total USD value: $${(totalTokens * 0.00012).toFixed(2)}`);
    
    // Check if tokens are available for liquidity addition
    if (totalTokens > 500000) {
        console.log(`\n✅ SUFFICIENT TOKENS FOR LIQUIDITY:`);
        console.log(`You have enough tokens to add liquidity!`);
        console.log(`To add 0.21 SOL ($50), you need ~420K tokens`);
        console.log(`Available: ${totalTokens.toLocaleString()} tokens`);
        
        if (totalTokens >= 420000) {
            console.log(`\n🚀 READY TO ADD LIQUIDITY:`);
            console.log(`1. Use Raydium interface`);
            console.log(`2. Connect wallet with tokens`);
            console.log(`3. Add 0.21 SOL + 420K tokens`);
        }
    } else {
        console.log(`\n⚠️ INSUFFICIENT TOKENS:`);
        console.log(`Need to transfer tokens from protocol vault first`);
        console.log(`Or add SOL-only liquidity (if supported)`);
    }
    
    // Provide transfer guidance if needed
    console.log(`\n🔄 TO TRANSFER TOKENS TO PHANTOM:`);
    console.log(`If tokens are in Authority wallet, you can:`);
    console.log(`1. Use transfer-to-phantom.js script`);
    console.log(`2. Transfer needed amount to Phantom`);
    console.log(`3. Then add liquidity via Raydium interface`);
}

checkTokenHoldings().catch(console.error);