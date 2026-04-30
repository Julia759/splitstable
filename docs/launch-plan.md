# SplitStable Launch Plan

## Purpose

This is my build-in-public launch plan for SplitStable.

I am not treating this like a fundraising launch or a hackathon trophy hunt. I am using it as a public product marketing lab: a place to show how an idea becomes a message, how a message becomes a demo, and how a demo becomes a conversation.

First research, then idea, story arc and product I'm developing from scratch. In this project I'm combinig both product marketing and product management roles. This two should always be on the same page. Then success is guaranteed.  

## Launch Objective

Primary objective:

> Build a public story around SplitStable that makes the product, the user, and the Solana payment architecture easy to understand.

Secondary objectives:

- get feedback from Solana and Telegram-native users
- show how I narrow a broad product idea into a simple wedge
- document the competitive landscape honestly
- explain Solana architecture in plain language
- produce a short demo that makes the idea obvious
- create a public archive of positioning decisions, mistakes, and revisions

## Audience

### Primary Audience

People who care about web3 products and how they are brought to market:

- product marketers
- Solana builders
- founders
- developer relations teams
- community leads
- product managers
- crypto-native users who live in Telegram

### Beta Audience

Small Telegram groups that already use crypto:

- hackathon teams
- Solana builders
- hacker houses
- digital nomads
- friends who use USDC

## Narrative Thesis

SplitStable starts with a tiny behavior:

> Someone pays for the group, then everyone else has to settle up.

That behavior is old. The context is new.

Crypto-native groups coordinate in Telegram, hold stablecoins, and often live across borders. Traditional payment apps are fragmented by country. Expense trackers stop at IOUs. Wallets settle payments but do not understand group context.

SplitStable is the bridge:

> Telegram is the coordination layer. Solana is the settlement layer.

## Creative Spine

The creative line:

> Split in chat. Settle on Solana.

The visual story:

1. A group chat is messy.
2. A bot turns the mess into a clear split.
3. A wallet turns the split into a confirmed payment.
4. The chat becomes calm again.

The emotional story:

> No awkward chasing. No copy-pasted wallet addresses. No "did you pay me?" screenshots.

## Launch Principles

1. Write from my point of view.
2. Share decisions before they look perfect.
3. Make every post useful on its own.
4. Keep the demo smaller than the vision.
5. Be honest about competitors.
6. Do not pretend this is a finished company.
7. Explain the chain only when it helps the user story.
8. Let the audience see the work getting sharper.

## Scope For Public Demo

The demo should show one memorable loop:

1. A Telegram command creates a split.
2. Group members see what they owe.
3. A Pay button opens a wallet or payment page.
4. A devnet USDC payment is submitted or clearly simulated.
5. The bot updates the balance after confirmation.

This is enough.

Can be mocked if necessary:

- production database
- mainnet settlement
- advanced dashboard
- receipt scanning
- multi-currency
- smart settle

Out of scope:

- mainnet launch
- token
- custom Solana program
- legal/compliance claims
- fundraising pitch
- complex analytics

## Launch Timeline

### Week 1: Name The Shape

Deliverables:

- positioning doc
- competitive landscape doc
- demo script
- launch plan
- first build-in-public post

Public content:

- "I am building SplitStable in public."
- "The positioning question: is this Splitwise on Solana, or something sharper?"
- "The current answer: Telegram-first USDC settlement for crypto groups."

Success signal:

- 3-5 people understand the concept and ask a useful question.

### Week 2: Map The Room

Deliverables:

- competitor teardown
- user interview questions
- feedback form
- audience/persona refinement

Public content:

- "I mapped the landscape and the space is not empty."
- "Telegram expense bots prove the chat behavior."
- "Solana split apps prove the settlement behavior."
- "SplitStable lives in the overlap."

Success signal:

- 3 user conversations or feedback replies.

### Week 3: Show The Skeleton

Deliverables:

- rough Telegram flow
- screenshots or screen recording
- technical explainer: why no custom smart contract for v1
- rough demo draft

Public content:

- "The MVP is one loop: split, pay, confirm."
- "Why I am not starting with a smart contract."
- "What I learned from making the demo smaller."

Success signal:

- someone can explain the product back in one sentence.

### Week 4: Publish The Demo

Deliverables:

- polished 60-90 second demo
- 3-minute walkthrough
- README update
- launch post
- product walkthrough thread

Public content:

- final demo video
- launch post on LinkedIn
- launch thread on X
- GitHub repo link

Success signal:

- 5-10 useful comments from builders, product people, or crypto users.
- at least one person points out a real positioning or UX issue.

### Week 5: Turn Feedback Into Learning

Deliverables:

- retrospective doc
- "what I would change" section
- updated positioning
- next-step decision: build deeper, pause, or turn into a public recap

Public content:

- "What changed after feedback."
- "Five positioning lessons from SplitStable."
- "What I would build next if this became real."

Success signal:

- the project has a clear before-and-after story.

## Content Calendar

### Post 1: The Public Start

Angle:

I am starting with the problem, not the polish.

Draft:

> I am building SplitStable in public: a small Solana payments experiment around one question. What if a Telegram group could split an expense and settle in USDC without copying wallet addresses?
>
> I will share the positioning, competitor research, architecture decisions, and demo as the idea gets sharper.

### Post 2: The Problem

Angle:

Group expenses are social before they are financial.

Draft:

> The product insight behind SplitStable: expense splitting starts as a conversation.
>
> "Who paid?"
> "How much do I owe?"
> "Where do I send it?"
>
> For crypto groups, that conversation already happens in Telegram. The payment still happens somewhere else.

### Post 3: The Landscape

Angle:

Competition makes the idea clearer.

