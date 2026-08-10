import "server-only";
import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const token = generateResetToken();
  await db.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });
  return token;
}

export function getAppOrigin(): string {
  return (
    process.env.APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

export function buildResetUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/recuperar/${token}`;
}

export async function getValidResetToken(token: string) {
  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
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
