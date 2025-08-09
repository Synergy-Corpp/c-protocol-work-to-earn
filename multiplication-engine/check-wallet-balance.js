const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

async function checkWalletBalance() {
    try {
        const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        
        // Load wallet
        const keypair = JSON.parse(fs.readFileSync('/Users/leonmcdanels/.config/solana/id.json'));
        const publicKey = new PublicKey(keypair.slice(32, 64));
        
        console.log('💼 WALLET BALANCE CHECK');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Wallet: ${publicKey.toString()}`);
        
        // Get SOL balance
        const lamports = await connection.getBalance(publicKey);
        const solBalance = lamports / 1000000000;
        
        console.log(`SOL Balance: ${solBalance} SOL`);
        console.log(`USD Value: $${(solBalance * 240).toFixed(2)}`);
        
        return solBalance;
        
    } catch (error) {
        console.error('❌ Error checking balance:', error.message);
        return 0;
    }
}

checkWalletBalance();