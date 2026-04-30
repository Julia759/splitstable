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

I am also separating observation from decision. That matters because a good PMM read is not just "competitor has feature X." It is:

- what I observed
- how confident I am
- what it means for SplitStable
- what evidence would make me change the positioning

### SPLit

URL: https://www.splitsol.net/

Evidence used:

- public website language and feature claims from the April 17, 2026 research pass
- Solana-native framing, wallet support, USDC support, and receipt scanning claims
- product flow appears centered on the app experience rather than a Telegram group bot

Confidence: Medium. I reviewed the public surface, not a full logged-in product flow.

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

Product decision:

Do not lead SplitStable with generic Solana bill-splitting or receipt scanning. Lead with the chat-to-wallet loop.

What would change my mind:

If SPLit ships a strong Telegram group bot with persistent balances and wallet-signed USDC settlement inside the chat, SplitStable would need a narrower wedge around hackathon teams, group operations, or a better payment-confirmation UX.

### Divvy

URL: https://divvyapp.xyz/

Evidence used:

- public site positioning around receipt splitting, Solana Pay, and USDC
- visible emphasis on the payment moment rather than ongoing Telegram group coordination
- product appears closer to bill/receipt settlement than persistent group ledger behavior

Confidence: Medium. This is based on public positioning, not private traction or product analytics.

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

Product decision:

Receipt parsing should stay out of the first demo. It is attractive, but it would pull the story toward restaurants instead of Telegram-native group coordination.

What would change my mind:

If user interviews show that the receipt is the main trigger for crypto groups, I would move receipt upload into the roadmap earlier while keeping Telegram as the starting surface.

### SolSplitApp

URL: https://solsplit.app/

Evidence used:

- public positioning around Solana Pay links, QR codes, payment monitoring, and Solana Mobile Seeker
- sharing and payment-link language appears stronger than persistent group-ledger language
- USDC-first messaging appears less central than Solana payment-link utility

Confidence: Medium. I need a deeper product walkthrough to understand how much group state exists behind the link flow.

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

Product decision:

SplitStable needs to show balances and confirmations as first-class product moments, not just generate a payment URL.

What would change my mind:

If SolSplitApp has strong recurring group state and Telegram-native reminders, then SplitStable's differentiation would need to move toward a more specific ICP and stronger PMM narrative.

### SolSplitter

URL: https://docs.solsplitter.com/getting-started/

Evidence used:

- public docs describing wallet-based group expenses on Solana
- SOL/USDT language appears more prominent than USDC-first settlement
- docs-first presence gives useful architecture signal, but less obvious consumer positioning

Confidence: Medium. Docs can lag product reality, so I would re-check the live product before using this in a public teardown.

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

Product decision:

Keep SplitStable narrower than "Solana group expense platform." The narrower promise is easier to remember and easier to demo.

What would change my mind:

If SolSplitter's product is already strong for Telegram-native USDC groups, I would treat it as the closest direct competitor and focus SplitStable on a learning case study rather than an independent product opportunity.

## Telegram Substitutes

### Spliq

URL: https://spliqapp.com/

Evidence used:

- public website language around Telegram expense tracking, no extra apps, flexible splitting, smart settlement, and notifications
- strong proof that Telegram is a credible surface for expense behavior
- settlement appears to stop at tracking and instructions rather than wallet-signed crypto payment

Confidence: Medium to high for the Telegram-expense insight, medium for the settlement gap.

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

Product decision:

Borrow the no-install clarity, but do not try to beat Spliq on expense-management breadth. SplitStable should win the crypto-native settlement loop.

What would change my mind:

If Spliq adds wallet-signed stablecoin payments, SplitStable would need to differentiate through Solana depth, payment validation, or a specific web3 group segment.

### SplitFast

URL: https://splitfast.io/

Evidence used:

- public positioning around Telegram-first Splitwise replacement
- no-download and no-registration claims
- feature breadth around receipt scanning, smart settlement, and multi-currency support
- repayment appears external to the product rather than Solana-native settlement

Confidence: Medium to high for the Telegram UX threat, medium for payment-settlement specifics.

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

Product decision:

The demo has to show payment finality. If the demo only shows split tracking, SplitStable collapses into the Telegram expense bot category.

What would change my mind:

If SplitFast adds first-class crypto payment settlement, SplitStable's story would need to focus on Solana-specific trust, mint validation, and on-chain confirmation.

## Non-Crypto Substitutes

### Splitwise

URL: https://www.splitwise.com/

Evidence used:

- public product category and common user understanding of Splitwise as the default shared-expense tracker
- broad market familiarity with IOU tracking and group balances
- repayment is not the core crypto-native wallet flow SplitStable is exploring

Confidence: High for mental-model comparison, low for direct competitive threat in Solana-native settlement.

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

Product decision:

Use Splitwise only as a quick analogy, then move quickly to the sharper wedge. "Splitwise on Solana" is useful for comprehension but too weak for positioning.

What would change my mind:

If mainstream expense apps add embedded stablecoin settlement and Telegram-native group flows, then SplitStable's advantage would depend almost entirely on crypto-community distribution.

### Split: Bill Splitter

URL: https://apps.apple.com/us/app/split-bill-splitter/id6746829861

Evidence used:

- App Store page positioning around receipt scanning, item assignment, balances, multiple currencies, and manual settlement tracking
- consumer UX appears polished, which raises the bar for SplitStable's demo clarity
- app-first and off-chain tracking make it a substitute, not a direct Solana-native competitor

Confidence: Medium. App Store pages are useful for positioning, but not enough to judge retention or workflow depth.

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

Product decision:

The product language needs to stay human. Crypto terms only help if they explain speed, trust, or settlement.

What would change my mind:

If user feedback says the Telegram surface is less important than receipt precision, I would revisit whether the MVP should start with receipt capture instead of commands.

## Adjacent Competitors

### HyperSplit

URL: https://www.hypersplit.app/

Evidence used:

- public positioning around receipt splitting, Apple Pay, Coinbase, and USDC settlement
- Base ecosystem and broader payment options suggest a different ecosystem and payment behavior
- validates the stablecoin-settlement trend even if the surface differs

Confidence: Medium. The product is adjacent enough to learn from, but not close enough to copy the positioning.

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

Product decision:

Watch HyperSplit for market education around USDC settlement, but keep SplitStable's wedge anchored in Telegram and Solana groups.

What would change my mind:

If HyperSplit's adoption is driven mostly by cross-border friend groups sharing links in chat, then SplitStable should learn from its onboarding and sharing loops.

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
