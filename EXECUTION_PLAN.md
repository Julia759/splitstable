# SplitStable Execution Plan

## Architecture Decision

SplitStable should start as an integration-first Solana product, not a custom on-chain program.

The MVP does not need custom program state, custody, escrow, or novel settlement logic. The bot and web app can create normal SPL token transfer transactions, users sign in their own wallets, and the backend validates completed payments on-chain.

This keeps the first version faster to ship, easier to audit, and safer for users.

## Product Surfaces

SplitStable has two user-facing surfaces that share one backend and one settlement engine:

- **Telegram bot:** the fastest wedge for existing group chats
- **Web app:** persistent dashboard for groups, balances, wallet linking, and richer expense management

Both surfaces use the same database models, split calculation logic, payment intent system, and Solana transaction builder.

## Solana Architecture

### MVP Model

No custom Solana program in the MVP.

Use:

- SPL Token transfers for USDC settlement
- Solana Pay transaction requests for wallet payment flows
- Associated Token Accounts for USDC receive accounts
- Reference public keys to identify and validate payment intents
- Memo instructions for human-readable payment context when useful
- Helius or another dedicated RPC provider for transaction lookup and webhooks

### Payment Flow

1. User creates a split in Telegram or the web app.
2. Backend creates expense records and settlement obligations.
3. For each payer, backend creates a `payment_intent`.
4. Each `payment_intent` has:
   - payer user
   - recipient user
   - amount in USDC base units
   - mint address
   - unique reference public key
   - status: `pending`, `submitted`, `confirmed`, `failed`, or `expired`
5. User taps Pay.
6. Wallet opens a Solana Pay transaction request URL.
7. Backend receives wallet account from the transaction request POST.
8. Backend builds an unsigned transaction:
   - fee payer is the user wallet
   - create recipient USDC ATA idempotently if needed
   - transfer checked USDC from payer ATA to recipient ATA
   - include reference key for validation
   - optional memo with SplitStable expense id
9. User signs and submits from wallet.
10. Backend detects the transaction by reference and validates:
    - signature exists
    - transaction succeeded
    - USDC mint matches expected mint
    - source owner matches payer wallet
    - destination owner matches recipient wallet
    - amount matches expected amount
    - reference matches payment intent
11. Backend marks payment as confirmed and updates group balances.

### What Stays Off-Chain

The following state stays in the database:

- users
- Telegram identities
- wallet links
- groups
- memberships
- expenses
- participants
- balances
- payment intents
- reminders
- notification status

This is appropriate because SplitStable is coordinating payments, not custodying funds.

### When to Consider a Custom Program

Do not build this in v1. Revisit a custom program only if SplitStable needs:

- escrowed group funds
- programmable settlement rules enforced on-chain
- dispute windows
- subscriptions or recurring group payments
- shared group vaults
- composable on-chain group credit state
- protocol fees enforced at the transaction layer

If that day comes, use Anchor, PDA-controlled vaults, explicit authority separation, and a security review before mainnet.

## Repository Structure

```text
splitstable/
├── apps/
│   ├── bot/                  # Telegram bot
│   ├── web/                  # Next.js app
│   └── api/                  # Payment/API server, if separated from web
├── packages/
│   ├── database/             # Prisma schema, migrations, DB client
│   ├── split-engine/         # Expense math, balance netting, settlement logic
│   ├── solana/               # Transaction builders and payment validation
│   ├── telegram/             # Telegram-specific helpers
│   ├── ui/                   # Shared UI components for web
│   └── config/               # Shared TypeScript, ESLint, env parsing
├── docs/
│   ├── architecture.md
│   ├── payment-validation.md
│   └── threat-model.md
├── package.json
├── turbo.json
└── README.md
```

## Recommended Stack

### Monorepo

- Turborepo
- pnpm workspaces
- TypeScript strict mode

### Telegram Bot

- Node.js
- grammY
- Webhook mode for production
- Long polling only for local development

### Web App

- Next.js App Router
- React
- Tailwind CSS
- Wallet Standard via Solana wallet adapter or current Solana React tooling

### Backend

- Next.js route handlers or a small Fastify API
- Prisma
- SQLite for local development
- Postgres for production
- Zod for input validation

### Solana

- `@solana/kit` for new TypeScript Solana work where practical
- `@solana/pay` for Solana Pay URLs and payment references
- SPL Token client libraries for USDC transfer instructions
- Helius RPC for devnet/mainnet reads, transaction lookup, and webhooks

