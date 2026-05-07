-- CreateTable
CREATE TABLE "ChatMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "walletAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMember_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "TelegramChat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ChatMember_chatId_idx" ON "ChatMember"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMember_chatId_name_key" ON "ChatMember"("chatId", "name");
