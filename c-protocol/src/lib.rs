use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo};

declare_id!("CProtoco1WorkChain11111111111111111111111");

#[program]
pub mod c_protocol {
    use super::*;

    pub fn initialize_protocol(ctx: Context<InitializeProtocol>) -> Result<()> {
        let protocol_state = &mut ctx.accounts.protocol_state;
        protocol_state.total_work_recorded = 0;
        protocol_state.total_tokens_emitted = 0;
        protocol_state.decay_rate = 100; // 1% per epoch
        protocol_state.witness_threshold = 6000; // 60% consensus required
        protocol_state.min_stake_to_emit = 1_000_000; // 0.001 SOL
        Ok(())
    }

    pub fn record_work(
        ctx: Context<RecordWork>,
        work_type: WorkType,
        effort_weight: u64,
        task_metadata: String,
    ) -> Result<()> {
        let worker = &mut ctx.accounts.worker;
        let protocol_state = &mut ctx.accounts.protocol_state;
        
        // Anti-gaming: Check if user has minimum stake
        require!(
            worker.staked_amount >= protocol_state.min_stake_to_emit,
            CProtocolError::InsufficientStake
        );

        // Anti-gaming: Prevent duplicate tasks within cooldown
        let clock = Clock::get()?;
        let task_hash = hash_task(&work_type, &task_metadata, worker.key());
        
        require!(
            !worker.recent_tasks.contains(&task_hash) ||
            clock.unix_timestamp > worker.last_work_timestamp + get_cooldown(&work_type),
            CProtocolError::TaskCooldownActive
        );

        // Calculate emission based on work type and effort weight
        let base_emission = get_base_emission(&work_type);
        let emission_amount = base_emission
            .checked_mul(effort_weight)
            .ok_or(CProtocolError::MathOverflow)?
            .checked_div(100)
            .ok_or(CProtocolError::MathOverflow)?;

        // Update worker state
        worker.total_work_completed += 1;
        worker.last_work_timestamp = clock.unix_timestamp;
        worker.pending_tokens += emission_amount;
        worker.work_diversity_score = calculate_diversity_score(&worker.work_history, &work_type);
        
        // Add to recent tasks for anti-gaming
        if worker.recent_tasks.len() >= 10 {
            worker.recent_tasks.remove(0);
        }
        worker.recent_tasks.push(task_hash);
        
        // Add to work history
        worker.work_history.push(WorkRecord {
            work_type,
            effort_weight,
            timestamp: clock.unix_timestamp,
            emission_amount,
            metadata_hash: hash_string(&task_metadata),
        });

        // Update protocol stats
        protocol_state.total_work_recorded += 1;
        protocol_state.total_tokens_emitted += emission_amount;

        emit!(WorkRecorded {
            worker: worker.key(),
            work_type,
            effort_weight,
            emission_amount,
            timestamp: clock.unix_timestamp,
            requires_witness: emission_amount > 1_000_000_000, // High-value needs consensus
        });

        Ok(())
    }

    pub fn apply_decay(ctx: Context<ApplyDecay>) -> Result<()> {
        let worker = &mut ctx.accounts.worker;
        let protocol_state = &ctx.accounts.protocol_state;
        let clock = Clock::get()?;

        // Calculate time since last activity
        let time_inactive = clock.unix_timestamp - worker.last_activity_timestamp;
        let epochs_inactive = time_inactive / 86400; // 1 day = 1 epoch

        if epochs_inactive > 0 {
            // Apply exponential decay
            let decay_multiplier = protocol_state.decay_rate as u64;
            let decay_amount = worker.pending_tokens
                .checked_mul(decay_multiplier)
                .ok_or(CProtocolError::MathOverflow)?
                .checked_mul(epochs_inactive as u64)
                .ok_or(CProtocolError::MathOverflow)?
                .checked_div(10000)
                .ok_or(CProtocolError::MathOverflow)?;

            worker.pending_tokens = worker.pending_tokens.saturating_sub(decay_amount);
            worker.total_tokens_decayed += decay_amount;

            emit!(TokensDecayed {
                worker: worker.key(),
                decay_amount,
                remaining_balance: worker.pending_tokens,
                epochs_inactive: epochs_inactive as u64,
            });
        }

        worker.last_decay_check = clock.unix_timestamp;
        Ok(())
    }

