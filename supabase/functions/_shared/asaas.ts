const API = Deno.env.get("ASAAS_API_URL")!;
const KEY = Deno.env.get("ASAAS_API_KEY")!;

async function asaas<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      access_token: KEY,
      "Content-Type": "application/json",
      "User-Agent": "pure-identity-flow",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Asaas ${res.status}: ${body}`);
  }
  return res.json();
}

export type AsaasCustomer = { id: string; name: string; cpfCnpj: string };
export type AsaasPayment = {
  id: string;
  status: string;
  invoiceUrl: string;
  externalReference: string | null;
};

export const findCustomerByCpf = (cpf: string) =>
  asaas<{ data: AsaasCustomer[] }>(`/customers?cpfCnpj=${encodeURIComponent(cpf)}&limit=1`);

export const createCustomer = (body: {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}) => asaas<AsaasCustomer>("/customers", { method: "POST", body: JSON.stringify(body) });

export const createPayment = (body: Record<string, unknown>) =>
  asaas<AsaasPayment>("/payments", { method: "POST", body: JSON.stringify(body) });

export const getPayment = (id: string) => asaas<AsaasPayment>(`/payments/${id}`);
