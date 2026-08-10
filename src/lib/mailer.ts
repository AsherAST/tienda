import "server-only";
import nodemailer from "nodemailer";

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

export async function sendPasswordResetCode(
  to: string,
  code: string,
): Promise<void> {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP no configurado");
    }
    console.log(`[DEV] Código de recuperación para ${to}: ${code}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: "Tu código para recuperar tu contraseña",
    text: `Tu código de recuperación es: ${code}.\nVálido por 10 minutos. Si no lo pediste, ignora este correo.`,
  });
}
