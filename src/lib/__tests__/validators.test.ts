import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validators";

describe("loginSchema", () => {
  it("acepta credenciales válidas", () => {
    const result = loginSchema.safeParse({
      email: "demo@tienda.cl",
      password: "demo1234",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza correo inválido", () => {
    const result = loginSchema.safeParse({
      email: "no-es-correo",
      password: "demo1234",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña vacía", () => {
    const result = loginSchema.safeParse({ email: "a@b.cl", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("acepta datos válidos", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@tienda.cl",
      password: "secreta123",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre demasiado corto", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "ana@tienda.cl",
      password: "secreta123",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña menor a 8 caracteres", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@tienda.cl",
      password: "corta",
    });
    expect(result.success).toBe(false);
  });
});
