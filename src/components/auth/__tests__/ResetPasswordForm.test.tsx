import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const { routerPush, resetMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  resetMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/app/actions/auth", () => ({
  resetPassword: (...args: unknown[]) => resetMock(...args),
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("envía changeToken y nueva contraseña, limpia el token y navega", async () => {
    sessionStorage.setItem("changeToken", "ct123");
    resetMock.mockResolvedValue({ ok: true });

    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByLabelText("Nueva contraseña"), "nueva12345");
    await userEvent.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    await waitFor(() =>
      expect(sessionStorage.getItem("changeToken")).toBeNull(),
    );
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/login"));
  });

  it("avisa si no hay changeToken verificado", async () => {
    render(<ResetPasswordForm />);

    expect(
      await screen.findByText(
        "No hay un código verificado. Solicita un nuevo código de recuperación.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cambiar contraseña" }),
    ).not.toBeInTheDocument();
  });

  it("muestra el error del servidor", async () => {
    sessionStorage.setItem("changeToken", "ct123");
    resetMock.mockResolvedValue({ error: "El enlace es inválido o ya expiró." });

    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByLabelText("Nueva contraseña"), "nueva12345");
    await userEvent.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    expect(
      await screen.findByText("El enlace es inválido o ya expiró."),
    ).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });
});
