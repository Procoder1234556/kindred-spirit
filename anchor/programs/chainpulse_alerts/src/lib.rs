use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod chainpulse_alerts {
    use super::*;

    pub fn initialize_subscription(
        ctx: Context<InitializeSubscription>,
        alert_types: u8, // Bitmask: 1=WHALE, 2=RUG, 4=LIQUIDITY, 8=MARKET
        threshold_level: u8, // 0=LOW, 1=MEDIUM, 2=HIGH, 3=CRITICAL
    ) -> Result<()> {
        let sub = &mut ctx.accounts.subscription;
        sub.owner = ctx.accounts.user.key();
        sub.alert_types = alert_types;
        sub.threshold_level = threshold_level;
        
        msg!("SubscriptionInitialized: Owner={}, Types={}, Threshold={}", sub.owner, alert_types, threshold_level);
        Ok(())
    }

    pub fn update_subscription(
        ctx: Context<UpdateSubscription>,
        new_types: u8,
        new_threshold: u8,
    ) -> Result<()> {
        let sub = &mut ctx.accounts.subscription;
        sub.alert_types = new_types;
        sub.threshold_level = new_threshold;

        msg!("SubscriptionUpdated: Owner={}, Types={}, Threshold={}", sub.owner, new_types, new_threshold);
        Ok(())
    }

    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
        msg!("SubscriptionCancelled: Owner={}", ctx.accounts.subscription.owner);
        Ok(()) // Account is closed via the `close` constraint
    }
}

#[derive(Accounts)]
pub struct InitializeSubscription<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 1 + 1, // Discriminator + Pubkey + 2 u8s
        seeds = [b"subscription", user.key().as_ref()],
        bump
    )]
    pub subscription: Account<'info, AlertSubscription>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateSubscription<'info> {
    #[account(
        mut,
        seeds = [b"subscription", user.key().as_ref()],
        bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub subscription: Account<'info, AlertSubscription>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    #[account(
        mut,
        close = user, // Reclaims rent to user
        seeds = [b"subscription", user.key().as_ref()],
        bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub subscription: Account<'info, AlertSubscription>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct AlertSubscription {
    pub owner: Pubkey,
    pub alert_types: u8,
    pub threshold_level: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to modify this subscription.")]
    Unauthorized,
}
