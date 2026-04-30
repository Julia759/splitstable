-- CreateTable
CREATE TABLE "TelegramChat" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" BIGINT NOT NULL,
    "description" TEXT NOT NULL,
    "token" TEXT NOT NULL DEFAULT 'USDC',
    "amountBaseUnits" BIGINT NOT NULL,
    "payerName" TEXT NOT NULL,
    "payerWalletAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "TelegramChat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpenseParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expenseId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "shareBaseUnits" BIGINT NOT NULL,
    "walletAddress" TEXT,
    CONSTRAINT "ExpenseParticipant_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" BIGINT NOT NULL,
    "fromParticipant" TEXT NOT NULL,
    "toParticipant" TEXT NOT NULL,
    "amountBaseUnits" BIGINT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Balance_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "TelegramChat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Expense_chatId_idx" ON "Expense"("chatId");

-- CreateIndex
CREATE INDEX "ExpenseParticipant_expenseId_idx" ON "ExpenseParticipant"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseParticipant_expenseId_participantName_key" ON "ExpenseParticipant"("expenseId", "participantName");

-- CreateIndex
CREATE INDEX "Balance_chatId_idx" ON "Balance"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_chatId_fromParticipant_toParticipant_key" ON "Balance"("chatId", "fromParticipant", "toParticipant");