### Deployment

- Web: Vercel
- Bot/API: Railway, Fly.io, Render, or a small VPS
- Database: Neon or Supabase Postgres
- RPC: Helius devnet first, mainnet later

## Core Data Model

### User

- `id`
- `telegram_id`
- `telegram_username`
- `display_name`
- `created_at`

### Wallet

- `id`
- `user_id`
- `address`
- `cluster`
- `verified_at`
- `is_primary`

### Group

- `id`
- `telegram_chat_id`
- `name`
- `created_by_user_id`
- `created_at`

### GroupMember

- `id`
- `group_id`
- `user_id`
- `role`
- `joined_at`

### Expense

- `id`
- `group_id`
- `created_by_user_id`
- `paid_by_user_id`
- `description`
- `amount_base_units`
- `mint`
- `split_type`
- `status`
- `created_at`

### ExpenseParticipant

- `id`
- `expense_id`
- `user_id`
- `share_base_units`
- `status`

### Balance

- `id`
- `group_id`
- `from_user_id`
- `to_user_id`
- `mint`
- `amount_base_units`
- `updated_at`

### PaymentIntent

- `id`
- `group_id`
- `expense_id`
- `from_user_id`
- `to_user_id`
- `from_wallet`
- `to_wallet`
- `mint`
- `amount_base_units`
- `reference`
- `signature`
- `status`
- `expires_at`
- `created_at`
- `confirmed_at`

## Telegram MVP Commands

### `/start`

Introduce SplitStable, explain non-custodial payments, and show the user how to connect a wallet.

### `/connect`

Create a wallet-link challenge. The web app handles wallet signature verification and links the wallet to the Telegram user.

### `/newgroup <name>`

Create or name a SplitStable group mapped to the current Telegram chat.

### `/split <amount> <token> <description>`

Example:

```text
/split 50 USDC dinner
```

Default v1 behavior:

- creator is the payer
- all registered group members are participants
- equal split
- participants each owe their share to the payer

### `/balances`

Show who owes who in the current Telegram group.

### `/settle`

Generate payment buttons for outstanding balances.

### `/help`

Show supported commands, examples, and wallet safety notes.

## Web App MVP Screens

### Landing/Auth

- Connect wallet
- Link Telegram account
- Show current devnet/mainnet status clearly

### Dashboard

- User groups
- Outstanding balances
- Pending payment intents

### Group Page

- Members
- Expenses
- Balances
- Add expense form
- Settle button

### Expense Detail

- Description
- Participants
- Shares
- Payment status by participant
- Transaction links

### Pay Page

- Human-readable payment summary
- Wallet connection state
- Pay button
- QR/deep link fallback
- Transaction status after signing

## Build Milestones

### Milestone 0: Project Scaffold

Goal: create the working monorepo and shared foundations.

Deliverables:

- pnpm workspace
- Turborepo config
- TypeScript config
- `apps/bot`
- `apps/web`
- `packages/database`
- `packages/split-engine`
- `packages/solana`
- `.env.example`
- basic CI command: typecheck, lint, test

Done when:

- `pnpm install` works
- `pnpm typecheck` works
- empty bot and web apps start locally

### Milestone 1: Split Engine

Goal: implement the core product math without Solana complexity.

Deliverables:

- equal split calculation
- balance ledger update
- net settlement calculation
- rounding rules for USDC decimals
- unit tests for edge cases

Rules:

- Store token amounts in base units, not floats
- USDC has 6 decimals
- Rounding dust goes to the payer or is assigned deterministically
- Every calculation must be reproducible from expense records

Done when:

- tests cover 2, 3, 5, and uneven participant cases
- no floating-point money math remains

### Milestone 2: Database and API

Goal: persist users, groups, expenses, balances, and payment intents.

Deliverables:

- Prisma schema
- migrations
- CRUD service layer
- API routes for groups, expenses, balances, payment intents
- Zod validation

Done when:

- local SQLite can create a group, add members, add expense, and produce balances
- tests verify the service layer

### Milestone 3: Telegram Bot, No Payments Yet

Goal: make the chat workflow real before touching money.

Deliverables:

- `/start`
- `/newgroup`
- `/split`
- `/balances`
- `/help`
- Telegram chat id to group mapping
- clean error messages

