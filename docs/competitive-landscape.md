# SplitStable Competitive Landscape

Research date: April 17, 2026

## Executive Summary

This is my current read of the market. I am treating competitors as signal, not as a reason to flatten the idea.

SplitStable is entering a moderately crowded space. The opportunity is not "no one has built bill splitting." The opportunity is a sharper intersection:

> Telegram-native group expense coordination plus Solana-native USDC settlement.

There are three relevant competitive groups:

- Traditional expense trackers that own the habit but not crypto settlement.
- Telegram expense bots that own the chat workflow but not on-chain payment settlement.
- Solana or crypto bill-splitting apps that own crypto settlement but usually start outside the chat.

SplitStable should not claim there is no competition. It should claim a narrower wedge: fastest path from Telegram group expense to wallet-signed USDC settlement.

## Landscape Map

| Segment | Products | User Need | SplitStable Opening |
|---------|----------|-----------|---------------------|
| Traditional expense trackers | Splitwise, Split, Settle Up | Track IOUs and balances | They do not serve wallet-native USDC settlement as the primary flow |
| Telegram expense tools | Spliq, SplitFast | Track expenses without leaving Telegram | They mostly stop at IOU tracking and manual repayment |
| Solana bill-splitting tools | SPLit, SolSplitApp, SolSplitter, Divvy | Split and settle with Solana payments | They are less clearly Telegram-first |
| Cross-chain payment split tools | HyperSplit | Fast stablecoin settlement for receipts | Different ecosystem and payment behavior |
| Local payment apps | Venmo, Revolut, Cash App, Zelle | Familiar fiat repayment | Country-specific, not crypto-native, not universal for cross-border web3 groups |

## Direct Competitors

For each product, I am using the same lens:

> Where is SplitStable meaningfully different, not just slightly better?

### SPLit

URL: https://www.splitsol.net/

Positioning:

SPLit is a Solana-native bill-splitting app for SOL and USDC payments. It emphasizes mainnet availability, sub-second settlement, low fees, non-custodial payments, AI receipt scanning, on-chain proof, and wallet support for Phantom, Solflare, and Backpack.

Strengths:

- Strong Solana-native positioning
- Clear non-custodial message
- USDC support
- AI receipt scanning
- Polished benefit language

Weaknesses or opening:

- Appears app-first rather than Telegram-first
- Requires users to create groups and add members by wallet address
- Less focused on the social coordination layer where expenses begin

Threat level: High

Where SplitStable is different:

SPLit is the closest Solana-native reference point, so SplitStable should not compete on "Solana bill splitting" alone. The difference is the starting surface: SplitStable begins inside the Telegram group where the expense is already being negotiated, then turns that conversation into a USDC payment flow.

### Divvy

URL: https://divvyapp.xyz/

Positioning:

Divvy positions itself around receipt splitting, Solana Pay, and USDC settlement.

Strengths:

- Clear "split bills, get paid instantly" promise
- Strong Solana Pay language
- Receipt scanning angle
- USDC settlement

Weaknesses or opening:

- Less obvious Telegram-native workflow
- More restaurant/receipt focused
- SplitStable can be broader for crypto group expenses: hackathons, houses, trips, contributor teams

Threat level: Medium to High

Where SplitStable is different:

Divvy is closer to a receipt and checkout moment. SplitStable is closer to an ongoing group relationship: trips, hacker houses, hackathon teams, shared dinners, and recurring small costs. I should not lead with receipt scanning. I should lead with the group-chat workflow and the moment the IOU turns into a wallet-signed payment.

### SolSplitApp

URL: https://solsplit.app/

Positioning:

SolSplitApp turns Solana Pay links into shareable payment URLs for bill splitting and is optimized for Solana Mobile Seeker.

Strengths:

- Solana Pay link infrastructure
- Payment monitoring
- QR code generation
- Messaging app sharing
- Solana Mobile angle

Weaknesses or opening:

- Focused on link generation rather than persistent group expense state
- Less clearly positioned around Telegram group balances
- SOL conversion appears more prominent than USDC-first settlement

Threat level: Medium

Where SplitStable is different:

SolSplitApp is strong around payment links. SplitStable should feel less like a link generator and more like a shared ledger living in Telegram: who paid, who owes, what changed, and which payments are confirmed.

### SolSplitter

