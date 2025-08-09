#!/usr/bin/env node

const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');

async function sendMoreSOL() {
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Load authority wallet (has more SOL)
    const secretKey = JSON.parse(fs.readFileSync('/Users/leonmcdanels/.config/solana/id.json'));
    const authority = Keypair.fromSecretKey(new Uint8Array(secretKey));
    
    // Your Phantom wallet
    const phantomWallet = new PublicKey('BbBgQKSrv67WaohSHa7SSJZYrUbT5wC6MatdbBrqCgAn');
    
    console.log('💰 Sending additional SOL to Phantom...');
    console.log('From:', authority.publicKey.toString());
    console.log('To:', phantomWallet.toString());
    
    try {
        // Check current balances first
        const authoritySolBalance = await connection.getBalance(authority.publicKey);
        const phantomSolBalance = await connection.getBalance(phantomWallet);
        
        console.log(`\n📊 Current Balances:`);
        console.log(`Authority: ${(authoritySolBalance / 1e9).toFixed(4)} SOL`);
        console.log(`Phantom: ${(phantomSolBalance / 1e9).toFixed(4)} SOL`);
        
        if (authoritySolBalance < 15 * 1e9) {
            console.log('⚠️ Authority wallet has insufficient SOL for 15 SOL transfer');
            console.log('💡 Will send available amount minus 0.01 SOL for fees');
        }
        
        // Send 15 SOL (or available amount)
        const solToSend = Math.min(15 * 1e9, authoritySolBalance - 0.01 * 1e9); // Keep 0.01 for fees
        const solAmount = solToSend / 1e9;
        
        console.log(`\n🔄 Transferring ${solAmount.toFixed(4)} SOL...`);
        
        const solTransfer = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: authority.publicKey,
                toPubkey: phantomWallet,
                lamports: solToSend
            })
        );
        
        const signature = await connection.sendTransaction(solTransfer, [authority]);
        await connection.confirmTransaction(signature);
        
        console.log('✅ SOL transferred:', signature);
        
        // Check new balances
        const newPhantomBalance = await connection.getBalance(phantomWallet);
        console.log(`\n🎉 Transfer Complete!`);
        console.log(`Your Phantom wallet now has: ${(newPhantomBalance / 1e9).toFixed(4)} SOL`);
        console.log(`Ready for pool creation with plenty of SOL for fees!`);
        
    } catch (error) {
        console.error('❌ Transfer failed:', error);
    }
}

sendMoreSOL().catch(console.error);