Done when:

- a Telegram group can create a split and view balances
- all state is persisted

### Milestone 4: Wallet Linking

Goal: connect Telegram users to Solana wallets safely.

Deliverables:

- web wallet connect page
- message-signing challenge
- Telegram deep link back to bot
- wallet record stored after verification

Done when:

- a Telegram user can prove wallet ownership
- the bot can show linked wallet status

### Milestone 5: Devnet USDC Payment Intents

Goal: settle one obligation with a wallet-signed devnet transaction.

Deliverables:

- payment intent creation
- reference public key generation
- Solana Pay transaction request endpoint
- transaction builder for USDC transfer
- recipient ATA creation if needed
- payment validation by reference
- explorer link in Telegram and web

Done when:

- one Telegram user can pay another on devnet
- backend validates the transfer and marks it confirmed

### Milestone 6: Web App MVP

Goal: give users a persistent dashboard.

Deliverables:

- dashboard
- group page
- add expense form
- balances view
- payment status
- pay page

Done when:

- the same group can be managed from both Telegram and the web app
- payment status stays consistent across both

### Milestone 7: Smart Settle

Goal: minimize the number of payments needed to clear a group.

Deliverables:

- netting algorithm
- generated settlement plan
- payment intents from netted balances
- tests for complex groups

Done when:

- a group with many expenses produces the minimum practical payment set
- users can pay net balances instead of every individual expense

### Milestone 8: Mainnet Readiness

Goal: prepare for limited mainnet beta.

Deliverables:

- USDC mainnet mint allowlist
- RPC provider config
- webhook/polling reliability
- monitoring
- rate limits
- payment expiration handling
- threat model
- production database
- privacy and support docs

Done when:

- devnet beta has completed
- all critical payment validation tests pass
- mainnet launch checklist is complete

## Payment Validation Checklist

Every confirmed payment must validate:

- expected cluster
- expected signature status
- transaction has no runtime error
- expected reference key is present
- expected mint is used
- expected token amount is transferred
- expected payer wallet owns the source token account
- expected recipient wallet owns the destination token account
- payment intent has not already been confirmed by another signature
- payment intent is not expired

Never mark a payment as settled just because a wallet returned a signature.

## Security Checklist

### Product Security

- No custody
- No backend private key for user funds
- No blind trust in Telegram usernames
- Wallet linking requires signed challenge
- Payment pages show exact recipient, amount, and token
- Expired payment intents cannot be reused

### Solana Security

- Validate mint addresses
- Use base units for token amounts
- Use checked integer math
- Confirm ATA ownership
- Confirm token account mint
- Confirm transaction success through RPC
- Treat wallet-submitted signatures as untrusted until validated

### Backend Security

- Zod-validate every API input
- Rate-limit bot and payment endpoints
- Store secrets only in environment variables
- Log payment state transitions
- Avoid logging full auth tokens
- Use idempotency keys for payment confirmation

## Testing Strategy

### Unit Tests

- split calculation
- rounding
- balance updates
- settlement netting
- payment intent state transitions

### Integration Tests

- create group through service layer
- create expense
- produce balances
- create payment intent
- validate mocked successful payment

### Devnet Tests

- wallet linking
- transaction request creation
- USDC transfer
- payment reference lookup
- failed payment handling

### Manual Beta Tests

- two-person dinner split
- five-person trip split
- payer without USDC ATA
- recipient without USDC ATA
- expired payment link
- duplicate payment attempt
- wallet rejection

## Open Decisions

1. **Backend shape:** Next.js route handlers are simpler; Fastify is cleaner if bot and API run as one service.
2. **Wallet UX:** Use wallet adapter first; evaluate newer Solana React tooling during scaffold.
3. **RPC provider:** Helius is the default recommendation for transaction lookup and webhooks.
4. **Database:** SQLite is enough for local development; Postgres should be used before beta.
5. **Cluster:** devnet first; mainnet only after payment validation is boring and reliable.

## First Build Sprint

The first sprint should stop before real payments.

1. Scaffold monorepo.
2. Add database package and Prisma schema.
3. Add split engine package.
4. Implement equal split and balances.
5. Add Telegram bot commands for `/newgroup`, `/split`, and `/balances`.
6. Run a fake-money group flow end to end.

Only after this works should we add wallet linking and Solana Pay settlement.
