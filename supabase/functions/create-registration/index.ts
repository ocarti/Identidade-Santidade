import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  findCustomerByCpf,
  createCustomer,
  createPayment,
} from "../_shared/asaas.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cepRegex = /^\d{5}-?\d{3}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valor por participante em BRL — confirmar no painel antes de usar em produção
const REGISTRATION_PRICE_BRL = 150.00;

function sanitize(val: string): string {
  return val.replace(/<[^>]*>/g, "").trim();
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(clientIp)) {
    return err("Muitas requisições. Aguarde um momento e tente novamente.", 429);
  }

  try {
    const body = await req.json();
    const { participants, buyer_email } = body;

    if (!buyer_email || !emailRegex.test(buyer_email) || buyer_email.length > 255) {
      return err("E-mail do comprador inválido");
    }

    if (!Array.isArray(participants) || participants.length === 0 || participants.length > 10) {
      return err("Envie de 1 a 10 participantes");
    }

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.nome || typeof p.nome !== "string" || p.nome.trim().length < 3 || p.nome.trim().length > 100) {
        return err(`Participante ${i + 1}: Nome inválido (3-100 caracteres)`);
      }
      if (!p.cpf || !cpfRegex.test(p.cpf)) {
        return err(`Participante ${i + 1}: CPF inválido`);
      }
      if (!p.email || !emailRegex.test(p.email) || p.email.length > 255) {
        return err(`Participante ${i + 1}: E-mail inválido`);
      }
      if (!p.nascimento) {
        return err(`Participante ${i + 1}: Data de nascimento obrigatória`);
      }
      const birth = new Date(p.nascimento);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      if (age < 8) {
        return err(`Participante ${i + 1}: Inscrições online são apenas para maiores de 8 anos`);
      }
      if (!p.cep || !cepRegex.test(p.cep)) {
        return err(`Participante ${i + 1}: CEP inválido`);
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const cpfs = participants.map((p: any) => p.cpf);
    const { data: existing } = await supabase
      .from("registrations")
      .select("cpf")
      .in("cpf", cpfs);

    if (existing && existing.length > 0) {
      const duplicates = existing.map((e: any) => e.cpf).join(", ");
      return err(`CPF(s) já cadastrado(s): ${duplicates}`, 409);
    }

    const order_id = crypto.randomUUID();

    const rows = participants.map((p: any) => ({
      nome: sanitize(p.nome),
      cpf: p.cpf,
      nascimento: p.nascimento,
      cep: p.cep,
      email: sanitize(p.email),
      buyer_email: sanitize(buyer_email),
      order_id,
      qr_code_token: crypto.randomUUID(),
      transfer_token: crypto.randomUUID(),
      status_pagamento: "pendente",
    }));

    const { data, error: insertError } = await supabase
      .from("registrations")
      .insert(rows)
      .select("id, nome, email, qr_code_token, transfer_token");

    if (insertError) {
      console.error("Insert error:", insertError);
      return err("Erro ao registrar inscrições", 500);
    }

    // Use first participant for Asaas customer
    const first = participants[0];
    const cpfClean = first.cpf.replace(/\D/g, "");

    let customerId: string;
    const search = await findCustomerByCpf(cpfClean);
    if (search.data && search.data.length > 0) {
      customerId = search.data[0].id;
    } else {
      const created = await createCustomer({
        name: sanitize(first.nome),
        email: sanitize(first.email),
        cpfCnpj: cpfClean,
      });
      customerId = created.id;
    }

    const total = REGISTRATION_PRICE_BRL * participants.length;
    const dueDate = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
    const origin = req.headers.get("origin") || "https://pure-identity-flow.lovable.app";

    const payment = await createPayment({
      customer: customerId,
      billingType: "UNDEFINED",
      value: total,
      dueDate,
      description: `Identidade Santidade 2026 — ${participants.length} inscri${participants.length === 1 ? "ção" : "ções"}`,
      externalReference: `registration:${order_id}`,
      callback: {
        successUrl: `${origin}/inscricao/sucesso?order_id=${order_id}`,
        autoRedirect: true,
      },
    });

    // Save asaas IDs to all registrations for this order
    await supabase
      .from("registrations")
      .update({ asaas_payment_id: payment.id, asaas_invoice_url: payment.invoiceUrl })
      .eq("order_id", order_id);

    return new Response(JSON.stringify({ url: payment.invoiceUrl, order_id }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-registration error:", e);
    return err("Requisição inválida", 400);
  }
});
