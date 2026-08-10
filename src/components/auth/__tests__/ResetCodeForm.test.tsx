import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetCodeForm } from "@/components/auth/ResetCodeForm";

const { routerPush, verifyMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  verifyMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/app/actions/auth", () => ({
  verifyResetCodeAction: (...args: unknown[]) => verifyMock(...args),
}));

describe("ResetCodeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("verifica el código, guarda el changeToken y navega", async () => {
    verifyMock.mockResolvedValue({ ok: true, changeToken: "ct123" });

    render(<ResetCodeForm email="ana@tienda.cl" />);

    await userEvent.type(screen.getByLabelText("Código"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Verificar código" }));

    await waitFor(() =>
      expect(sessionStorage.getItem("changeToken")).toBe("ct123"),
    );
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/recuperar/cambiar"));
  });

  it("muestra el error si el código es inválido", async () => {
    verifyMock.mockResolvedValue({ error: "El código es inválido o ya expiró." });

    render(<ResetCodeForm email="ana@tienda.cl" />);

    await userEvent.type(screen.getByLabelText("Código"), "000000");
    await userEvent.click(screen.getByRole("button", { name: "Verificar código" }));

    expect(
      await screen.findByText("El código es inválido o ya expiró."),
    ).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });
});