URL: https://docs.solsplitter.com/getting-started/

Positioning:

SolSplitter describes a wallet-based group expense platform built on Solana for tracking and settling expenses in SOL or USDT.

Strengths:

- Wallet-first Solana positioning
- Group expenses and settlement
- Free/premium packaging

Weaknesses or opening:

- Not obviously Telegram-first
- USDT/SOL focus leaves room for USDC-first positioning
- Documentation-first presence may feel less consumer-ready

Threat level: Medium

Where SplitStable is different:

SolSplitter has the broad Solana expense platform shape. SplitStable should be more specific and more social: Telegram-first, USDC-first, and built around the organizer who wants the group to settle without another app ritual.

## Telegram Substitutes

### Spliq

URL: https://spliqapp.com/

Positioning:

Spliq is a Telegram expense tracker. It emphasizes no extra apps, no sign-ups, 161 currencies, flexible splitting, smart settlement, and instant Telegram notifications.

Strengths:

- Excellent Telegram-native story
- Clear no-install promise
- Strong travel and group use cases
- Smart settlement

Weaknesses or opening:

- Tracks balances but does not appear to process crypto settlement
- Settlement is instructional rather than wallet-signed payment
- Not Solana-native

Threat level: High as a UX substitute

Where SplitStable is different:

Spliq proves that Telegram is a strong surface for expense tracking. SplitStable's difference has to be the settlement layer: not just "who owes who," but "tap Pay, sign in wallet, and update the balance after the USDC transfer is confirmed."

### SplitFast

URL: https://splitfast.io/

Positioning:

SplitFast is a Telegram-first Splitwise alternative. It emphasizes no downloads, no registration, auto-add members, receipt scanning, smart settlement, and multi-currency support.

Strengths:

- Very strong Telegram-first message
- Clear replacement for Splitwise in Telegram groups
- Strong onboarding promise: add the bot and start quickly
- Good feature breadth

Weaknesses or opening:

- Actual repayment happens outside the product using whatever payment method users prefer
- Not Solana-native
- Not USDC settlement focused

Threat level: High as a Telegram expense tracker

Where SplitStable is different:

SplitFast owns a clean Telegram-first expense story. SplitStable should not try to beat that by listing more expense features. The difference is payment finality for crypto-native groups: Telegram expense bots stop at "who owes who"; SplitStable closes the loop with wallet-signed USDC payment.

## Non-Crypto Substitutes

### Splitwise

URL: https://www.splitwise.com/

Positioning:

Splitwise is the default mental model for shared expense tracking.

Strengths:

- Strong brand awareness
- Good group expense model
- Familiar IOU workflow

Weaknesses or opening:

- Repayment happens elsewhere
- Less natural for wallet-native users
- Does not solve cross-border crypto-native payment settlement

Threat level: High as mental model, low as Solana-native settlement competitor

Where SplitStable is different:

Splitwise is the mental shortcut, not the destination. SplitStable borrows the familiar idea of shared balances, but changes the surface and the rail: the split starts in Telegram and settlement happens through a Solana wallet.

### Split: Bill Splitter

URL: https://apps.apple.com/us/app/split-bill-splitter/id6746829861

Positioning:

iPhone bill splitting app with receipt scanning, item assignment, real-time balances, multiple currencies, and manual settlement tracking.

Strengths:

- Polished consumer UX
- AI receipt scanner
- App Store reviews and visible traction
- Mainstream user language

Weaknesses or opening:

- Off-chain IOU tracking
- Not Telegram-first
- Not wallet-native

Threat level: Medium

Where SplitStable is different:

Split shows that mainstream bill-splitting UX is becoming polished. SplitStable cannot rely on crypto language alone. The difference must be situational: for a Telegram-native Solana group, SplitStable should feel easier than downloading another consumer finance app.

## Adjacent Competitors

### HyperSplit

URL: https://www.hypersplit.app/

Positioning:

HyperSplit is a Base-based receipt splitting product with Apple Pay, Coinbase, and USDC settlement.

Strengths:

- Strong "scan, share, settle" message
- Cross-border settlement framing
- Multiple payment methods
- Beta-stage urgency

Weaknesses or opening:

- Base ecosystem rather than Solana
- App/link flow rather than Telegram group bot
- Receipt-first rather than group-chat-first

Threat level: Medium

