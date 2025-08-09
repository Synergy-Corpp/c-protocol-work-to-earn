use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

#[account]
pub struct SoulKey {
    pub owner: Pubkey,
    pub creation_timestamp: i64,
    pub last_evolution: i64,
    pub evolution_level: u8,
    pub trust_score: u64,
    pub fraud_resistance: u64,
    
    // Work metrics that shape the soul
    pub total_work_completed: u64,
    pub work_diversity_score: u64,
    pub consecutive_active_days: u32,
    pub tokens_earned_lifetime: u64,
    pub tokens_burned_by_decay: u64,
    pub pool_participation_count: u32,
    
    // Behavioral patterns
    pub average_task_completion_time: u64,
    pub collaboration_score: u64, // Based on multi-user tasks
    pub innovation_index: u64, // New work types introduced
    pub consistency_rating: u64, // Regular vs sporadic activity
    
    // Reputation and social proof
    pub witness_votes_received: u64,
    pub witness_votes_given: u64,
    pub referrals_made: u32,
    pub community_endorsements: u32,
    
    // Evolution traits (metadata that changes over time)
    pub dominant_work_type: WorkType,
    pub specialization_depth: u8, // How focused vs generalist
    pub leadership_indicator: bool,
    pub mentor_status: bool,
    
    // Visual/metadata evolution
    pub current_avatar_hash: u64,
    pub achievement_badges: Vec<Badge>,
    pub evolution_history: Vec<EvolutionEvent>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Badge {
    pub badge_type: BadgeType,
    pub earned_timestamp: i64,
    pub metadata: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum BadgeType {
    EarlyAdopter,
    ConsistentWorker,
    CodeMaster,
    CommunityBuilder,
    DealCloser,
    Mentor,
    Innovator,
    TrustWorthy,
    LiquidityProvider,
    WitnessReliable,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct EvolutionEvent {
    pub timestamp: i64,
    pub event_type: EvolutionType,
    pub trigger_data: String,
    pub old_level: u8,
    pub new_level: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum EvolutionType {
    LevelUp,
    SpecializationShift,
    TrustIncrease,
    LeadershipUnlock,
    MentorshipActivated,
    FraudPenalty,
    ConsistencyBonus,
}

use crate::WorkType;

impl SoulKey {
    pub fn new(owner: Pubkey, clock: &Clock) -> Self {
        Self {
            owner,
            creation_timestamp: clock.unix_timestamp,
            last_evolution: clock.unix_timestamp,
            evolution_level: 1,
            trust_score: 1000, // Start with base trust
            fraud_resistance: 100,
            
            total_work_completed: 0,
            work_diversity_score: 0,
            consecutive_active_days: 0,
            tokens_earned_lifetime: 0,
            tokens_burned_by_decay: 0,
            pool_participation_count: 0,
            
            average_task_completion_time: 0,
            collaboration_score: 0,
            innovation_index: 0,
            consistency_rating: 1000,
            
            witness_votes_received: 0,
            witness_votes_given: 0,
            referrals_made: 0,
            community_endorsements: 0,
            
            dominant_work_type: WorkType::OnboardUser, // Default starting type
            specialization_depth: 1,
            leadership_indicator: false,
            mentor_status: false,
            
            current_avatar_hash: Self::generate_initial_avatar(&owner),
            achievement_badges: Vec::new(),
            evolution_history: Vec::new(),
        }
    }
    
    pub fn update_after_work(&mut self, work_record: &crate::WorkRecord, clock: &Clock) -> Result<()> {
        // Update basic metrics
        self.total_work_completed += 1;
        self.tokens_earned_lifetime += work_record.emission_amount;
        
        // Track work type specialization
        self.update_specialization(&work_record.work_type);
        
        // Update consistency rating
        self.update_consistency(clock);
        
        // Check for evolution triggers
        self.check_evolution_triggers(clock)?;
        
        Ok(())
    }
    
    pub fn apply_decay_penalty(&mut self, decay_amount: u64) {
        self.tokens_burned_by_decay += decay_amount;
        
        // Decay affects trust score
        let trust_penalty = (decay_amount / 1_000_000).min(50);
        self.trust_score = self.trust_score.saturating_sub(trust_penalty);
        
        // Reset consistency if too much decay
        if decay_amount > 10_000_000 { // Large decay indicates inactivity
            self.consecutive_active_days = 0;
            self.consistency_rating = self.consistency_rating.saturating_sub(100);
        }
    }
    
    pub fn add_witness_vote(&mut self, is_giving: bool) {
        if is_giving {
            self.witness_votes_given += 1;
        } else {
            self.witness_votes_received += 1;
        }
        
        // Voting participation increases trust
        self.trust_score += 10;
    }
    
    pub fn add_pool_participation(&mut self) {
        self.pool_participation_count += 1;
        self.collaboration_score += 50;
    }
    
    fn update_specialization(&mut self, work_type: &WorkType) {
        // Track dominant work type
        // In a full implementation, you'd track frequencies of each type
        self.dominant_work_type = work_type.clone();
        
        // Update specialization depth based on diversity
        // More diverse = lower specialization, more focused = higher specialization
        if self.work_diversity_score > 800 {
            self.specialization_depth = 1; // Generalist
        } else if self.work_diversity_score < 300 {
            self.specialization_depth = self.specialization_depth.saturating_add(1).min(10); // Specialist
        }
    }
    
    fn update_consistency(&mut self, clock: &Clock) {
        let time_since_last = clock.unix_timestamp - self.last_evolution;
        let days_since = time_since_last / 86400;
        
        if days_since <= 1 {
            // Active within 24 hours
            self.consecutive_active_days += 1;
            self.consistency_rating += 10;
        } else if days_since > 7 {
            // Inactive for over a week
            self.consecutive_active_days = 0;
            self.consistency_rating = self.consistency_rating.saturating_sub(50);
        }
        
        self.last_evolution = clock.unix_timestamp;
    }
    
    fn check_evolution_triggers(&mut self, clock: &Clock) -> Result<()> {
        let mut evolved = false;
        let old_level = self.evolution_level;
        
        // Level up based on work completed
        let expected_level = ((self.total_work_completed / 100) + 1).min(50) as u8;
        if expected_level > self.evolution_level {
            self.evolution_level = expected_level;
            evolved = true;
            
            // Add level up badge
            self.achievement_badges.push(Badge {
                badge_type: BadgeType::ConsistentWorker,
                earned_timestamp: clock.unix_timestamp,
                metadata: format!("Reached level {}", expected_level),
            });
        }
        
        // Trust milestone achievements
        if self.trust_score >= 5000 && !self.has_badge(&BadgeType::TrustWorthy) {
            self.achievement_badges.push(Badge {
                badge_type: BadgeType::TrustWorthy,
                earned_timestamp: clock.unix_timestamp,
                metadata: "High trust score achieved".to_string(),
            });
        }
        
        // Consistency achievements
        if self.consecutive_active_days >= 30 && !self.has_badge(&BadgeType::ConsistentWorker) {
            self.achievement_badges.push(Badge {
                badge_type: BadgeType::ConsistentWorker,
                earned_timestamp: clock.unix_timestamp,
                metadata: "30 consecutive active days".to_string(),
            });
        }
        
        // Leadership unlock
        if self.witness_votes_given >= 100 && 
           self.community_endorsements >= 10 && 
           !self.leadership_indicator {
            self.leadership_indicator = true;
            evolved = true;
            
            self.achievement_badges.push(Badge {
                badge_type: BadgeType::CommunityBuilder,
                earned_timestamp: clock.unix_timestamp,
                metadata: "Leadership unlocked".to_string(),
            });
        }
        
        // Mentor status
        if self.referrals_made >= 20 && 
           self.evolution_level >= 10 && 
           !self.mentor_status {
            self.mentor_status = true;
            evolved = true;
            
            self.achievement_badges.push(Badge {
                badge_type: BadgeType::Mentor,
                earned_timestamp: clock.unix_timestamp,
                metadata: "Mentor status achieved".to_string(),
            });
        }
        
        // Record evolution event
        if evolved {
            self.evolution_history.push(EvolutionEvent {
                timestamp: clock.unix_timestamp,
                event_type: EvolutionType::LevelUp,
                trigger_data: format!("Work: {}, Trust: {}", self.total_work_completed, self.trust_score),
                old_level,
                new_level: self.evolution_level,
            });
            
            // Update avatar based on evolution
            self.current_avatar_hash = Self::generate_evolved_avatar(
                &self.owner, 
                self.evolution_level, 
                &self.dominant_work_type,
                self.trust_score
            );
        }
        
        Ok(())
    }
    
    fn has_badge(&self, badge_type: &BadgeType) -> bool {
        self.achievement_badges.iter().any(|b| &b.badge_type == badge_type)
    }
    
    fn generate_initial_avatar(owner: &Pubkey) -> u64 {
        // Generate deterministic but unique avatar hash based on pubkey
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        use std::hash::{Hash, Hasher};
        owner.hash(&mut hasher);
        hasher.finish()
    }
    
    fn generate_evolved_avatar(
        owner: &Pubkey, 
        level: u8, 
        work_type: &WorkType, 
        trust: u64
    ) -> u64 {
        // Generate evolved avatar incorporating all factors
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        use std::hash::{Hash, Hasher};
        owner.hash(&mut hasher);
        level.hash(&mut hasher);
        work_type.hash(&mut hasher);
        trust.hash(&mut hasher);
        hasher.finish()
    }
    
    pub fn get_emission_multiplier(&self) -> u64 {
        // Higher evolved souls get emission bonuses
        let base_multiplier = 100; // 1.0x
        let level_bonus = (self.evolution_level as u64) * 5; // +5% per level
        let trust_bonus = (self.trust_score / 1000) * 10; // +10% per 1000 trust
        let consistency_bonus = if self.consecutive_active_days >= 7 { 25 } else { 0 }; // +25% for weekly consistency
        
        base_multiplier + level_bonus + trust_bonus + consistency_bonus
    }
    
    pub fn can_witness_high_value(&self) -> bool {
        self.evolution_level >= 5 && 
        self.trust_score >= 2000 && 
        self.witness_votes_given >= 10
    }
    
    pub fn get_reputation_summary(&self) -> String {
        format!(
            "Level {} {} | Trust: {} | {} days active | {} work completed",
            self.evolution_level,
            self.format_work_type(&self.dominant_work_type),
            self.trust_score,
            self.consecutive_active_days,
            self.total_work_completed
        )
    }
    
    fn format_work_type(&self, work_type: &WorkType) -> &str {
        match work_type {
            WorkType::OnboardUser => "Onboarder",
            WorkType::CreateContent => "Creator",
            WorkType::WriteCode => "Developer",
            WorkType::ReferClient => "Referrer",
            WorkType::CloseDeal => "Closer",
            WorkType::CommunityManagement => "Community Manager",
            WorkType::BugReport => "Bug Hunter",
            WorkType::Documentation => "Documenter",
            WorkType::Marketing => "Marketer",
            WorkType::UserSupport => "Support Specialist",
        }
    }
}