# SplitStable

**Telegram-native group expense splitting with USDC settlement on Solana.**

SplitStable turns a group chat into a shared expense ledger. Add the bot to Telegram, create a split, and everyone pays from their existing Solana wallet.

## Status

MVP in progress. The first target is a Telegram bot with devnet USDC settlement, balance tracking, and Solana Pay payment links.

## The Problem

Group expenses usually happen in chat, but payment happens somewhere else. Friends coordinate dinner, rent, travel, or hackathon costs in Telegram, then someone has to copy wallet addresses, calculate who owes what, send reminders, and check whether everyone paid.

Splitwise tracks debts but does not settle crypto payments. Wallets settle crypto payments but do not understand shared expenses. The missing piece is a chat-native flow that tracks the split and gets the group settled without another app download.

## The Wedge

SplitStable starts where the expense already happens: the group chat.

- One command creates a split
- One button opens the wallet
- USDC settles directly between friends
- The bot keeps balances visible to the group
- No manual wallet address copying
- No new finance app to convince friends to install

## How It Works

### Telegram Bot MVP

```text
/newgroup Trip Munich
/split 50 USDC dinner

Bot: Everyone owes 12.50 USDC.
[Pay] -> opens wallet -> confirm -> settled on Solana
```

The MVP focuses on equal splits, USDC settlement, group balances, reminders, and devnet testing before mainnet release.

### Web App Roadmap

1. Connect a Solana wallet such as Phantom, Solflare, or Backpack
2. Create a group and invite friends with a link
3. Add expenses and track who owes who
4. Settle in USDC from the connected wallet
5. Use smart settle to minimize the number of payments in a group

## Why Solana

Splitting small expenses only works if settlement is fast and cheap. Solana makes low-value stablecoin payments practical because network fees are measured in fractions of a cent and confirmations are fast enough for everyday checkout-style flows.

| Network | Typical group-split fit | Why |
|---------|-------------------------|-----|
| Ethereum mainnet | Poor | Gas can cost more than small shared expenses |
| Polygon | Good | Low fees, but less Solana-native wallet adoption |
| Solana | Strong | Low fees, fast settlement, USDC support, strong wallet UX |

The product is designed around Solana Pay links, SPL token transfers, and verified stablecoin mint addresses.

## First Users

SplitStable is for crypto-native groups that already coordinate in chat:

- Hackathon teams
- Hacker houses
- Digital nomads
- Web3 friend groups
- Solana communities that already hold USDC

## Competitive Landscape

The market is not empty. There are web-based crypto and Solana expense-splitting products. SplitStable's position is different: Telegram-first, USDC-first, and optimized for groups that do not want to leave the chat.

| Product | Tracks expenses | Crypto settlement | Solana-native | Chat-first | USDC-first |
|---------|-----------------|-------------------|---------------|------------|------------|
| Splitwise | Yes | No | No | No | No |
| Venmo | Limited | No | No | No | No |
| Revolut | Limited | Fiat | No | No | No |
| Solana split apps | Yes | Yes | Yes | Usually no | Varies |
| **SplitStable** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |

## Why This Wins

Most expense products ask users to open a separate app after the group has already discussed the expense somewhere else. SplitStable removes that extra step. The bot becomes the payment surface inside the chat, while Solana handles the settlement layer.

The strongest wedge is not "Splitwise on Solana." It is "the fastest way for Telegram groups to split and settle USDC expenses without downloading a new app."

## Safety Model

SplitStable should be non-custodial from day one:

- Users sign payments in their own wallets
- SplitStable never holds user funds
- Payment requests validate token mint addresses, not just token symbols
- Mainnet support follows devnet testing
- The bot records expense state, but settlement happens through wallet-confirmed transactions

## Tech Stack

- **Monorepo:** Turborepo
- **Bot:** Node.js, TypeScript, grammY, Solana Pay
- **Web:** Next.js, Tailwind CSS, Solana Wallet Adapter
- **Blockchain:** Solana, `@solana/web3.js`, `@solana/spl-token`
- **Database:** SQLite for MVP, Postgres for production

## Planned Project Structure

```text
splitstable/
├── packages/
│   ├── shared/          # Database, Solana logic, shared utilities
│   ├── bot/             # Telegram bot and Solana Pay server
│   └── web/             # Next.js web app
```

## Roadmap

### Stage 1: Telegram Bot MVP

- [x] Product concept and README
- [ ] Turborepo project setup
- [ ] Database layer for users, groups, expenses, and balances
- [ ] Telegram bot commands: `/split`, `/balances`, `/settle`
- [ ] Solana Pay payment links
- [ ] Devnet USDC settlement test
- [ ] Deployment and live group test

### Stage 2: Web App

- [ ] Next.js app with Solana Wallet Adapter
- [ ] Dashboard for groups and expenses
- [ ] Invite links for joining groups
- [ ] In-app USDC settlement
- [ ] Vercel deployment

### Stage 3: Growth

- [ ] Custom split amounts and percentages
- [ ] Multi-currency support with USDC and EURC
- [ ] Smart settle to reduce the number of transactions
- [ ] Receipt parsing
- [ ] SDK for Solana apps that need group payment flows

## Getting Started

Implementation is not published yet. When the MVP code is added, this section will include local setup, environment variables, bot configuration, and devnet testing instructions.

## License

MIT
