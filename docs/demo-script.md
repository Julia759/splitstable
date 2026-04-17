# SplitStable Demo Script

## Demo Goal

The demo should make one idea obvious:

> A Telegram group can split an expense and settle in USDC on Solana without copying wallet addresses.

The viewer should understand the product in under 30 seconds and understand the PMM case study in under 3 minutes.

## Demo Principles

- Show the product before explaining the architecture.
- Keep the flow narrow.
- Use devnet clearly and honestly.
- Avoid startup pitch language.
- Explain only the technical details that support trust.
- End with the PMM learning, not a fundraising ask.

## Core Demo Flow

1. Open a Telegram group.
2. Type `/split 50 USDC dinner`.
3. Bot replies with equal shares and Pay buttons.
4. Click Pay as one participant.
5. Wallet or pay page opens.
6. Confirm devnet USDC payment.
7. Bot detects the transaction by reference.
8. Bot posts confirmation and updates balances.
9. Show `/balances`.
10. End on the positioning line.

## 60-Second Demo Script

### 0:00-0:05 - Hook

Voiceover:

> Crypto groups already coordinate expenses in Telegram, but settlement is still manual.

On screen:

- Telegram group chat
- Message about dinner, trip, or hackathon supplies

### 0:05-0:15 - Create Split

Voiceover:

> SplitStable turns the group chat into the expense ledger.

On screen:

```text
/split 50 USDC dinner
```

Bot response:

```text
Dinner: 50 USDC
Everyone owes: 12.50 USDC

Yuliia paid
Anna owes 12.50
Max owes 12.50
Leo owes 12.50

[Pay 12.50 USDC]
```

### 0:15-0:35 - Pay

Voiceover:

> Each person taps Pay, opens their wallet, and signs a USDC transfer on Solana.

On screen:

- Pay page or wallet screen
- amount: 12.50 USDC
- recipient
- network: devnet
- confirm button

### 0:35-0:50 - Confirm

Voiceover:

> The bot does not trust the button click. It checks the transaction on-chain and updates the balance only after confirmation.

On screen:

Bot response:

```text
Payment confirmed.
Anna paid 12.50 USDC for dinner.
View transaction: [explorer link]
```

Then:

```text
/balances
```

Bot response:

```text
Dinner balance:
Anna settled
Max owes Yuliia 12.50 USDC
Leo owes Yuliia 12.50 USDC
```

### 0:50-1:00 - Close

Voiceover:

> SplitStable is a PMM case study for chat-native stablecoin payments: split in Telegram, settle on Solana.

On screen:

```text
Split in chat. Settle on Solana.
```

## 3-Minute Walkthrough Script

### 0:00-0:20 - Problem

Voiceover:

> I built SplitStable as a web3 product marketing case study. The insight is simple: group expenses start in chat, but payment happens somewhere else. For crypto-native groups using Telegram and USDC, that creates friction: wallet addresses, manual payments, screenshots, reminders, and unclear balances.

On screen:

- Telegram group discussing shared cost
- quick overlay: "manual wallet addresses", "who paid?", "awkward reminders"

### 0:20-0:40 - Positioning

Voiceover:

> The positioning is not generic bill splitting. SplitStable is Telegram-native expense splitting with USDC settlement on Solana. The first user is not everyone. It is Solana hackathon teams, hacker houses, digital nomads, and crypto groups that already use Telegram and wallets.

On screen:

```text
First user:
- Telegram-native
- Crypto-native
- Uses USDC
- Cross-border or app-fragmented
```

### 0:40-1:20 - Product Flow

Voiceover:

> Here is the core flow. In the group chat, I type `/split 50 USDC dinner`. SplitStable calculates each share and creates payment buttons for the people who owe.

On screen:

- type command
- show bot response
- hover over Pay button

Voiceover:

> The user does not copy an address. They tap Pay.

On screen:

- pay page or wallet handoff

### 1:20-1:55 - Solana Payment

Voiceover:

