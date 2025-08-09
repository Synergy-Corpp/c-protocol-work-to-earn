#!/usr/bin/env node

const { Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const { 
    getOrCreateAssociatedTokenAccount, 
    transfer, 
    TOKEN_PROGRAM_ID,
    getAccount 
} = require('@solana/spl-token');
const fs = require('fs');

class RaydiumPoolCreator {
    constructor() {
        this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        this.authority = null;
        this.cTokenMint = 'FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP'; // Your $C token
        
        // Mirror pools configuration
        this.pools = {
            'SOL': {
                symbol: 'SOL',
                mint: 'So11111111111111111111111111111111111111112', // Wrapped SOL
                allocation: 1.0, // Start with 100% SOL pool only
                initialCTokens: 100000, // 100k $C tokens (micro pool)
                initialPairedAmount: 0.15, // 0.15 SOL (save 0.05 for fees)
                decimals: 9
            }
        };
    }

    async initialize() {
        try {
            // Load your authority keypair
            const secretKey = JSON.parse(fs.readFileSync('/Users/leonmcdanels/.config/solana/id.json'));
            this.authority = Keypair.fromSecretKey(new Uint8Array(secretKey));
            
            console.log('🏦 Raydium Pool Creator Initialized');
            console.log('Authority:', this.authority.publicKey.toString());
            console.log('$C Token:', this.cTokenMint);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize:', error);
            return false;
        }
    }

    async checkBalances() {
        console.log('\n💰 Checking your token balances...');
        
        try {
            // Check $C token balance
            const cTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.connection,
                this.authority,
                new PublicKey(this.cTokenMint),
                this.authority.publicKey
            );
            
            const cBalance = await getAccount(this.connection, cTokenAccount.address);
            const cTokenBalance = Number(cBalance.amount) / Math.pow(10, 9);
            
            console.log(`$C Tokens: ${cTokenBalance.toLocaleString()}`);
            
            if (cTokenBalance < 100000) { // Less than 100k
                console.log('⚠️ You need at least 100k $C tokens for micro pool');
                return false;
            }
            
            // Check SOL balance
            const solBalance = await this.connection.getBalance(this.authority.publicKey);
            const solAmount = solBalance / 1e9;
            console.log(`SOL Balance: ${solAmount.toFixed(2)}`);
            
            if (solAmount < 0.2) { // Need at least 0.2 SOL for micro pool + fees
                console.log('⚠️ You need at least 0.2 SOL for micro pool creation');
                console.log('💡 Micro pool: 0.15 SOL + 0.05 SOL fees');
                return false;
            } else {
                console.log('✅ Sufficient SOL for MICRO pool creation');
                console.log('💡 Starting with small $C/SOL pool - can expand later');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Balance check failed:', error);
            return false;
        }
    }

    async createPool(poolConfig) {
        const { symbol, mint, initialCTokens, initialPairedAmount, decimals } = poolConfig;
        
        console.log(`\n🔄 Creating ${symbol} pool...`);
        console.log(`   $C Tokens: ${initialCTokens.toLocaleString()}`);
        console.log(`   ${symbol}: ${initialPairedAmount.toLocaleString()}`);
        
        try {
            // Create token accounts
            const cTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.connection,
                this.authority,
                new PublicKey(this.cTokenMint),
                this.authority.publicKey
            );
            
            const pairedTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.connection,
                this.authority,
                new PublicKey(mint),
                this.authority.publicKey
            );
            
            console.log(`   $C Token Account: ${cTokenAccount.address.toString()}`);
            console.log(`   ${symbol} Token Account: ${pairedTokenAccount.address.toString()}`);
            
            // For now, log the pool creation parameters
            // In production, you'd use Raydium SDK to create the actual AMM pool
            
            console.log(`✅ ${symbol} pool configuration ready`);
            console.log(`   Pool would be created with:`);
            console.log(`   - ${initialCTokens.toLocaleString()} $C tokens`);
            console.log(`   - ${initialPairedAmount.toLocaleString()} ${symbol}`);
            console.log(`   - Initial price: ~$${(initialPairedAmount * this.getTokenPrice(symbol) / initialCTokens).toFixed(8)} per $C`);
            
            return {
                success: true,
                symbol,
                cTokenAccount: cTokenAccount.address.toString(),
                pairedTokenAccount: pairedTokenAccount.address.toString(),
                poolId: `${this.cTokenMint}_${mint}` // Simulated pool ID
            };
            
        } catch (error) {
            console.error(`❌ ${symbol} pool creation failed:`, error);
            return { success: false, symbol, error: error.message };
        }
    }

    getTokenPrice(symbol) {
        // Approximate current prices for calculation
        const prices = {
            'SOL': 200,
            'USDC': 1,  
            'BTC': 40000,
            'ETH': 2500,
            'RAY': 2
        };
        return prices[symbol] || 1;
    }

    async createAllPools() {
        console.log('🚀 Creating All Mirror Liquidity Pools...');
        console.log('=====================================');
        
        const results = [];
        
        for (const [symbol, config] of Object.entries(this.pools)) {
            const result = await this.createPool(config);
            results.push(result);
            
            // Add delay between pool creations
            if (result.success) {
                console.log(`✅ ${symbol} pool ready`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Save pool configuration
        const poolsConfig = {
            cToken: this.cTokenMint,
            authority: this.authority.publicKey.toString(),
            pools: results.filter(r => r.success),
            created: new Date().toISOString(),
            totalCTokensAllocated: Object.values(this.pools).reduce((sum, p) => sum + p.initialCTokens, 0),
            estimatedValue: this.calculateTotalValue()
        };
        
        fs.writeFileSync('created-pools.json', JSON.stringify(poolsConfig, null, 2));
        
        console.log('\n🎉 Pool Creation Summary:');
        console.log('========================');
        console.log(`✅ Pools Created: ${results.filter(r => r.success).length}/5`);
        console.log(`💰 Total $C Allocated: ${poolsConfig.totalCTokensAllocated.toLocaleString()}`);
        console.log(`📊 Estimated Pool Value: $${poolsConfig.estimatedValue.toLocaleString()}`);
        console.log('📄 Configuration saved to: created-pools.json');
        
        return poolsConfig;
    }

    calculateTotalValue() {
        let total = 0;
        for (const config of Object.values(this.pools)) {
            const tokenPrice = this.getTokenPrice(config.symbol);
            total += config.initialPairedAmount * tokenPrice;
        }
        return Math.round(total);
    }

    async deployPools() {
        const initialized = await this.initialize();
        if (!initialized) return;
        
        const balancesOk = await this.checkBalances();
        if (!balancesOk) return;
        
        console.log('\n⚠️  IMPORTANT NOTES:');
        console.log('===================');
        console.log('This script prepares pool configurations.');
        console.log('To create ACTUAL Raydium pools, you need to:');
        console.log('1. Use Raydium\'s official pool creation interface');
        console.log('2. Or integrate with @raydium-io/raydium-sdk');
        console.log('3. Pay pool creation fees (~0.4 SOL per pool)');
        console.log('4. Provide initial liquidity for each pair');
        
        console.log('\n🚀 Proceeding with configuration...');
        
        return await this.createAllPools();
    }
}

// Run if called directly
if (require.main === module) {
    const creator = new RaydiumPoolCreator();
    creator.deployPools().catch(console.error);
}

module.exports = RaydiumPoolCreator;