-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" BIGINT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toName" TEXT NOT NULL,
    "amountBaseUnits" BIGINT NOT NULL,
    "reference" TEXT NOT NULL,
    "recipientWallet" TEXT NOT NULL,
    "senderWallet" TEXT NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "txSignature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentIntent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "TelegramChat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_reference_key" ON "PaymentIntent"("reference");

-- CreateIndex
CREATE INDEX "PaymentIntent_chatId_idx" ON "PaymentIntent"("chatId");

-- CreateIndex
CREATE INDEX "PaymentIntent_status_expiresAt_idx" ON "PaymentIntent"("status", "expiresAt");
