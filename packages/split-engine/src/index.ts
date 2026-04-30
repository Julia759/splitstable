export const USDC_DECIMALS = 6;
export const USDC_BASE_UNITS = 10n ** BigInt(USDC_DECIMALS);

export type ParticipantId = string;

export type EqualSplitInput = {
  amountBaseUnits: bigint;
  participantIds: ParticipantId[];
  payerId: ParticipantId;
};

export type ParticipantShare = {
  participantId: ParticipantId;
  shareBaseUnits: bigint;
};

export type BalanceEntry = {
  fromParticipantId: ParticipantId;
  toParticipantId: ParticipantId;
  amountBaseUnits: bigint;
};

export type EqualSplitResult = {
  amountBaseUnits: bigint;
  payerId: ParticipantId;
  shares: ParticipantShare[];
  balances: BalanceEntry[];
};

export function parseUsdcToBaseUnits(amount: string): bigint {
  const normalized = amount.trim();
  const match = /^(\d+)(?:\.(\d{0,6}))?$/.exec(normalized);

  if (!match) {
    throw new Error("USDC amount must be a non-negative decimal with at most 6 places");
  }

  const [, whole, fractional = ""] = match;
  const paddedFractional = fractional.padEnd(USDC_DECIMALS, "0");

  return BigInt(whole) * USDC_BASE_UNITS + BigInt(paddedFractional || "0");
}

export function formatUsdcFromBaseUnits(amountBaseUnits: bigint): string {
  if (amountBaseUnits < 0n) {
    throw new Error("USDC amount cannot be negative");
  }

  const whole = amountBaseUnits / USDC_BASE_UNITS;
  const fractional = amountBaseUnits % USDC_BASE_UNITS;
  const fractionalText = fractional.toString().padStart(USDC_DECIMALS, "0").replace(/0+$/, "");

  return fractionalText.length > 0 ? `${whole}.${fractionalText}` : whole.toString();
}

export function createEqualSplit(input: EqualSplitInput): EqualSplitResult {
  const participantIds = [...input.participantIds];

  if (input.amountBaseUnits <= 0n) {
    throw new Error("Split amount must be greater than zero");
  }

  if (participantIds.length < 2) {
    throw new Error("An equal split needs at least two participants");
  }

  assertUniqueParticipants(participantIds);

  if (!participantIds.includes(input.payerId)) {
    throw new Error("Payer must be one of the participants");
  }

  const participantCount = BigInt(participantIds.length);
  const baseShare = input.amountBaseUnits / participantCount;
  const remainder = Number(input.amountBaseUnits % participantCount);

  const shares = participantIds.map((participantId, index) => ({
    participantId,
    shareBaseUnits: baseShare + (index < remainder ? 1n : 0n)
  }));

  const balances = shares
    .filter((share) => share.participantId !== input.payerId && share.shareBaseUnits > 0n)
    .map((share) => ({
      fromParticipantId: share.participantId,
      toParticipantId: input.payerId,
      amountBaseUnits: share.shareBaseUnits
    }));

  return {
    amountBaseUnits: input.amountBaseUnits,
    payerId: input.payerId,
    shares,
    balances
  };
}

function assertUniqueParticipants(participantIds: ParticipantId[]): void {
  const uniqueIds = new Set(participantIds);

  if (uniqueIds.size !== participantIds.length) {
    throw new Error("Participant ids must be unique");
  }
}
