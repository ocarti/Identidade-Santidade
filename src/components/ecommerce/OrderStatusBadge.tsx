type Props = {
  status: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
  pago: { label: "Pago", className: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", className: "bg-red-100 text-red-800" },
  reembolsado: { label: "Reembolsado", className: "bg-blue-100 text-blue-800" },
};

export function OrderStatusBadge({ status }: Props) {
  const config = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-800" };

  return (
    <span className={`inline-block px-3 py-1 text-xs font-body font-semibold uppercase tracking-widest ${config.className}`}>
      {config.label}
    </span>
  );
}