Draft:

> I mapped the SplitStable landscape and found three worlds:
>
> 1. expense apps that track IOUs
> 2. Telegram bots that organize group costs
> 3. Solana apps that settle payments
>
> The wedge is not "bill splitting." The wedge is Telegram-native USDC settlement.

### Post 4: The Technical Choice

Angle:

Good web3 product thinking includes knowing what not to put on-chain.

Draft:

> SplitStable does not need a custom Solana program for v1.
>
> The MVP can use SPL token transfers, Solana Pay links, reference keys, and backend validation.
>
> The user benefit is simpler than the architecture: tap Pay, sign with wallet, see the group balance update.

### Post 5: The Scope Cut

Angle:

Small demo, sharp story.

Draft:

> I cut the SplitStable MVP down to one loop:
>
> `/split 50 USDC dinner`
> tap Pay
> sign with wallet
> bot confirms
>
> Everything else waits. A small demo with a clear story beats a big roadmap with no aha moment.

### Post 6: The Demo

Angle:

Show, then explain.

Draft:

> Demo: Split in chat. Settle on Solana.
>
> A Telegram group creates a USDC split, a user pays from their wallet, and the bot updates the balance after transaction confirmation.

### Post 7: The Retrospective

Angle:

Turn the project into learning.

Draft:

> What SplitStable taught me:
>
> Start with behavior, not technology.
> The first user should feel specific.
> Competitors are not a reason to stop.
> The blockchain part should make the product easier to trust, not harder to understand.
> The demo has to prove the positioning.

## Launch Assets

Create these assets before sharing the final demo:

- GitHub README
- positioning doc
- competitive landscape doc
- launch plan
- demo script
- 60-90 second demo video
- 3-minute walkthrough video
- LinkedIn launch post
- X launch thread
- one-page public recap

## Feedback Plan

Ask 5-10 people these questions:

1. What do you think SplitStable does after reading one sentence?
2. Would your group ever split expenses in Telegram?
3. Do you already use USDC with friends or teammates?
4. Where would you expect the payment to happen?
5. What feels confusing or risky?
6. Which competitor does this remind you of?
7. What would make the demo more believable?

Capture feedback in a simple table:

| Person | Segment | Key quote | Confusion | Signal | Follow-up |
|--------|---------|-----------|-----------|--------|-----------|

## Learning Loop

The goal is not to prove that the first version of the story was right. The goal is to show how the story gets sharper after contact with real people.

I will track feedback in three layers:

1. What people repeat back
2. What people misunderstand
3. What I change because of it

### Feedback Tracker

| Date | Person or segment | What they understood | What confused them | Objection or risk | My response | Follow-up |
|------|-------------------|----------------------|--------------------|-------------------|-------------|-----------|
| TODO | Solana hackathon builder | TODO | TODO | TODO | TODO | TODO |
| TODO | Product marketer | TODO | TODO | TODO | TODO | TODO |
| TODO | Telegram-heavy crypto user | TODO | TODO | TODO | TODO | TODO |

### Decision Log

Use this when feedback changes the product, positioning, demo, or launch plan.

| Date | Decision | Input that caused it | Tradeoff | What changed |
|------|----------|----------------------|----------|--------------|
| April 27, 2026 | Start implementation from the Telegram bot MVP instead of the web dashboard | The strongest wedge is the existing group chat behavior | Web dashboard polish waits | The first build sprint focuses on `/newgroup`, `/split`, and `/balances` |
| TODO | TODO | TODO | TODO | TODO |

### Before And After Positioning

This section is intentionally unfinished until feedback comes in.

| Version | Positioning | Why it changed |
|---------|-------------|----------------|
| v0 | Splitwise meets Solana | Too generic and too easy to dismiss as a crypto clone |
| v1 | Telegram-first USDC settlement for Solana groups | Sharper surface, sharper user, clearer technical reason for Solana |
| v2 | TODO after feedback | TODO |

### Questions I Want Feedback To Answer

- Does the first user feel specific enough?
- Is Telegram actually the right wedge, or just a convenient demo surface?
- Does USDC settlement feel like a real painkiller for Solana groups?
- Which part feels least believable: wallet linking, payment flow, reminders, or group adoption?
- Would a hiring manager understand my product and PMM thinking from the repo alone?

## Metrics

Because this is a public learning launch, measure clarity and conversation.

### Public Learning Metrics

- number of build-in-public posts
- number of meaningful comments
- number of feedback conversations
- number of people who can repeat the positioning
- number of objections discovered

### Product Signal Metrics

- number of Telegram groups tested
- number of split flows completed
- number of payment flows completed
- drop-off point in the flow
- repeated "I understand it" reactions

### Artifact Metrics

- README clarity
- demo completion rate
- competitive landscape usefulness
- quality of feedback received

## Feedback Message

Use this when asking for input:

```text
Hi [Name], I am building SplitStable in public: a Telegram-first USDC settlement flow for Solana groups.

I am trying to make the positioning and demo sharper. Would you be open to giving quick feedback on what feels clear, confusing, or risky?
```

## Risks

### Risk: The project looks too small

Response:

The scope is intentionally narrow. I want one product loop that people understand immediately.

### Risk: The product has competitors

Response:

Good. That means the behavior is real. The work is to find the sharper wedge.

### Risk: The demo is not production-ready

Response:

The demo proves the core behavior. The architecture docs explain what production would require.

### Risk: The project sounds too much like a startup pitch

Response:

Keep the voice honest: this is a public product experiment, not a fundraising deck.

## Success Definition

This launch succeeds if the public story gets sharper over time.

The ideal reaction:

> I understand the product, I understand who it is for, and I can see how the thinking evolved.