Where SplitStable is different:

HyperSplit validates the broader stablecoin settlement behavior. SplitStable chooses a different context: not receipt-first on Base, but Telegram-first on Solana for groups that already coordinate socially before they pay.

## Crowdedness Rating

Crowdedness: Moderate to crowded.

Reason:

There are multiple active products in adjacent and direct spaces:

- Solana bill splitting
- Telegram expense tracking
- receipt scanning and group IOUs
- cross-border USDC settlement

However, no dominant product clearly owns the specific combination of Telegram-first workflow and Solana USDC settlement for crypto-native groups.

## Positioning Matrix

| Product | Telegram-first | Solana-native | Stablecoin settlement | Expense ledger | Best-fit user |
|---------|----------------|---------------|----------------------|----------------|---------------|
| Splitwise | No | No | No | Yes | Mainstream friend groups |
| Spliq | Yes | No | No | Yes | Telegram travel and roommate groups |
| SplitFast | Yes | No | No | Yes | Telegram groups wanting a Splitwise alternative |
| SPLit | No/unclear | Yes | Yes | Yes | Solana wallet users |
| Divvy | No/unclear | Yes | Yes | Yes | Receipt splitters and Solana Pay users |
| SolSplitApp | Messaging-friendly | Yes | Partial | Partial | Solana Mobile and payment link users |
| HyperSplit | No | No, Base | Yes | Yes | Cross-border receipt splitters |
| SplitStable | Yes | Yes | Yes, USDC-first | Yes | Telegram-native Solana groups |

## SplitStable SWOT

### Strengths

- Clear wedge at the intersection of Telegram and Solana
- Strong first-user segment: crypto-native groups
- Non-custodial technical architecture
- Demo can be simple and memorable
- A clean build-in-public story

### Weaknesses

- Not technically defensible at MVP stage
- Existing competitors can copy the message
- Requires users to have wallets and USDC
- Telegram group UX can become noisy
- Payment validation adds technical complexity

### Opportunities

- Build-in-public content around product thinking and Solana payments
- Use the project to show market research and technical storytelling
- Interview beta users from Solana communities
- Turn the project into a credible public product narrative
- Expand from expense splitting to chat-native payment coordination

### Threats

- Solana-native competitors add Telegram bots
- Telegram expense bots add crypto payment links
- Users prefer existing fiat apps for small local payments
- Wallet payment UX creates drop-off
- Regulatory concerns if messaging implies custody, banking, or remittance

## Moat Analysis

The realistic early moat is not technology. The realistic moat is:

> Audience understanding plus distribution through build-in-public.

For a real product, the moat would need to evolve into:

- trust in payment safety
- Telegram group adoption
- transaction history and balance memory
- community distribution
- integrations with Solana wallets and communities

For my build-in-public project, the moat is different:

> Clear thinking, honest competitive research, and the ability to explain a technical product in human language.

## Recommended Differentiation

SplitStable should own this line:

> The Telegram-first USDC settlement layer for Solana groups.

Support it with:

- Telegram-first demo
- USDC-first language
- no-custody trust story
- payment validation explainer
- group-chat use cases
- clear comparison against Telegram IOU bots and Solana app-first competitors

## Messaging Do And Do Not

### Do

- Say "Telegram-first."
- Say "USDC settlement."
- Say "non-custodial."
- Say "wallet-signed payments."
- Say "for Solana groups."
- Acknowledge competitors clearly.

### Do Not

- Say "no competition."
- Lead with "decentralized" before explaining the user benefit.
- Promise zero fees.
- Imply SplitStable holds or moves funds for users.
- Compete on receipt scanning before the core payment loop works.

## Research Sources

- SPLit: https://www.splitsol.net/
- Spliq: https://spliqapp.com/
- SplitFast: https://splitfast.io/
- Divvy: https://divvyapp.xyz/
- SolSplitApp: https://solsplit.app/
- SolSplitter docs: https://docs.solsplitter.com/getting-started/
- HyperSplit: https://www.hypersplit.app/
- Split: Bill Splitter App Store page: https://apps.apple.com/us/app/split-bill-splitter/id6746829861
- Solana Pay overview: https://launch.solana.com/docs/solana-pay/overview
- Solana Pay specification v1.1: https://launch.solana.com/docs/solana-pay/specification/version1.1
