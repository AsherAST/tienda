"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import {
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validators";
import {
  createPasswordResetToken,
  consumeResetToken,
  getValidResetToken,
  getAppOrigin,
  buildResetUrl,
} from "@/lib/password-reset";

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
  | { error?: string; ok?: boolean; resetUrl?: string }
  | undefined;

export async function requestPasswordReset(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Escribe un correo válido." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    const token = await createPasswordResetToken(user.id);
    return { resetUrl: buildResetUrl(getAppOrigin(), token) };
  }

  return { ok: true, resetUrl: undefined };
}

export async function resetPassword(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const record = await getValidResetToken(token);
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
