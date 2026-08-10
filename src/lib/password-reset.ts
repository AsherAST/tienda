import "server-only";
import { createHash, randomBytes, randomInt } from "crypto";
import { db } from "@/lib/db";

export const CODE_TTL_MS = 10 * 60 * 1000;
export const CHANGE_TOKEN_TTL_MS = 15 * 60 * 1000;
export const CODE_MAX_ATTEMPTS = 5;
export const CODE_RESEND_COOLDOWN_MS = 60 * 1000;

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function generateChangeToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetCode(userId: string) {
  await db.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });

  const code = generateCode();
  await db.passwordResetToken.create({
    data: {
      userId,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });
  return code;
}

export async function canResendCode(userId: string): Promise<boolean> {
  const latest = await db.passwordResetToken.findFirst({
    where: { userId, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return true;
  return Date.now() - latest.createdAt.getTime() >= CODE_RESEND_COOLDOWN_MS;
}

export async function verifyResetCode(userId: string, code: string) {
  const record = await db.passwordResetToken.findFirst({
    where: { userId, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return { ok: false as const, reason: "invalid" };
  if (record.expiresAt < new Date()) {
    return { ok: false as const, reason: "invalid" };
  }
  if (record.attempts >= CODE_MAX_ATTEMPTS) {
    return { ok: false as const, reason: "invalid" };
  }

  const valid = record.codeHash === hashCode(code);
  if (!valid) {
    await db.passwordResetToken.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false as const, reason: "invalid" };
  }

  const changeToken = generateChangeToken();
  await db.passwordResetToken.update({
    where: { id: record.id },
    data: {
      changeTokenHash: hashToken(changeToken),
      expiresAt: new Date(Date.now() + CHANGE_TOKEN_TTL_MS),
    },
  });

  return { ok: true as const, changeToken };
}

export async function getValidChangeToken(changeToken: string) {
  const record = await db.passwordResetToken.findUnique({
    where: { changeTokenHash: hashToken(changeToken) },
    include: { user: true },
  });
  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;
  return record;
}

export async function consumeResetToken(id: string) {
  await db.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}