    pub fn mint_with_consensus(
        ctx: Context<MintWithConsensus>,
        amount: u64,
        witness_signatures: Vec<WitnessSignature>,
    ) -> Result<()> {
        let protocol_state = &ctx.accounts.protocol_state;
        
        // Verify witness consensus
        let total_weight = witness_signatures.iter().map(|w| w.weight).sum::<u64>();
        require!(
            total_weight >= protocol_state.witness_threshold,
            CProtocolError::InsufficientConsensus
        );

        // Verify each signature
        for signature in &witness_signatures {
            require!(
                verify_witness_signature(signature, amount, ctx.accounts.worker.key()),
                CProtocolError::InvalidWitnessSignature
            );
        }

        // Mint tokens to worker
        let cpi_accounts = MintTo {
            mint: ctx.accounts.c_token_mint.to_account_info(),
            to: ctx.accounts.worker_token_account.to_account_info(),
            authority: ctx.accounts.protocol_authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;

        // Update worker pending tokens
        let worker = &mut ctx.accounts.worker;
        worker.pending_tokens = worker.pending_tokens.saturating_sub(amount);
        worker.total_tokens_minted += amount;

        emit!(TokensMinted {
            worker: worker.key(),
            amount,
            witness_count: witness_signatures.len() as u8,
            consensus_weight: total_weight,
        });

        Ok(())
    }

    pub fn stake_to_emit(ctx: Context<StakeToEmit>, amount: u64) -> Result<()> {
        let worker = &mut ctx.accounts.worker;
        
        // Transfer stake to protocol
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.worker_token_account.to_account_info(),
            to: ctx.accounts.protocol_vault.to_account_info(),
            authority: ctx.accounts.worker_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        worker.staked_amount += amount;
        worker.stake_timestamp = Clock::get()?.unix_timestamp;

        emit!(WorkerStaked {
            worker: worker.key(),
            amount,
            total_staked: worker.staked_amount,
        });

        Ok(())
    }
}

// Data Structures
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum WorkType {
    OnboardUser,
    CreateContent,
    WriteCode,
    ReferClient,
    CloseDeal,
    CommunityManagement,
    BugReport,
    Documentation,
    Marketing,
    UserSupport,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct WorkRecord {
    pub work_type: WorkType,
    pub effort_weight: u64,
    pub timestamp: i64,
    pub emission_amount: u64,
    pub metadata_hash: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct WitnessSignature {
    pub witness_pubkey: Pubkey,
    pub weight: u64, // Voting power
    pub signature: [u8; 64],
    pub timestamp: i64,
}

// Account Structures
#[account]
pub struct ProtocolState {
    pub total_work_recorded: u64,
    pub total_tokens_emitted: u64,
    pub decay_rate: u16, // Basis points per epoch
    pub witness_threshold: u64, // Minimum consensus weight
    pub min_stake_to_emit: u64,
}

#[account]
pub struct Worker {
    pub total_work_completed: u64,
    pub last_work_timestamp: i64,
    pub last_activity_timestamp: i64,
    pub last_decay_check: i64,
    pub pending_tokens: u64,
    pub total_tokens_minted: u64,
    pub total_tokens_decayed: u64,
    pub staked_amount: u64,
    pub stake_timestamp: i64,
    pub work_diversity_score: u64,
    pub work_history: Vec<WorkRecord>,
    pub recent_tasks: Vec<u64>, // Task hashes for anti-gaming
}

// Context Structures
#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 64
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordWork<'info> {
    #[account(
        mut,
        constraint = worker.key() == authority.key()
    )]
    pub worker: Account<'info, Worker>,
    #[account(mut)]
    pub protocol_state: Account<'info, ProtocolState>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ApplyDecay<'info> {
    #[account(mut)]
    pub worker: Account<'info, Worker>,
    pub protocol_state: Account<'info, ProtocolState>,
}

#[derive(Accounts)]
pub struct MintWithConsensus<'info> {
    #[account(mut)]
    pub worker: Account<'info, Worker>,
    #[account(mut)]
    pub worker_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub c_token_mint: Account<'info, Mint>,
    pub protocol_state: Account<'info, ProtocolState>,
    /// CHECK: Protocol authority PDA
    pub protocol_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct StakeToEmit<'info> {
    #[account(mut)]
    pub worker: Account<'info, Worker>,
    #[account(mut)]
    pub worker_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub protocol_vault: Account<'info, TokenAccount>,
    pub worker_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// Events
#[event]
pub struct WorkRecorded {
    pub worker: Pubkey,
    pub work_type: WorkType,
    pub effort_weight: u64,
    pub emission_amount: u64,
    pub timestamp: i64,
    pub requires_witness: bool,
}

#[event]
pub struct TokensDecayed {
    pub worker: Pubkey,
    pub decay_amount: u64,
    pub remaining_balance: u64,
    pub epochs_inactive: u64,
}

#[event]
pub struct TokensMinted {
    pub worker: Pubkey,
    pub amount: u64,
    pub witness_count: u8,
    pub consensus_weight: u64,
}

#[event]
pub struct WorkerStaked {
    pub worker: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
}

// Helper Functions
fn get_base_emission(work_type: &WorkType) -> u64 {
    match work_type {
        WorkType::OnboardUser => 500_000, // 0.0005 tokens
        WorkType::CreateContent => 1_000_000, // 0.001 tokens
        WorkType::WriteCode => 2_000_000, // 0.002 tokens
        WorkType::ReferClient => 5_000_000, // 0.005 tokens
        WorkType::CloseDeal => 10_000_000, // 0.01 tokens
        WorkType::CommunityManagement => 750_000,
        WorkType::BugReport => 1_500_000,
        WorkType::Documentation => 800_000,
        WorkType::Marketing => 1_200_000,
        WorkType::UserSupport => 600_000,
    }
}

fn get_cooldown(work_type: &WorkType) -> i64 {
    match work_type {
        WorkType::OnboardUser => 3600, // 1 hour
        WorkType::CreateContent => 7200, // 2 hours
        WorkType::WriteCode => 1800, // 30 minutes
        WorkType::ReferClient => 86400, // 24 hours
        WorkType::CloseDeal => 86400, // 24 hours
        _ => 3600, // Default 1 hour
    }
}

fn hash_task(work_type: &WorkType, metadata: &str, worker: Pubkey) -> u64 {
    // Simple hash for demo - use proper cryptographic hash in production
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    use std::hash::{Hash, Hasher};
    work_type.hash(&mut hasher);
    metadata.hash(&mut hasher);
    worker.hash(&mut hasher);
    hasher.finish()
}

fn hash_string(s: &str) -> u64 {
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    use std::hash::{Hash, Hasher};
    s.hash(&mut hasher);
    hasher.finish()
}

fn calculate_diversity_score(history: &[WorkRecord], new_work: &WorkType) -> u64 {
    let mut unique_types = std::collections::HashSet::new();
    for record in history {
        unique_types.insert(&record.work_type);
    }
    unique_types.insert(new_work);
    (unique_types.len() as u64) * 100 // Score based on diversity
}

fn verify_witness_signature(_signature: &WitnessSignature, _amount: u64, _worker: Pubkey) -> bool {
    // Placeholder - implement proper signature verification
    true
}

// Error Codes
#[error_code]
pub enum CProtocolError {
    #[msg("Insufficient stake to emit tokens")]
    InsufficientStake,
    #[msg("Task cooldown period still active")]
    TaskCooldownActive,
    #[msg("Mathematical overflow occurred")]
    MathOverflow,
    #[msg("Insufficient witness consensus")]
    InsufficientConsensus,
    #[msg("Invalid witness signature")]
    InvalidWitnessSignature,
}