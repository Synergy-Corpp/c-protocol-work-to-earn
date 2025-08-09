use anchor_lang::prelude::*;

declare_id!("CoinF1ipGameProgram11111111111111111111111");

#[program]
pub mod coin_flip_game {
    use super::*;

    pub fn initialize_game(ctx: Context<InitializeGame>) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        game_state.house_edge = 200; // 2% house edge
        game_state.min_bet = 1_000_000; // 0.001 SOL in lamports
        game_state.max_bet = 1_000_000_000; // 1 SOL in lamports
        game_state.total_games = 0;
        game_state.house_balance = 0;
        Ok(())
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        bet_amount: u64,
        choice: bool, // true = heads, false = tails
    ) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        
        require!(
            bet_amount >= game_state.min_bet && bet_amount <= game_state.max_bet,
            CoinFlipError::InvalidBetAmount
        );

        // Generate pseudo-random number using recent slot hash
        let clock = Clock::get()?;
        let recent_slot_hash = clock.slot;
        let random_seed = recent_slot_hash
            .wrapping_mul(game_state.total_games + 1)
            .wrapping_add(bet_amount);
        
        let flip_result = (random_seed % 2) == 0; // true = heads, false = tails
        let player_won = choice == flip_result;

        // Update house balance (simplified for testing)
        if player_won {
            let house_fee = (bet_amount * game_state.house_edge) / 10000;
            let payout = bet_amount * 2 - house_fee;
            game_state.house_balance = game_state.house_balance.saturating_sub(payout - bet_amount);
        } else {
            game_state.house_balance = game_state.house_balance.saturating_add(bet_amount);
        }

        game_state.total_games += 1;

        emit!(GameResult {
            player: ctx.accounts.player.key(),
            bet_amount,
            choice,
            flip_result,
            player_won,
            game_number: game_state.total_games,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GameState::INIT_SPACE
    )]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub player: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct GameState {
    pub house_edge: u16,        // Basis points (e.g., 200 = 2%)
    pub min_bet: u64,           // Minimum bet in lamports
    pub max_bet: u64,           // Maximum bet in lamports
    pub total_games: u64,       // Total number of games played
    pub house_balance: u64,     // Current house balance
}

#[event]
pub struct GameResult {
    pub player: Pubkey,
    pub bet_amount: u64,
    pub choice: bool,           // true = heads, false = tails
    pub flip_result: bool,      // true = heads, false = tails
    pub player_won: bool,
    pub game_number: u64,
}

#[error_code]
pub enum CoinFlipError {
    #[msg("Bet amount must be between minimum and maximum limits")]
    InvalidBetAmount,
}