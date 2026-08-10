import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockDb, MockAuthError, mockSignIn, mockPasswordReset, mockMailer } = vi.hoisted(() => {
  const mockDb = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  return {
    mockDb,
    MockAuthError: class MockAuthError extends Error {},
    mockSignIn: vi.fn(),
    mockPasswordReset: {
      createPasswordResetCode: vi.fn(),
      canResendCode: vi.fn(),
      verifyResetCode: vi.fn(),
      consumeResetToken: vi.fn(),
      getValidChangeToken: vi.fn(),
    },
    mockMailer: {
      sendPasswordResetCode: vi.fn(),
    },
  };
});

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

vi.mock("next-auth", () => ({
  AuthError: MockAuthError,
}));

vi.mock("@/auth", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: vi.fn(),
}));

vi.mock("@/lib/password-reset", () => ({
  createPasswordResetCode: (...args: unknown[]) =>
    mockPasswordReset.createPasswordResetCode(...args),
  canResendCode: (...args: unknown[]) =>
    mockPasswordReset.canResendCode(...args),
  verifyResetCode: (...args: unknown[]) =>
    mockPasswordReset.verifyResetCode(...args),
  consumeResetToken: (...args: unknown[]) =>
    mockPasswordReset.consumeResetToken(...args),
  getValidChangeToken: (...args: unknown[]) =>
    mockPasswordReset.getValidChangeToken(...args),
}));

vi.mock("@/lib/mailer", () => ({
  sendPasswordResetCode: (...args: unknown[]) =>
    mockMailer.sendPasswordResetCode(...args),
}));

import {
  login,
  register,
  requestPasswordReset,
  verifyResetCodeAction,
  resetPassword,
} from "@/app/actions/auth";

function form(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

describe("register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza datos inválidos", async () => {
    const result = await register(undefined, form({ name: "A", email: "x", password: "123" }));
    expect(result?.error).toBeTruthy();
    expect(mockDb.user.create).not.toHaveBeenCalled();
  });

  it("rechaza correo ya registrado", async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: "u1" });
    const result = await register(
      undefined,
      form({ name: "Ana", email: "demo@tienda.cl", password: "secreta123" }),
    );
    expect(result?.error).toBe("Ya existe una cuenta con ese correo.");
  });

  it("crea el usuario y llama signIn cuando todo es válido", async () => {
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({ id: "u1" });
    mockSignIn.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
    await expect(
      register(undefined, form({ name: "Ana", email: "ana@tienda.cl", password: "secreta123" })),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mockDb.user.create).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({ email: "ana@tienda.cl", password: "secreta123" }),
    );
  });
});

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve error de credenciales con AuthError", async () => {
    mockSignIn.mockRejectedValue(new MockAuthError("creds"));
    const result = await login(undefined, form({ email: "a@b.cl", password: "x" }));
    expect(result?.error).toBe("Credenciales incorrectas.");
  });
});

describe("requestPasswordReset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza un correo inválido", async () => {
    const result = await requestPasswordReset(undefined, form({ email: "no" }));
    expect(result?.error).toBeTruthy();
    expect(mockDb.user.findUnique).not.toHaveBeenCalled();
  });

  it("envía el código por email si el usuario existe", async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: "u1", email: "demo@tienda.cl" });
    mockPasswordReset.canResendCode.mockResolvedValue(true);
    mockPasswordReset.createPasswordResetCode.mockResolvedValue("123456");

    const result = await requestPasswordReset(undefined, form({ email: "demo@tienda.cl" }));
    expect(result?.ok).toBe(true);
    expect(result?.changeToken).toBeUndefined();
    expect(mockPasswordReset.createPasswordResetCode).toHaveBeenCalledWith("u1");
    expect(mockMailer.sendPasswordResetCode).toHaveBeenCalledWith("demo@tienda.cl", "123456");
  });

  it("no filtra usuarios inexistentes (misma respuesta ok)", async () => {
    mockDb.user.findUnique.mockResolvedValue(null);
    const result = await requestPasswordReset(undefined, form({ email: "nadie@tienda.cl" }));
    expect(result?.ok).toBe(true);
    expect(mockPasswordReset.createPasswordResetCode).not.toHaveBeenCalled();
  });

  it("no reenvía durante el cooldown", async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: "u1", email: "demo@tienda.cl" });
    mockPasswordReset.canResendCode.mockResolvedValue(false);

    const result = await requestPasswordReset(undefined, form({ email: "demo@tienda.cl" }));
    expect(result?.ok).toBe(true);
    expect(mockPasswordReset.createPasswordResetCode).not.toHaveBeenCalled();
  });
});

describe("verifyResetCodeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve el changeToken si el código es válido", async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: "u1", email: "demo@tienda.cl" });
    mockPasswordReset.verifyResetCode.mockResolvedValue({ ok: true, changeToken: "ct123" });

    const result = await verifyResetCodeAction(
      undefined,
      form({ email: "demo@tienda.cl", code: "123456" }),
    );
    expect(result?.ok).toBe(true);
    expect(result?.changeToken).toBe("ct123");
    expect(mockPasswordReset.verifyResetCode).toHaveBeenCalledWith("u1", "123456");
  });

  it("rechaza un código inválido", async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: "u1", email: "demo@tienda.cl" });
    mockPasswordReset.verifyResetCode.mockResolvedValue({ ok: false, reason: "invalid" });

    const result = await verifyResetCodeAction(
      undefined,
      form({ email: "demo@tienda.cl", code: "000000" }),
    );
    expect(result?.error).toBe("El código es inválido o ya expiró.");
  });

  it("rechaza un código mal formado", async () => {
    const result = await verifyResetCodeAction(
      undefined,
      form({ email: "demo@tienda.cl", code: "abc" }),
    );
    expect(result?.error).toBeTruthy();
    expect(mockDb.user.findUnique).not.toHaveBeenCalled();
  });
});

describe("resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza contraseña corta", async () => {
    const result = await resetPassword(undefined, form({ changeToken: "t", password: "123" }));
    expect(result?.error).toBeTruthy();
    expect(mockDb.user.update).not.toHaveBeenCalled();
  });

  it("rechaza changeToken inválido o expirado", async () => {
    mockPasswordReset.getValidChangeToken.mockResolvedValue(null);
    const result = await resetPassword(undefined, form({ changeToken: "malo", password: "nueva12345" }));
    expect(result?.error).toBe("El enlace es inválido o ya expiró.");
  });

  it("actualiza la contraseña y consume el changeToken", async () => {
    mockPasswordReset.getValidChangeToken.mockResolvedValue({ id: "rt1", userId: "u1" });
    const result = await resetPassword(undefined, form({ changeToken: "bueno", password: "nueva12345" }));
    expect(result?.ok).toBe(true);
    expect(mockDb.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: expect.objectContaining({ passwordHash: expect.any(String) }),
      }),
    );
    expect(mockPasswordReset.consumeResetToken).toHaveBeenCalledWith("rt1");
  });
});
