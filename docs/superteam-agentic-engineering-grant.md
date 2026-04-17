# Superteam Agentic Engineering Grant Draft

Grant link: https://superteam.fun/earn/grants/agentic-engineering

Status checked: April 17, 2026

Current public grant details:

- Grant: Agentic Engineering Grants by Superteam
- Status: Open
- Region: Global
- Cheque size: 200 USDG
- Average response time shown: 1 week

## Files To Attach

- `claude-session.jsonl` in the project root
- `codex-session.jsonl` in the project root
- Colosseum Crowdedness Score screenshot link: `https://drive.google.com/file/d/1fACsiB25WL72Zop8-641w5tLvI3yzTPV/view?usp=sharing`

The transcript files are intentionally gitignored. Attach them to the form, but do not commit them to the public repo.

## Step 1: Basics

**Project Title**

> SplitStable

**One Line Description**

> Telegram-native group expense splitting with USDC settlement on Solana.

**TG username**

> t.me/yuliiazolot

**Wallet Address**

> 4uVDoGUbZFX5f5BNA1QANb1iVDf4wV2boJ3A46w9UnuD

## Step 2: Details

**Project Details**

> SplitStable is a Telegram-first expense splitting product for crypto-native groups that already coordinate in chat and settle with stablecoins. The core user is the person who pays first for a group dinner, trip, hackathon cost, hacker house expense, or shared community purchase, then has to chase everyone else manually. Today that flow usually means copy-pasting wallet addresses, sending screenshots, and tracking who has paid in a separate app.
>
> The MVP turns a Telegram group into a shared expense ledger. A user adds the bot to a group and creates a split with a command such as `/split 50 USDC dinner`. The bot calculates what each person owes, creates payment intents, and gives each participant a Pay button. The user signs from their own Solana wallet, and SplitStable updates the group balance only after validating the on-chain payment.
>
> The Solana architecture is intentionally integration-first. SplitStable does not need a custom smart contract for v1. The MVP uses SPL token transfers for USDC settlement, Solana Pay transaction requests for wallet payment flows, associated token accounts for receiving USDC, and reference keys to identify and validate payment intents. Product state such as users, Telegram groups, expenses, balances, and payment intent status remains off-chain in the application database. SplitStable coordinates payment requests but never custodies user funds.
>
> I am building this in public as a practical product marketing and agentic engineering project. The current repo documents the positioning, competitive landscape, launch plan, demo script, and execution plan. The grant milestone is to move from product strategy and architecture into a working devnet prototype: Telegram split creation, balance tracking, wallet-linked payment intents, Solana Pay handoff, transaction validation, and a short public demo.

**Deadline**

> May 10, 2026, 23:59 IST

Suggested note:

> This date is a proposed delivery target for the first devnet demo. I can adjust it if needed.

**Proof of Work**

> GitHub repo: https://github.com/Julia759/splitstable
>
> Current work completed:
>
> - Initial product concept and README: `f4b8f98 Initial README - SplitStable: Splitwise meets Solana`
> - Improved product positioning and removed unsafe "no competition" claims: `82f8c9a Improve SplitStable positioning`
> - Added Solana architecture and execution plan: `aaea674 Add SplitStable execution plan`
> - Added public product notes for positioning, competitive landscape, launch plan, and demo script: `94698cc Add PMM portfolio docs`
> - Refined docs to speak from my build-in-public point of view: `e8bf2f2 Refine PMM docs voice`
> - Clarified where SplitStable is different from competitors: `325f89d Clarify SplitStable competitor differences`
>
> Relevant artifacts:
>
> - README: https://github.com/Julia759/splitstable/blob/main/README.md
> - Execution plan: https://github.com/Julia759/splitstable/blob/main/EXECUTION_PLAN.md
> - Positioning: https://github.com/Julia759/splitstable/blob/main/docs/positioning.md
> - Competitive landscape: https://github.com/Julia759/splitstable/blob/main/docs/competitive-landscape.md
> - Launch plan: https://github.com/Julia759/splitstable/blob/main/docs/launch-plan.md
> - Demo script: https://github.com/Julia759/splitstable/blob/main/docs/demo-script.md
>
> AI-assisted work evidence:
>
> - `claude-session.jsonl` exported to the project root
> - `codex-session.jsonl` copied to the project root
>
> Current stage: planning, positioning, architecture, and grant application. The implementation phase is next.

