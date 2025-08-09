const {
    Connection,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
    SystemProgram,
    PublicKey
} = require('@solana/web3.js');
const {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID
} = require('@solana/spl-token');
const fs = require('fs');

async function createCToken() {
    // Connect to mainnet
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Load wallet (your authority)
    const secretKey = JSON.parse(fs.readFileSync('/Users/leonmcdanels/.config/solana/id.json'));
    const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
    
    console.log('🚀 Creating $C Token on Mainnet...');
    console.log('Authority Wallet:', payer.publicKey.toString());
    console.log('Target Founder Wallet: BbBg...CgAn (your connected Phantom wallet)');
    
    // Create mint with total supply of 1 billion tokens
    const mint = await createMint(
        connection,
        payer,
        payer.publicKey, // mint authority 
        payer.publicKey, // freeze authority
        9 // decimals
    );
    
    console.log('✅ $C Token Mint Created:', mint.toString());
    
    // Create founder token account (300M tokens)
    const founderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
    );
    
    // Mint 300 million tokens to founder (you)
    const founderAmount = 300000000n * 1000000000n; // 300M tokens with 9 decimals
    await mintTo(
        connection,
        payer,
        mint,
        founderTokenAccount.address,
        payer,
        founderAmount
    );
    
    console.log('💰 Minted 300M $C tokens to founder:', founderTokenAccount.address.toString());
    
    // Create protocol vault for remaining 700M tokens (for burns and liquidity)
    const protocolVault = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey // For now, same wallet controls protocol vault
    );
    
    // Mint remaining 700M tokens to protocol vault
    const protocolAmount = 700000000n * 1000000000n; // 700M tokens with 9 decimals
    await mintTo(
        connection,
        payer,
        mint,
        protocolVault.address,
        payer,
        protocolAmount
    );
    
    console.log('🏦 Minted 700M $C tokens to protocol vault:', protocolVault.address.toString());
    
    // Save token info to file for system integration
    const tokenInfo = {
        mint: mint.toString(),
        founderAccount: founderTokenAccount.address.toString(),
        protocolVault: protocolVault.address.toString(),
        totalSupply: '1000000000',
        founderTokens: '300000000',
        protocolTokens: '700000000',
        decimals: 9,
        createdAt: new Date().toISOString(),
        authority: payer.publicKey.toString()
    };
    
    fs.writeFileSync('token-info.json', JSON.stringify(tokenInfo, null, 2));
    
    console.log('');
    console.log('🎉 $C Token Creation Complete!');
    console.log('================================');
    console.log('Token Mint:', mint.toString());
    console.log('Your Balance: 300,000,000 $C');
    console.log('Protocol Vault: 700,000,000 $C');
    console.log('Total Supply: 1,000,000,000 $C');
    console.log('Info saved to: token-info.json');
    
    return tokenInfo;
}

createCToken().catch(console.error);