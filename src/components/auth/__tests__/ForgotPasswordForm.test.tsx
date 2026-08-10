import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

const { routerPush, requestMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  requestMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/app/actions/auth", () => ({
  requestPasswordReset: (...args: unknown[]) => requestMock(...args),
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envía el correo y navega a la pantalla de código", async () => {
    requestMock.mockResolvedValue({ ok: true, email: "ana@tienda.cl" });

    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText("Correo"), "ana@tienda.cl");
    await userEvent.click(
      screen.getByRole("button", { name: "Enviar código de recuperación" }),
    );

    await waitFor(() =>
      expect(routerPush).toHaveBeenCalledWith(
        "/recuperar/codigo?email=ana%40tienda.cl",
      ),
    );
  });

  it("muestra el error del servidor", async () => {
    requestMock.mockResolvedValue({ error: "Escribe un correo válido." });

    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText("Correo"), "otro@tienda.cl");
    await userEvent.click(
      screen.getByRole("button", { name: "Enviar código de recuperación" }),
    );

    expect(await screen.findByText("Escribe un correo válido.")).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });
});
