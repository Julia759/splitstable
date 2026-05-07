# SplitStable

**Telegram-native group expense splitting with USDC settlement on Solana.**

SplitStable turns a group chat into a shared expense ledger. Add the bot to Telegram, create a split, and everyone pays from their existing Solana wallet.

## Status

MVP in progress. I am starting implementation from the planning and positioning work in this repo. The first target is a Telegram bot with devnet USDC settlement, balance tracking, and Solana Pay payment links.

## Product Thinking Case Study

I am using SplitStable as a public product and product marketing case study for a web3 product manager or product marketing manager role.

The project question:

> Can I turn a broad "Splitwise on Solana" idea into a sharper product wedge, credible market story, and demoable MVP?

My role in this repo:

- product strategy: narrowed the audience, wedge, MVP scope, and roadmap
- product marketing: shaped the category, positioning, messaging, demo script, and launch plan
- market research: mapped traditional expense apps, Telegram expense bots, and Solana payment products
- technical storytelling: translated Solana Pay, SPL transfers, payment validation, and non-custodial settlement into product language
- launch planning: designed a build-in-public motion focused on feedback, learning, and iteration

Best files to review:

| Artifact | What it shows |
|----------|---------------|
| [Positioning](docs/positioning.md) | Audience, category, wedge, persona, messaging house, and first-user decision |
| [Competitive landscape](docs/competitive-landscape.md) | Market mapping, competitor interpretation, threat level, and differentiation |
| [Launch plan](docs/launch-plan.md) | Build-in-public narrative, content plan, feedback loop, and learning metrics |
| [Demo script](docs/demo-script.md) | How I would explain the product quickly to users, builders, and hiring teams |
| [Execution plan](EXECUTION_PLAN.md) | Product architecture, MVP milestones, data model, and payment validation logic |

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

- **Monorepo:** pnpm workspaces + TypeScript project references
- **Bot:** Node.js, TypeScript, grammY
- **Web:** Next.js, Tailwind CSS, Solana Wallet Adapter (planned)
- **Blockchain:** Solana, `@solana/web3.js`, `@solana/spl-token` (planned)
- **Database:** SQLite + Prisma for the MVP, Postgres for production

## Project Structure

```text
splitstable/
├── apps/
│   ├── bot/             # Telegram bot (grammY)
│   └── web/             # Next.js web app (placeholder)
├── packages/
│   ├── split-engine/    # Pure split math (USDC base units, equal splits)
│   ├── database/        # Prisma + SQLite persistence (recordSplit, getBalances)
│   └── solana/          # Solana settlement helpers (placeholder)
```

## Roadmap

### Stage 1: Telegram Bot MVP

- [x] Product concept and README
- [x] pnpm workspace project setup
- [x] Database layer for chats, expenses, participant shares, and balances (SQLite + Prisma)
- [x] Telegram bot commands: `/split`, `/balances`, `/addmember`, `/removemember`, `/members`, `/settle` (demo)
- [ ] On-chain USDC payment links (see Solana Pay note below)
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

The first implementation pass is now in the repo: pnpm workspace setup, split-engine package, a local SQLite database, and a Telegram bot runner with persisted balances.

Install dependencies:

```bash
corepack pnpm install
```

Initialize the local SQLite database (first run only):

```bash
corepack pnpm --filter @splitstable/database db:migrate
```

This creates `packages/database/prisma/dev.db` and applies the `TelegramChat`, `Expense`, `ExpenseParticipant`, and `Balance` tables. Re-run any time the schema changes.

Run checks:

```bash
corepack pnpm run build
corepack pnpm run typecheck
corepack pnpm test
```

Run the Telegram bot locally:

1. Create a Telegram bot with BotFather.
2. Copy `.env.example` to `.env`.
3. Add your token:

```text
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

4. Start the bot:

```bash
corepack pnpm run bot:dev
```

Then open Telegram and send:

```text
/start
/addmember Tom
/addmember Sara
/split 30 USDC dinner
/balances
/settle Tom 10
```

Current local bot behavior:

- `/start` introduces SplitStable
- `/help` shows commands
- `/addmember <name>` adds a real participant to this chat
- `/removemember <name>` removes a member (only when they have no outstanding balance)
- `/members` lists current chat members
- `/split 30 USDC dinner` creates a demo equal split among the chat's real members and persists it to SQLite
- `/balances` reads the chat's current outstanding demo balances from SQLite
- `/settle <name> [amount]` marks a debt paid (full if no amount, partial otherwise); the sender can be either side of the debt
- The person who runs `/split` is auto-added as a member if missing
- Splits, balances, and settlements survive bot restarts; multiple splits in the same chat accumulate (with offsetting debts netted)
- Wallet payments and on-chain settlement are not connected yet — `/settle` only updates the local ledger

Useful database commands:

| Command | What it does |
|---------|--------------|
| `corepack pnpm --filter @splitstable/database db:generate` | Regenerate the Prisma client after schema changes |
| `corepack pnpm --filter @splitstable/database db:migrate` | Create and apply a new SQLite migration in development |
| `corepack pnpm --filter @splitstable/database db:studio` | Open Prisma Studio to inspect data in a browser |

## Deploying the Bot to Railway

Run the bot 24/7 without your laptop. Free tier covers the demo workload.

1. Sign up at [railway.com](https://railway.com) with GitHub.
2. Click **New Project** → **Deploy from GitHub repo** → pick `splitstable`.
3. In the new service, open **Settings** → **Volumes** → **Mount a volume**, mount path `/data`, name `splitstable-data`. SQLite needs persistent storage between deploys.
4. Open **Variables** and add:
   - `TELEGRAM_BOT_TOKEN` — from @BotFather
   - `DATABASE_URL` — `file:/data/splitstable.db`
5. Railway auto-detects `pnpm` and runs `pnpm install`, `pnpm run build`, and the `start` script defined in `package.json` (which applies migrations and launches the bot).
6. Once status shows **Active**, stop your local bot (`kill <pid>`) — Telegram only allows one polling instance per token.

Subsequent pushes to `main` redeploy automatically.

## License

MIT