> For v1, this does not need a custom smart contract. The payment can be a wallet-signed SPL token transfer. Solana Pay gives us a wallet-compatible payment flow, and a reference key lets the backend find and validate the transaction.

On screen:

- wallet/payment page
- amount
- recipient
- token: USDC
- network: devnet

Voiceover:

> The important trust detail: SplitStable never holds user funds. It coordinates the request, then the user signs in their own wallet.

### 1:55-2:25 - Validation

Voiceover:

> After payment, the backend validates the transaction. It checks the reference, amount, token mint, sender, recipient, and transaction status. Only then does the bot update the group balance.

On screen:

```text
Validated:
- reference
- amount
- mint
- payer
- recipient
- success status
```

Bot confirmation:

```text
Payment confirmed.
Anna paid 12.50 USDC.
```

### 2:25-2:45 - Competitive Wedge

Voiceover:

> Traditional expense apps track IOUs. Telegram expense bots keep the flow in chat but do not settle crypto payments. Solana payment apps settle quickly but often start outside the group conversation. SplitStable sits at the intersection: Telegram-first coordination plus Solana USDC settlement.

On screen:

```text
Telegram expense bots: chat-native, no crypto settlement
Solana split apps: crypto settlement, less chat-native
SplitStable: chat-native + USDC settlement
```

### 2:45-3:00 - PMM Close

Voiceover:

> I built this to show how I approach product marketing for technical web3 products: research the market, narrow the user, define the wedge, explain the architecture, and turn it into a demo people can understand quickly.

On screen:

```text
SplitStable
Split in chat. Settle on Solana.
PMM case study by Yuliia
```

## Live Demo Checklist

Before recording:

- Telegram bot is running
- test group exists
- test users are named clearly
- wallet has devnet SOL for fees
- wallet has devnet USDC or mocked USDC flow is clearly labeled
- explorer links work
- command responses are short
- no secrets or tokens are visible
- desktop notifications are off
- browser tabs are clean

## Demo Data

Use a realistic but simple example:

Group:

- Yuliia
- Anna
- Max
- Leo

Expense:

- Dinner
- 50 USDC
- 4 people
- 12.50 USDC each

Why this works:

- easy math
- recognizable use case
- enough people to show group value
- short enough for a demo

## On-Screen Copy

Use these short overlays:

- "Group expenses start in chat."
- "Create the split in Telegram."
- "Pay with your Solana wallet."
- "Validate on-chain before updating balances."
- "Non-custodial by design."
- "Split in chat. Settle on Solana."

## Product Claims To Avoid

Do not say:

- "zero fees"
- "no competition"
- "production ready"
- "banking replacement"
- "fully decentralized"
- "mainnet live" unless it is true

Say instead:

- "low network fees"
- "Telegram-first wedge"
- "devnet demo"
- "non-custodial payment coordination"
- "wallet-signed USDC transfer"

## 30-Second Technical Explanation

Use this if someone asks how it works:

> SplitStable keeps expense state off-chain and uses Solana only for settlement. The bot creates a payment intent with a unique reference key. The user signs a USDC transfer in their own wallet. After submission, the backend finds the transaction by reference and validates the mint, amount, sender, recipient, and success status before marking the payment as settled.

## Interview Explanation

Use this in PMM interviews:

> I intentionally scoped the product around one demoable behavior: split in Telegram and settle in USDC. The PMM challenge was to avoid generic "Splitwise on blockchain" positioning and find the sharper wedge. The competitive research showed that Telegram expense bots and Solana bill-splitting apps both exist, so the differentiated message became Telegram-native coordination plus Solana-native settlement.

## Final Demo CTA

Use one of these:

1. Follow the build-in-public series.
2. Review the PMM docs in the repo.
3. Send feedback on the positioning.
4. Share with a Solana team that coordinates expenses in Telegram.

Recommended CTA:

> I am using this as a web3 PMM case study. Feedback on the positioning is welcome.