**Personal X Profile**

> TODO: https://x.com/yzolotukhina

**Personal GitHub Profile**

> https://github.com/Julia759

**Colosseum Crowdedness Score**

> Colosseum Copilot crowdedness score: 223
>
> Query used: "SplitStable Telegram native group expense splitting USDC settlement Solana Pay wallet signed payments"
>
> Closest matching cluster: Simplified Solana Payment Solutions
>
> Closest matching projects:
>
> - Fatira: onchain group expense splitting app for seamless settlements and verifiable transaction history on Solana. Crowdedness: 223.
> - Tangerii: bill splitting application on Solana for seamless group expense management and instant settlements. Crowdedness: 223.
> - VeraX Pay: Telegram-integrated payment gateway for Solana. Crowdedness: 223.
>
> Screenshot/public proof link: TODO:(https://drive.google.com/file/d/1fACsiB25WL72Zop8-641w5tLvI3yzTPV/view?usp=sharing)

**AI Session Transcript**

> Attach `claude-session.jsonl` and/or `codex-session.jsonl` from the project root. These files prove AI-assisted development and should not be committed publicly.

## Step 3: Milestones

**Goals and Milestones**

> Milestone 1: Project scaffold and split engine, due April 24, 2026
>
> - Set up the monorepo with bot, web, database, split-engine, and Solana packages.
> - Implement equal split calculation, balance updates, and deterministic USDC rounding in base units.
> - Add unit tests for 2-person, 3-person, 5-person, and uneven split cases.
>
> Milestone 2: Telegram MVP without payments, due April 29, 2026
>
> - Implement `/start`, `/newgroup`, `/split`, `/balances`, and `/help`.
> - Persist Telegram users, groups, expenses, participants, and balances.
> - Demonstrate a fake-money group split end to end in Telegram.
>
> Milestone 3: Wallet linking and payment intents, due May 4, 2026
>
> - Build wallet-linking flow using a signed challenge.
> - Link Telegram users to Solana wallet addresses.
> - Create payment intent records with amount, mint, payer, recipient, status, and unique reference key.
>
> Milestone 4: Devnet USDC settlement and validation, due May 8, 2026
>
> - Add Solana Pay transaction request flow.
> - Build wallet-signed devnet USDC transfer transactions.
> - Validate transaction success, reference key, mint, amount, source owner, and destination owner before marking payment confirmed.
>
> Milestone 5: Public demo and launch notes, due May 10, 2026
>
> - Record a 60-90 second demo showing Telegram split creation, wallet payment, and bot confirmation.
> - Update README with demo status and setup instructions.
> - Publish a short build-in-public recap explaining the product, user, Solana architecture, and what changed after feedback.

**Primary KPI**

> Complete one end-to-end devnet flow where a Telegram split creates a payment intent, a participant signs a USDC transfer from their own wallet, and the bot confirms the payment only after on-chain validation.

Optional secondary KPIs:

> - 3 test Telegram groups try the flow
> - 5 completed devnet payment intents
> - 1 public demo video
> - 5 pieces of user or builder feedback captured

**Final Tranche Checkbox**

> I understand that to receive the final tranche, I need to submit the Colosseum project link, GitHub repo, and AI subscription receipt.

## Missing Before Submission

Fill these before submitting:

- Telegram username
- Solana wallet address
- X profile
- Confirm or change the deadline
- Colosseum Crowdedness Score screenshot link. Score found: 223.
- AI subscription receipt
- Optional: short Loom/demo if one is ready

## Submission Link

Submit here: https://superteam.fun/earn/grants/agentic-engineering
