"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  verifyCodeSchema,
} from "@/lib/validators";
import {
  createPasswordResetCode,
  canResendCode,
  verifyResetCode,
  consumeResetToken,
  getValidChangeToken,
} from "@/lib/password-reset";
import { sendPasswordResetCode } from "@/lib/mailer";

export type AuthState = { error?: string } | undefined;

export async function register(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({
    data: { name, email, passwordHash },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Cuenta creada, pero no se pudo iniciar sesión." };
    }
    throw error;
  }
}

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Credenciales incorrectas." };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export type ResetState =
  | { error?: string; ok?: boolean; email?: string; changeToken?: string }
  | undefined;

export async function requestPasswordReset(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: "Escribe un correo válido." };
  }

  const { email } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  if (user && (await canResendCode(user.id))) {
    const code = await createPasswordResetCode(user.id);
    try {
      await sendPasswordResetCode(email, code);
    } catch (err) {
      console.error("FORGOT-PASSWORD-EMAIL-ERROR", err);
    }
  }

  return { ok: true, email };
}

export async function verifyResetCodeAction(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = verifyCodeSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: "El código es inválido o ya expiró." };
  }

  const { email, code } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "El código es inválido o ya expiró." };
  }

  const result = await verifyResetCode(user.id, code);
  if (!result.ok) {
    return { error: "El código es inválido o ya expiró." };
  }

  return { ok: true, changeToken: result.changeToken };
}

export async function resetPassword(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetPasswordSchema.safeParse({
    changeToken: formData.get("changeToken"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const record = await getValidChangeToken(parsed.data.changeToken);
  if (!record) {
    return { error: "El enlace es inválido o ya expiró." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });
  await consumeResetToken(record.id);

  return { ok: true };
}
