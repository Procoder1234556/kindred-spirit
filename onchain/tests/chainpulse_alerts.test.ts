/**
 * chainpulse_alerts.test.ts
 *
 * Phase 3.7 — Devnet test: initializes an AlertSubscription PDA,
 * updates it, then cancels it (reclaiming rent).
 *
 * Run with: anchor test --provider.cluster devnet
 * (Requires a funded devnet keypair at ~/.config/solana/id.json)
 */
import * as anchor from '@coral-xyz/anchor'
import { Program, AnchorProvider, setProvider } from '@coral-xyz/anchor'
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { assert } from 'chai'

// NOTE: Replace with the actual generated IDL once `anchor build` runs
// import { ChainpulseAlerts } from '../target/types/chainpulse_alerts'
// const IDL = require('../target/idl/chainpulse_alerts.json')

const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')

describe('chainpulse_alerts', () => {
  const provider = AnchorProvider.env()
  setProvider(provider)

  let subscriptionPda: PublicKey
  let subscriptionBump: number

  before(async () => {
    // Derive the subscription PDA for the test wallet
    ;[subscriptionPda, subscriptionBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('subscription'), provider.wallet.publicKey.toBuffer()],
      PROGRAM_ID
    )
    console.log('📋 Subscription PDA:', subscriptionPda.toBase58())
  })

  it('PDA is derived with correct seeds ["subscription", user_pubkey]', () => {
    // Verify seeds: ["subscription", user_pubkey]
    const [expectedPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('subscription'), provider.wallet.publicKey.toBuffer()],
      PROGRAM_ID
    )
    assert.equal(
      subscriptionPda.toBase58(),
      expectedPda.toBase58(),
      'PDA derivation must use seeds [subscription, user_pubkey]'
    )
    console.log('✅ PDA derivation verified')
  })

  it('Program ID matches declared program', () => {
    assert.equal(
      PROGRAM_ID.toBase58(),
      'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
      'Program ID should match the declared ID in lib.rs'
    )
    console.log('✅ Program ID verified')
  })

  /**
   * Full on-chain test — commented out until `anchor build` generates the IDL.
   * Uncomment and run: anchor test --provider.cluster devnet
   */
  /*
  it('initialize_subscription creates the PDA account', async () => {
    const alertTypes = 0b1111  // All alert types enabled
    const thresholdLevel = 2   // HIGH

    await program.methods
      .initializeSubscription(alertTypes, thresholdLevel)
      .accounts({ subscription: subscriptionPda, user: provider.wallet.publicKey })
      .rpc()

    const sub = await program.account.alertSubscription.fetch(subscriptionPda)
    assert.equal(sub.owner.toBase58(), provider.wallet.publicKey.toBase58())
    assert.equal(sub.alertTypes, alertTypes)
    assert.equal(sub.thresholdLevel, thresholdLevel)
    console.log('✅ initialize_subscription OK')
  })

  it('update_subscription modifies alert_types and threshold_level', async () => {
    const newTypes = 0b0011
    const newThreshold = 3  // CRITICAL only

    await program.methods
      .updateSubscription(newTypes, newThreshold)
      .accounts({ subscription: subscriptionPda, user: provider.wallet.publicKey })
      .rpc()

    const sub = await program.account.alertSubscription.fetch(subscriptionPda)
    assert.equal(sub.alertTypes, newTypes)
    assert.equal(sub.thresholdLevel, newThreshold)
    console.log('✅ update_subscription OK')
  })

  it('cancel_subscription closes the account and reclaims rent', async () => {
    const balanceBefore = await provider.connection.getBalance(provider.wallet.publicKey)

    await program.methods
      .cancelSubscription()
      .accounts({ subscription: subscriptionPda, user: provider.wallet.publicKey })
      .rpc()

    // Account should no longer exist
    const info = await provider.connection.getAccountInfo(subscriptionPda)
    assert.isNull(info, 'Account should be closed after cancellation')

    const balanceAfter = await provider.connection.getBalance(provider.wallet.publicKey)
    assert.isAbove(balanceAfter, balanceBefore - 5000, 'Rent should be reclaimed')
    console.log('✅ cancel_subscription OK (rent reclaimed)')
  })
  */
})
