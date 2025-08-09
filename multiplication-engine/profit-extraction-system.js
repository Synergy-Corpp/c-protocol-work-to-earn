#!/usr/bin/env node

const { Connection, PublicKey, Keypair, SystemProgram, Transaction } = require('@solana/web3.js');
const { 
    getOrCreateAssociatedTokenAccount, 
    transfer, 
    getMint,
    getAccount 
} = require('@solana/spl-token');
const fs = require('fs');

class ProfitExtractionSystem {
    constructor() {
        this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        this.tokenMint = new PublicKey('FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP');
        this.authority = null;
        
        // Profit extraction settings
        this.extractionSettings = {
            liquidityShare: 0.50,    // 50% to liquidity
            personalShare: 0.50,     // 50% for you
            minExtractionAmount: 100000, // 100K tokens minimum
            poolAddress: 'AWzDhpbRcudYMsg7kBtc4gJMnUD9ik9Jst11xj4g7ei3' // Your Raydium pool
        };
        
        this.realProfits = {
            extractedTokens: 0,
            liquidityAdded: 0,
            personalCashouts: 0,
            totalUSDValue: 0
        };
    }

    async initialize() {
        try {
            const secretKey = JSON.parse(fs.readFileSync('/Users/leonmcdanels/.config/solana/id.json'));
            this.authority = Keypair.fromSecretKey(new Uint8Array(secretKey));
            
            console.log('💰 PROFIT EXTRACTION SYSTEM INITIALIZED');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`Authority: ${this.authority.publicKey.toString()}`);
            console.log(`Token: ${this.tokenMint.toString()}`);
            console.log(`Pool: ${this.extractionSettings.poolAddress}`);
            console.log(`Split: ${this.extractionSettings.liquidityShare * 100}% liquidity | ${this.extractionSettings.personalShare * 100}% personal`);
            
            return true;
        } catch (error) {
            console.error('❌ Profit extraction system failed:', error);
            return false;
        }
    }

    async getCurrentTokenBalance() {
        try {
            const authorityTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.connection,
                this.authority,
                this.tokenMint,
                this.authority.publicKey
            );
            
            const accountInfo = await getAccount(this.connection, authorityTokenAccount.address);
            const balance = Number(accountInfo.amount) / (10 ** 9);
            
            return {
                balance: balance,
                tokenAccount: authorityTokenAccount.address
            };
        } catch (error) {
            console.error('Token balance check failed:', error);
            return null;
        }
    }

    async getCurrentSOLBalance() {
        try {
            const balance = await this.connection.getBalance(this.authority.publicKey);
            return balance / 1e9;
        } catch (error) {
            console.error('SOL balance check failed:', error);
            return 0;
        }
    }

    async extractProfitsFromTokens(extractionAmount) {
        console.log(`\\n💰 EXTRACTING PROFITS FROM TOKEN HOLDINGS`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        try {
            const tokenInfo = await this.getCurrentTokenBalance();
            if (!tokenInfo || tokenInfo.balance < extractionAmount) {
                console.log(`❌ Insufficient tokens. Have: ${tokenInfo?.balance.toLocaleString() || 0}, Need: ${extractionAmount.toLocaleString()}`);
                return false;
            }
            
            const currentPrice = 0.000236; // Current token price
            const extractionValue = extractionAmount * currentPrice;
            
            console.log(`Extracting: ${extractionAmount.toLocaleString()} tokens`);
            console.log(`Token value: $${extractionValue.toFixed(2)}`);
            
            // Split extraction
            const liquidityTokens = Math.floor(extractionAmount * this.extractionSettings.liquidityShare);
            const personalTokens = extractionAmount - liquidityTokens;
            
            console.log(`\\n📊 EXTRACTION BREAKDOWN:`);
            console.log(`Liquidity reserve: ${liquidityTokens.toLocaleString()} tokens ($${(liquidityTokens * currentPrice).toFixed(2)})`);
            console.log(`Personal cashout: ${personalTokens.toLocaleString()} tokens ($${(personalTokens * currentPrice).toFixed(2)})`);
            
            // Create separate token accounts for liquidity and personal use
            const liquidityTokenAccount = await this.createOrGetLiquidityAccount();
            const personalTokenAccount = await this.createOrGetPersonalAccount();
            
            // Transfer tokens to respective accounts
            if (liquidityTokens > 0) {
                await this.transferTokens(tokenInfo.tokenAccount, liquidityTokenAccount, liquidityTokens);
                console.log(`✅ ${liquidityTokens.toLocaleString()} tokens moved to liquidity reserve`);
            }
            
            if (personalTokens > 0) {
                await this.transferTokens(tokenInfo.tokenAccount, personalTokenAccount, personalTokens);
                console.log(`✅ ${personalTokens.toLocaleString()} tokens moved to personal account`);
            }
            
            // Update tracking
            this.realProfits.extractedTokens += extractionAmount;
            this.realProfits.liquidityAdded += liquidityTokens * currentPrice;
            this.realProfits.personalCashouts += personalTokens * currentPrice;
            this.realProfits.totalUSDValue += extractionValue;
            
            // Log extraction
            await this.logExtraction({
                timestamp: new Date().toISOString(),
                extractedTokens: extractionAmount,
                liquidityTokens: liquidityTokens,
                personalTokens: personalTokens,
                tokenPrice: currentPrice,
                totalValue: extractionValue
            });
            
            console.log(`\\n🎯 EXTRACTION COMPLETED SUCCESSFULLY`);
            return true;
            
        } catch (error) {
            console.error('❌ Profit extraction failed:', error);
            return false;
        }
    }

    async createOrGetLiquidityAccount() {
        // Create a separate account for liquidity tokens
        const liquidityKeypair = Keypair.generate();
        
        try {
            const liquidityTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.connection,
                this.authority,
                this.tokenMint,
                liquidityKeypair.publicKey
            );
            
            // Save liquidity account info
            const liquidityAccountInfo = {
                publicKey: liquidityKeypair.publicKey.toString(),
                secretKey: Array.from(liquidityKeypair.secretKey),
                tokenAccount: liquidityTokenAccount.address.toString(),
                purpose: 'liquidity_reserve'
            };
            
            fs.writeFileSync('liquidity-account.json', JSON.stringify(liquidityAccountInfo, null, 2));
            
            return liquidityTokenAccount.address;
        } catch (error) {
            console.error('Liquidity account creation failed:', error);
            throw error;
        }
    }

    async createOrGetPersonalAccount() {
        // Create a separate account for personal tokens
        const personalKeypair = Keypair.generate();
        
        try {
            const personalTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.connection,
                this.authority,
                this.tokenMint,
                personalKeypair.publicKey
            );
            
            // Save personal account info
            const personalAccountInfo = {
                publicKey: personalKeypair.publicKey.toString(),
                secretKey: Array.from(personalKeypair.secretKey),
                tokenAccount: personalTokenAccount.address.toString(),
                purpose: 'personal_cashout'
            };
            
            fs.writeFileSync('personal-account.json', JSON.stringify(personalAccountInfo, null, 2));
            
            return personalTokenAccount.address;
        } catch (error) {
            console.error('Personal account creation failed:', error);
            throw error;
        }
    }

    async transferTokens(fromAccount, toAccount, amount) {
        try {
            const transferSignature = await transfer(
                this.connection,
                this.authority,
                fromAccount,
                toAccount,
                this.authority,
                amount * (10 ** 9)
            );
            
            await this.connection.confirmTransaction(transferSignature);
            return transferSignature;
        } catch (error) {
            console.error('Token transfer failed:', error);
            throw error;
        }
    }

    async swapPersonalTokensToSOL(tokenAmount) {
        console.log(`\\n💱 SWAPPING PERSONAL TOKENS TO SOL`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        try {
            // Load personal account
            const personalAccountInfo = JSON.parse(fs.readFileSync('personal-account.json'));
            const personalKeypair = Keypair.fromSecretKey(new Uint8Array(personalAccountInfo.secretKey));
            
            console.log(`Swapping: ${tokenAmount.toLocaleString()} tokens`);
            console.log(`Expected SOL: ~${(tokenAmount * 0.000236 / 240).toFixed(4)} SOL`);
            
            // For now, simulate the swap (in production, use Jupiter API)
            const expectedSOL = tokenAmount * 0.000236 / 240;
            
            console.log(`\\n📊 SWAP SIMULATION:`);
            console.log(`✅ Would receive: ${expectedSOL.toFixed(4)} SOL`);
            console.log(`✅ USD value: $${(expectedSOL * 240).toFixed(2)}`);
            
            // In production, integrate with Jupiter aggregator:
            // const jupiterSwap = await this.executeJupiterSwap(tokenAmount);
            
            return {
                success: true,
                solReceived: expectedSOL,
                usdValue: expectedSOL * 240
            };
            
        } catch (error) {
            console.error('❌ Token to SOL swap failed:', error);
            return { success: false };
        }
    }

    async addLiquidityToPool(tokenAmount, solAmount) {
        console.log(`\\n🏊 ADDING LIQUIDITY TO POOL`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        try {
            console.log(`Adding to pool: AWzDhpbRcudYMsg7kBtc4gJMnUD9ik9Jst11xj4g7ei3`);
            console.log(`Tokens: ${tokenAmount.toLocaleString()}`);
            console.log(`SOL: ${solAmount.toFixed(4)}`);
            console.log(`Total value: $${((tokenAmount * 0.000236) + (solAmount * 240)).toFixed(2)}`);
            
            // For now, simulate liquidity addition (in production, use Raydium SDK)
            console.log(`\\n📊 LIQUIDITY ADDITION SIMULATION:`);
            console.log(`✅ Would increase pool depth by $${((tokenAmount * 0.000236) + (solAmount * 240)).toFixed(2)}`);
            console.log(`✅ Your LP token share: ~${(((tokenAmount * 0.000236) + (solAmount * 240)) / 29000 * 100).toFixed(4)}%`);
            
            // In production, integrate with Raydium:
            // const raydiumLiquidity = await this.executeRaydiumLiquidity(tokenAmount, solAmount);
            
            return {
                success: true,
                lpTokens: Math.floor(Math.random() * 1000000),
                poolValue: (tokenAmount * 0.000236) + (solAmount * 240)
            };
            
        } catch (error) {
            console.error('❌ Liquidity addition failed:', error);
            return { success: false };
        }
    }

    async logExtraction(extractionData) {
        let extractionLog = [];
        if (fs.existsSync('profit-extraction-log.json')) {
            extractionLog = JSON.parse(fs.readFileSync('profit-extraction-log.json'));
        }
        extractionLog.push(extractionData);
        fs.writeFileSync('profit-extraction-log.json', JSON.stringify(extractionLog, null, 2));
    }

    async showProfitExtractionMenu() {
        const tokenInfo = await this.getCurrentTokenBalance();
        const solBalance = await this.getCurrentSOLBalance();
        
        console.log(`\\n💰 PROFIT EXTRACTION SYSTEM`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Your token balance: ${tokenInfo?.balance.toLocaleString() || 0} tokens`);
        console.log(`Your SOL balance: ${solBalance.toFixed(4)} SOL`);
        console.log(`Token value: $${((tokenInfo?.balance || 0) * 0.000236).toFixed(2)}`);
        console.log(`\\nExtracted so far: ${this.realProfits.extractedTokens.toLocaleString()} tokens ($${this.realProfits.totalUSDValue.toFixed(2)})`);
        console.log(`Liquidity added: $${this.realProfits.liquidityAdded.toFixed(2)}`);
        console.log(`Personal cashouts: $${this.realProfits.personalCashouts.toFixed(2)}`);
        
        console.log(`\\n🎯 EXTRACTION OPTIONS:`);
        console.log(`1. Extract 1M tokens (50/50 split)`);
        console.log(`2. Extract 5M tokens (50/50 split)`); 
        console.log(`3. Extract 10M tokens (50/50 split)`);
        console.log(`4. Custom extraction amount`);
        console.log(`5. Swap personal tokens to SOL`);
        console.log(`6. Add liquidity to pool`);
        console.log(`7. View detailed stats`);
        console.log(`8. Exit`);
    }

    async startProfitExtractionSystem() {
        console.log(`\\n🚀 STARTING PROFIT EXTRACTION SYSTEM`);
        console.log(`This system converts your token holdings into:`);
        console.log(`• 50% liquidity reserves (for pool depth)`);
        console.log(`• 50% personal cashout (swap to SOL)`);
        console.log(`• Full control over extraction timing`);
        console.log(`• Manual liquidity management`);
        
        // Interactive menu would go here
        // For now, demonstrate with 1M token extraction
        console.log(`\\n🎯 DEMO: Extracting 1M tokens...`);
        await this.extractProfitsFromTokens(1000000);
        
        console.log(`\\n💱 DEMO: Swapping 500K personal tokens to SOL...`);
        await this.swapPersonalTokensToSOL(500000);
        
        console.log(`\\n🏊 DEMO: Adding liquidity with 500K tokens + 0.5 SOL...`);
        await this.addLiquidityToPool(500000, 0.5);
        
        console.log(`\\n✅ PROFIT EXTRACTION SYSTEM READY`);
        console.log(`Your tokens are now split into extractable profit streams!`);
    }
}

// Auto-start if run directly
if (require.main === module) {
    const profitSystem = new ProfitExtractionSystem();
    
    profitSystem.initialize().then(success => {
        if (success) {
            profitSystem.startProfitExtractionSystem();
        } else {
            console.error('❌ Failed to start profit extraction system');
            process.exit(1);
        }
    });
}

module.exports = ProfitExtractionSystem;