import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cepRegex = /^\d{5}-?\d{3}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const REGISTRATION_PRICE_ID = "price_1TFLoZFjw7mg2yXH1ecqBH3W";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { participants, buyer_email } = body;

    // Validate buyer_email
    if (!buyer_email || !emailRegex.test(buyer_email) || buyer_email.length > 255) {
      return new Response(JSON.stringify({ error: "E-mail do comprador inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate participants array
    if (!Array.isArray(participants) || participants.length === 0 || participants.length > 10) {
      return new Response(JSON.stringify({ error: "Envie de 1 a 10 participantes" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each participant
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.nome || typeof p.nome !== "string" || p.nome.trim().length < 3 || p.nome.trim().length > 100) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: Nome inválido (3-100 caracteres)` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!p.cpf || !cpfRegex.test(p.cpf)) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: CPF inválido` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!p.email || !emailRegex.test(p.email) || p.email.length > 255) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: E-mail inválido` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!p.nascimento) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: Data de nascimento obrigatória` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const birth = new Date(p.nascimento);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      if (age < 8) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: Inscrições online são apenas para maiores de 8 anos` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!p.cep || !cepRegex.test(p.cep)) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: CEP inválido` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check duplicate CPFs
    const cpfs = participants.map((p: any) => p.cpf);
    const { data: existing } = await supabase
      .from("registrations")
      .select("cpf")
      .in("cpf", cpfs);

    if (existing && existing.length > 0) {
      const duplicates = existing.map((e: any) => e.cpf).join(", ");
      return new Response(JSON.stringify({ error: `CPF(s) já cadastrado(s): ${duplicates}` }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate a shared order_id
    const order_id = crypto.randomUUID();

    // Insert all participants with status pendente
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

    const { data, error } = await supabase
      .from("registrations")
      .insert(rows)
      .select("id, nome, email, qr_code_token, transfer_token");

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Erro ao registrar inscrições" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Stripe Checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://pure-identity-flow.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer_email: buyer_email,
      line_items: [
        {
          price: REGISTRATION_PRICE_ID,
          quantity: participants.length,
        },
      ],
      mode: "payment",
      success_url: `${origin}/inscricao/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/inscricao?canceled=true`,
      metadata: {
        order_id,
        type: "registration",
      },
    });

    return new Response(JSON.stringify({ url: session.url, order_id }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Request error:", err);
    return new Response(JSON.stringify({ error: "Requisição inválida" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
