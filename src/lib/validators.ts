import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").trim(),
  email: z.string().email("Correo inválido").trim(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const productSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").trim(),
  slug: z.string().trim().toLowerCase().optional(),
  description: z.string().trim().optional(),
  price: z.coerce
    .number("El precio debe ser un número")
    .int("El precio debe ser un número entero")
    .positive("El precio debe ser mayor a 0"),
  stock: z.coerce
    .number("El stock debe ser un número")
    .int("El stock debe ser un número entero")
    .nonnegative("El stock no puede ser negativo"),
  category: z.string().min(1, "Categoría requerida").trim(),
  imageUrl: z.string().trim().optional(),
});

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const shippingSchema = z.object({
  name: z.string().min(2, "El nombre de contacto es requerido").trim(),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .trim(),
  city: z.string().min(2, "La ciudad/comuna es requerida").trim(),
  phone: z
    .string()
    .min(6, "El teléfono debe tener al menos 6 caracteres")
    .trim(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Correo inválido").max(120),
});

export const verifyCodeSchema = z.object({
  email: z.string().trim().email("Correo inválido").max(120),
  code: z.string().regex(/^\d{6}$/, "El código debe tener 6 dígitos"),
});

export const resetPasswordSchema = z.object({
  changeToken: z.string().min(1, "Falta el token de cambio"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ShippingInput = z.infer<typeof shippingSchema>;
