import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockDb, MockAuthError, mockSignIn, mockPasswordReset } = vi.hoisted(() => {
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
      createPasswordResetToken: vi.fn(),
      consumeResetToken: vi.fn(),
      getValidResetToken: vi.fn(),
      getAppOrigin: vi.fn(),
      buildResetUrl: vi.fn(),
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
  createPasswordResetToken: (...args: unknown[]) =>
    mockPasswordReset.createPasswordResetToken(...args),
  consumeResetToken: (...args: unknown[]) =>
    mockPasswordReset.consumeResetToken(...args),
  getValidResetToken: (...args: unknown[]) =>
    mockPasswordReset.getValidResetToken(...args),
  getAppOrigin: (...args: unknown[]) => mockPasswordReset.getAppOrigin(...args),
  buildResetUrl: (...args: unknown[]) => mockPasswordReset.buildResetUrl(...args),
}));

import { login, register, requestPasswordReset, resetPassword } from "@/app/actions/auth";

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

  it("envía el email y crea el token si el usuario existe", async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: "u1", email: "demo@tienda.cl" });
    mockPasswordReset.createPasswordResetToken.mockResolvedValue("tok123");
    mockPasswordReset.getAppOrigin.mockReturnValue("http://localhost:3000");
    mockPasswordReset.buildResetUrl.mockReturnValue("http://localhost:3000/recuperar/tok123");

    const result = await requestPasswordReset(undefined, form({ email: "demo@tienda.cl" }));
    expect(result?.resetUrl).toBe("http://localhost:3000/recuperar/tok123");
    expect(mockPasswordReset.createPasswordResetToken).toHaveBeenCalledWith("u1");
  });

  it("no filtra usuarios inexistentes (misma respuesta ok)", async () => {
    mockDb.user.findUnique.mockResolvedValue(null);
    const result = await requestPasswordReset(undefined, form({ email: "nadie@tienda.cl" }));
    expect(result?.ok).toBe(true);
    expect(mockPasswordReset.createPasswordResetToken).not.toHaveBeenCalled();
  });
});

describe("resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza contraseña corta", async () => {
    const result = await resetPassword(undefined, form({ token: "t", password: "123" }));
    expect(result?.error).toBeTruthy();
    expect(mockDb.user.update).not.toHaveBeenCalled();
  });

  it("rechaza token inválido o expirado", async () => {
    mockPasswordReset.getValidResetToken.mockResolvedValue(null);
    const result = await resetPassword(undefined, form({ token: "malo", password: "nueva12345" }));
    expect(result?.error).toBe("El enlace es inválido o ya expiró.");
  });

  it("actualiza la contraseña y consume el token", async () => {
    mockPasswordReset.getValidResetToken.mockResolvedValue({ id: "rt1", userId: "u1" });
    const result = await resetPassword(undefined, form({ token: "bueno", password: "nueva12345" }));
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
