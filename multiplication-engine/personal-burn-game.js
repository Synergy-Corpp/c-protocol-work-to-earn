#!/usr/bin/env node

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { burn, getOrCreateAssociatedTokenAccount, getMint, getAccount } = require('@solana/spl-token');
const fs = require('fs');
const readline = require('readline');

class PersonalBurnGame {
    constructor() {
        this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        this.tokenMint = new PublicKey('FJN3K5v3jFb9gEaf9y85X3iUEJEWjKhaP8ufCMhSHfiP');
        this.authority = null;
        this.gameSession = {
            totalBurned: 0,
            gamesPlayed: 0,
            totalRewards: 0,
            streak: 0
        };
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async initialize() {
        try {
            const secretKey = JSON.parse(fs.readFileSync('/Users/leonmcdanels/.config/solana/id.json'));
            this.authority = Keypair.fromSecretKey(new Uint8Array(secretKey));
            
            console.log('🎮 PERSONAL BURN GAME INITIALIZED');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🔥 Your Private Token Burn Casino`);
            console.log(`Authority: ${this.authority.publicKey.toString()}`);
            console.log(`Token: ${this.tokenMint.toString()}`);
            console.log(`⚠️  REAL BURNS - TOKENS PERMANENTLY DESTROYED ON PLAY`);
            
            return true;
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            return false;
        }
    }

    async getCurrentStats() {
        try {
            const mintInfo = await getMint(this.connection, this.tokenMint);
            const currentSupply = Number(mintInfo.supply) / (10 ** mintInfo.decimals);
            
            const authorityTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.connection,
                this.authority,
                this.tokenMint,
                this.authority.publicKey
            );
            
            const accountInfo = await getAccount(this.connection, authorityTokenAccount.address);
            const availableTokens = Number(accountInfo.amount) / (10 ** 9);
            
            return {
                currentSupply,
                availableTokens,
                marketCap: currentSupply * 0.000236
            };
        } catch (error) {
            console.error('Stats error:', error);
            return null;
        }
    }

    async playBurnCoinFlip() {
        console.log('\\n🪙 BURN COIN FLIP');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const stats = await this.getCurrentStats();
        if (!stats) return false;
        
        console.log(`Current Supply: ${stats.currentSupply.toLocaleString()} tokens`);
        console.log(`Your Balance: ${stats.availableTokens.toLocaleString()} tokens`);
        console.log(`Market Cap: $${stats.marketCap.toFixed(0)}`);
        
        return new Promise((resolve) => {
            this.rl.question('\\n🎯 Choose: (H)eads or (T)ails? ', async (choice) => {
                if (!['h', 't', 'heads', 'tails'].includes(choice.toLowerCase())) {
                    console.log('❌ Invalid choice. Choose H or T');
                    resolve(false);
                    return;
                }
                
                const playerChoice = choice.toLowerCase().startsWith('h') ? 'heads' : 'tails';
                const result = Math.random() > 0.5 ? 'heads' : 'tails';
                const won = playerChoice === result;
                
                console.log(`\\n🪙 Coin lands on: ${result.toUpperCase()}`);
                
                if (won) {
                    console.log('🎉 YOU WIN!');
                    await this.executeWinBurn();
                    this.gameSession.streak++;
                } else {
                    console.log('💀 YOU LOSE!');
                    await this.executeLossBurn();
                    this.gameSession.streak = 0;
                }
                
                this.gameSession.gamesPlayed++;
                resolve(true);
            });
        });
    }

    async playBurnSlotMachine() {
        console.log('\\n🎰 BURN SLOT MACHINE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const symbols = ['🔥', '💎', '🚀', '⚡', '🎯', '💰'];
        const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
        const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
        const reel3 = symbols[Math.floor(Math.random() * symbols.length)];
        
        console.log('\\n🎰 Spinning...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`\\n[${reel1}] [${reel2}] [${reel3}]`);
        
        if (reel1 === reel2 && reel2 === reel3) {
            console.log('🎊 JACKPOT! THREE MATCHING SYMBOLS!');
            await this.executeJackpotBurn();
            this.gameSession.streak += 3;
        } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
            console.log('🎉 PARTIAL WIN! Two matching symbols!');
            await this.executeWinBurn();
            this.gameSession.streak++;
        } else {
            console.log('💀 NO MATCH - Better luck next time!');
            await this.executeLossBurn();
            this.gameSession.streak = 0;
        }
        
        this.gameSession.gamesPlayed++;
        return true;
    }

    async playBurnRoulette() {
        console.log('\\n🎡 BURN ROULETTE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        return new Promise((resolve) => {
            this.rl.question('\\n🎯 Bet on: (R)ed, (B)lack, or (G)reen (0)? ', async (choice) => {
                if (!['r', 'b', 'g', '0', 'red', 'black', 'green'].includes(choice.toLowerCase())) {
                    console.log('❌ Invalid choice. Choose R, B, or G/0');
                    resolve(false);
                    return;
                }
                
                const number = Math.floor(Math.random() * 37); // 0-36
                let color;
                if (number === 0) color = 'green';
                else if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number)) color = 'red';
                else color = 'black';
                
                const playerBet = choice.toLowerCase().startsWith('r') ? 'red' : 
                                 choice.toLowerCase().startsWith('b') ? 'black' : 'green';
                
                console.log(`\\n🎡 Ball lands on: ${number} ${color.toUpperCase()}`);
                
                if (playerBet === color) {
                    if (color === 'green') {
                        console.log('🎊 GREEN JACKPOT! 35:1 PAYOUT!');
                        await this.executeJackpotBurn();
                        this.gameSession.streak += 5;
                    } else {
                        console.log('🎉 COLOR WIN! 2:1 PAYOUT!');
                        await this.executeWinBurn();
                        this.gameSession.streak++;
                    }
                } else {
                    console.log('💀 WRONG COLOR!');
                    await this.executeLossBurn();
                    this.gameSession.streak = 0;
                }
                
                this.gameSession.gamesPlayed++;
                resolve(true);
            });
        });
    }

    async executeWinBurn() {
        const burnAmount = 500000; // 500K tokens for wins
        const multiplier = Math.min(1 + (this.gameSession.streak * 0.1), 3); // Max 3x
        const actualBurn = Math.floor(burnAmount * multiplier);
        
        console.log(`\\n🔥 WIN BURN: ${actualBurn.toLocaleString()} tokens`);
        if (this.gameSession.streak > 0) {
            console.log(`🔥 Streak multiplier: ${multiplier.toFixed(1)}x`);
        }
        
        await this.executeBurn(actualBurn, 'win');
    }

    async executeLossBurn() {
        const burnAmount = 250000; // 250K tokens for losses
        console.log(`\\n🔥 LOSS BURN: ${burnAmount.toLocaleString()} tokens`);
        console.log('💀 Even losses burn the supply!');
        
        await this.executeBurn(burnAmount, 'loss');
    }

    async executeJackpotBurn() {
        const burnAmount = 2000000; // 2M tokens for jackpots
        console.log(`\\n🔥 JACKPOT BURN: ${burnAmount.toLocaleString()} tokens`);
        console.log('🎊 MEGA DEFLATION EVENT!');
        
        await this.executeBurn(burnAmount, 'jackpot');
    }

    async executeBurn(amount, type) {
        try {
            const authorityTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.connection,
                this.authority,
                this.tokenMint,
                this.authority.publicKey
            );
            
            console.log('🔥 EXECUTING REAL BURN...');
            const burnSignature = await burn(
                this.connection,
                this.authority,
                authorityTokenAccount.address,
                this.tokenMint,
                this.authority,
                amount * (10 ** 9)
            );
            
            console.log(`✅ BURN COMPLETED!`);
            console.log(`Transaction: ${burnSignature}`);
            console.log(`🔥 ${amount.toLocaleString()} tokens PERMANENTLY DESTROYED`);
            
            this.gameSession.totalBurned += amount;
            const burnValue = amount * 0.000236;
            this.gameSession.totalRewards += burnValue;
            
            // Log game burn
            const gameRecord = {
                timestamp: new Date().toISOString(),
                gameType: type,
                burnedTokens: amount,
                burnValue: burnValue,
                signature: burnSignature,
                streak: this.gameSession.streak,
                totalGameBurns: this.gameSession.totalBurned
            };
            
            let gameLog = [];
            if (fs.existsSync('game-burn-log.json')) {
                gameLog = JSON.parse(fs.readFileSync('game-burn-log.json'));
            }
            gameLog.push(gameRecord);
            fs.writeFileSync('game-burn-log.json', JSON.stringify(gameLog, null, 2));
            
        } catch (error) {
            console.error('❌ Burn failed:', error);
        }
    }

    async showGameMenu() {
        console.log('\\n🎮 PERSONAL BURN CASINO');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Games Played: ${this.gameSession.gamesPlayed}`);
        console.log(`Total Burned: ${this.gameSession.totalBurned.toLocaleString()} tokens`);
        console.log(`Deflation Value: $${this.gameSession.totalRewards.toFixed(2)}`);
        console.log(`Current Streak: ${this.gameSession.streak}`);
        console.log('');
        console.log('🎯 Choose your game:');
        console.log('1. 🪙 Coin Flip (500K-1.5M burn)');
        console.log('2. 🎰 Slot Machine (250K-2M burn)');
        console.log('3. 🎡 Roulette (250K-10M burn)');
        console.log('4. 📊 View Stats');
        console.log('5. 🚪 Exit');
        
        return new Promise((resolve) => {
            this.rl.question('\\nEnter choice (1-5): ', (choice) => {
                resolve(choice);
            });
        });
    }

    async startPersonalGame() {
        console.log('\\n🎮 WELCOME TO YOUR PERSONAL BURN CASINO');
        console.log('Every game burns tokens from YOUR supply!');
        console.log('Wins burn more, losses still burn the supply!');
        console.log('🔥 Pure deflationary gaming 🔥');
        
        while (true) {
            const choice = await this.showGameMenu();
            
            switch (choice) {
                case '1':
                    await this.playBurnCoinFlip();
                    break;
                case '2':
                    await this.playBurnSlotMachine();
                    break;
                case '3':
                    await this.playBurnRoulette();
                    break;
                case '4':
                    const stats = await this.getCurrentStats();
                    if (stats) {
                        console.log('\\n📊 CURRENT STATS:');
                        console.log(`Supply: ${stats.currentSupply.toLocaleString()} tokens`);
                        console.log(`Your Balance: ${stats.availableTokens.toLocaleString()} tokens`);
                        console.log(`Market Cap: $${stats.marketCap.toFixed(0)}`);
                    }
                    break;
                case '5':
                    console.log('\\n🎮 Thanks for playing your personal burn casino!');
                    console.log(`Final Stats: ${this.gameSession.gamesPlayed} games, ${this.gameSession.totalBurned.toLocaleString()} tokens burned`);
                    this.rl.close();
                    return;
                default:
                    console.log('❌ Invalid choice. Please enter 1-5.');
            }
        }
    }
}

// Auto-start if run directly
if (require.main === module) {
    const game = new PersonalBurnGame();
    
    game.initialize().then(success => {
        if (success) {
            game.startPersonalGame();
        } else {
            console.error('❌ Failed to start personal burn game');
            process.exit(1);
        }
    });
}

module.exports = PersonalBurnGame;