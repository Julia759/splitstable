import { getPrismaClient, type PrismaClient } from "./client.js";

/**
 * Per-chat member management.
 *
 * Members are the real participants in a Telegram group. Names are
 * stored in two forms: a canonical lowercase `name` used as the split
 * engine id and balance key, plus a `displayName` that keeps the
 * original casing for friendly output.
 */

export type ChatId = bigint | number;

export type Member = {
  name: string;
  displayName: string;
  walletAddress: string | null;
};

function toBigIntChatId(chatId: ChatId): bigint {
  return typeof chatId === "bigint" ? chatId : BigInt(chatId);
}

export function canonicalize(rawName: string): string {
  return rawName.trim().toLowerCase();
}

function assertValidName(rawName: string): { name: string; displayName: string } {
  const displayName = rawName.trim();

  if (displayName.length === 0) {
    throw new Error("Member name cannot be empty");
  }

  if (displayName.length > 32) {
    throw new Error("Member name must be 32 characters or fewer");
  }

  if (!/^[\p{L}\p{N}_\- .]+$/u.test(displayName)) {
    throw new Error("Member name can only contain letters, numbers, spaces, dot, dash, underscore");
  }

  return { name: canonicalize(displayName), displayName };
}

export type AddMemberResult = {
  member: Member;
  alreadyExisted: boolean;
};

/**
 * Idempotent upsert. Creating the member also creates the chat row
 * if it does not exist yet, so first contact with a chat always works.
 */
export async function addMember(
  chatId: ChatId,
  rawName: string,
  client: PrismaClient = getPrismaClient()
): Promise<AddMemberResult> {
  const { name, displayName } = assertValidName(rawName);
  const id = toBigIntChatId(chatId);

  return client.$transaction(async (tx) => {
    await tx.telegramChat.upsert({
      where: { id },
      create: { id },
      update: {}
    });

    const existing = await tx.chatMember.findUnique({
      where: { chatId_name: { chatId: id, name } }
    });

    if (existing !== null) {
      return {
        member: {
          name: existing.name,
          displayName: existing.displayName,
          walletAddress: existing.walletAddress
        },
        alreadyExisted: true
      };
    }

    const created = await tx.chatMember.create({
      data: { chatId: id, name, displayName }
    });

    return {
      member: {
        name: created.name,
        displayName: created.displayName,
        walletAddress: created.walletAddress
      },
      alreadyExisted: false
    };
  });
}

/**
 * Remove a member from a chat. Refuses if the member has any
 * outstanding balances in either direction so the ledger stays sane.
 */
export async function removeMember(
  chatId: ChatId,
  rawName: string,
  client: PrismaClient = getPrismaClient()
): Promise<Member> {
  const name = canonicalize(rawName);
  const id = toBigIntChatId(chatId);

  return client.$transaction(async (tx) => {
    const member = await tx.chatMember.findUnique({
      where: { chatId_name: { chatId: id, name } }
    });

    if (member === null) {
      throw new Error(`No member named "${rawName}" in this chat`);
    }

    const outstanding = await tx.balance.count({
      where: {
        chatId: id,
        amountBaseUnits: { gt: 0n },
        OR: [{ fromParticipant: name }, { toParticipant: name }]
      }
    });

    if (outstanding > 0) {
      throw new Error(
        `${member.displayName} still has outstanding balances. Settle them first.`
      );
    }

    await tx.chatMember.delete({
      where: { chatId_name: { chatId: id, name } }
    });

    return {
      name: member.name,
      displayName: member.displayName,
      walletAddress: member.walletAddress
    };
  });
}

/**
 * List all members of a chat in stable insertion order.
 */
export async function listMembers(
  chatId: ChatId,
  client: PrismaClient = getPrismaClient()
): Promise<Member[]> {
  const id = toBigIntChatId(chatId);

  const rows = await client.chatMember.findMany({
    where: { chatId: id },
    orderBy: { createdAt: "asc" }
  });

  return rows.map((row) => ({
    name: row.name,
    displayName: row.displayName,
    walletAddress: row.walletAddress
  }));
}
