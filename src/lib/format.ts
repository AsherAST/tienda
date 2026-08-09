export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

export function orderStatusInfo(status: string): {
  label: string;
  className: string;
} {
  switch (status) {
    case "PENDING":
      return { label: "Pendiente", className: "text-amber-600" };
    case "PAID":
      return { label: "Pagado", className: "text-emerald-600" };
    case "SHIPPED":
      return { label: "Enviado", className: "text-sky-600" };
    case "DELIVERED":
      return { label: "Entregado", className: "text-emerald-600" };
    case "CANCELLED":
      return { label: "Cancelado", className: "text-red-600" };
    default:
      return { label: status, className: "text-zinc-600" };
  }
}
