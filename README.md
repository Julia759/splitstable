# SplitStable

**Splitwise meets Solana. Split expenses. Settle in USDC. 3 seconds. Zero fees.**

## The Problem

People hold USDC on Solana but splitting group expenses is painful — copying wallet addresses, sending manual transactions one by one, chasing people who forget to pay. Splitwise tracks debts but can't settle. Venmo settles but doesn't work with crypto. Nothing does both.

## The Solution

SplitStable — split expenses and settle in USDC on Solana. Start with a Telegram bot: add it to a group chat, type `/split 50 USDC dinner`, everyone taps one button to pay through their existing wallet (Phantom, Solflare, Backpack). Settled on-chain in 3 seconds for $0.001. No app download, no wallet addresses, no IOUs.

As usage grows, SplitStable becomes a standalone web app with persistent groups, running balances, multi-currency support (USDC + EURC), and smart settle — one tap to clear all debts in a group at once.

## Why Solana?

| Chain | Cost to split 50 USDC between 5 people | Speed |
|-------|---------------------------------------|-------|
| Ethereum | ~$5-15 in gas | 15 sec |
| Polygon | ~$0.05 | 5 sec |
| **Solana** | **~$0.005** | **400ms** |

Splitting a $10 coffee on Ethereum costs more than the coffee. On Solana, you can split a $1 snack and the fee is invisible.

## How It Works

### Telegram Bot (MVP)
```
/newgroup Trip Munich
/split 50 USDC dinner
→ Bot: "Everyone owes 12.50 USDC. Tap to pay."
→ [Pay] button → opens wallet → confirm → settled in 3 sec
```

### Web App
1. Connect your Solana wallet (Phantom, Solflare, Backpack)
2. Create a group, invite friends via link
3. Add expenses — the app tracks who owes who
4. One tap to settle — USDC transfers on-chain instantly

## Tech Stack

- **Monorepo:** Turborepo (packages: bot, web, shared)
- **Bot:** Node.js, TypeScript, grammY, Solana Pay
- **Web:** Next.js 14, Tailwind CSS, Solana Wallet Adapter
- **Blockchain:** Solana, @solana/web3.js, @solana/spl-token
- **Database:** SQLite (MVP) → Postgres (production)

## Project Structure

```
splitstable/
├── packages/
│   ├── shared/          # DB, Solana logic, utils (shared between bot + web)
│   ├── bot/             # Telegram bot + Express server for Solana Pay
│   └── web/             # Next.js web app with wallet connection
```

## Roadmap

### Stage 1 — MVP: Telegram Bot
- [x] Project setup (Turborepo monorepo)
- [ ] Database layer (users, groups, expenses, balances)
- [ ] Telegram bot commands (/split, /balances, /settle)
- [ ] Solana Pay integration (payment links → wallet)
- [ ] Deploy + live test on devnet

### Stage 2 — Web App
- [ ] Next.js app with Solana Wallet Adapter
- [ ] Dashboard, groups, expense tracking
- [ ] In-app USDC payments via connected wallet
- [ ] Invite system (share link → join group)
- [ ] Deploy to Vercel

### Stage 3 — Growth
- [ ] Multi-currency support (USDC + EURC via Jupiter swap)
- [ ] Custom splits (percentages, exact amounts)
- [ ] Smart settle (minimize transactions across all debts)
- [ ] SDK for other Solana apps to embed group payments

## Competitive Landscape

| | Splitwise | Venmo | Revolut | **SplitStable** |
|---|---|---|---|---|
| Track group expenses | Yes | No | No | **Yes** |
| Instant settlement | No | Yes (USD) | Yes (fiat) | **Yes (USDC)** |
| Works globally | Yes | US only | EU/UK | **Worldwide** |
| On-chain | No | No | No | **Yes** |
| Near-zero fees | N/A | Free | Free | **$0.001** |
| Crypto-native | No | No | No | **Yes** |

**No group expense splitting product exists on Solana.** Validated against the Solana ecosystem directory, Colosseum hackathon winners (70+ projects), and GitHub.

## Why Now

1. **Stablecoin adoption is exploding** — Gusto, Mastercard, Western Union onboarding to Solana USDC
2. **Solana fees hit near-zero** — micropayment splits are economically viable
3. **MiCA is live in Europe** — regulatory clarity for stablecoin products
4. **Zero competition** — this product doesn't exist yet

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Julia759/splitstable.git
cd splitstable

# Install dependencies
npm install

# Set up environment variables
cp packages/bot/.env.example packages/bot/.env
# Edit .env with your Telegram bot token and Solana RPC URL

# Run the bot in development
npm run dev --workspace=packages/bot
```

## License

MIT
