import "server-only";
import { createHash, randomBytes } from "crypto";
import { Resend } from "resend";
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

export function buildResetUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/$/, "")}/recuperar/${token}`;
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  if (!apiKey) {
    console.warn("RESEND_API_KEY no configurado; no se envió email.");
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    subject: "Recupera tu contraseña",
    text: `Recibimos una solicitud para restablecer tu contraseña.\n\nHaz clic en el siguiente enlace para elegir una nueva (válido por 1 hora):\n\n${resetUrl}\n\nSi no fuiste tú, puedes ignorar este correo.`,
  });
  if (error) {
    throw error;
  }
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
