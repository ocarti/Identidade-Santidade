import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { nome, email, cpf, items } = await req.json();

    if (!nome || typeof nome !== "string" || nome.trim().length < 3 || nome.trim().length > 100) {
      return new Response(JSON.stringify({ error: "Nome inválido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "E-mail inválido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!cpf || !cpfRegex.test(cpf)) {
      return new Response(JSON.stringify({ error: "CPF inválido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Carrinho vazio" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify products exist and get prices
    const productIds = items.map((i: { product_id: string }) => i.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, nome, preco")
      .in("id", productIds);

    if (!products || products.length !== new Set(productIds).size) {
      return new Response(JSON.stringify({ error: "Produto não encontrado" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Generate a shared order reference
    const sale_order_id = crypto.randomUUID();

    // Insert sales with status pendente
    const salesData = items.map((item: { product_id: string; qty: number }) => {
      const product = productMap.get(item.product_id);
      if (!product || !item.qty || item.qty < 1) throw new Error("Invalid item");
      return {
        nome_comprador: sanitize(nome),
        email_comprador: sanitize(email),
        cpf_comprador: cpf,
        product_id: item.product_id,
        valor: product.preco * item.qty,
        status_pagamento: "pendente",
        stripe_transaction_id: sale_order_id, // temporary: store order ref
      };
    });

    const { data: salesResult, error } = await supabase.from("sales").insert(salesData).select("id");

    if (error) {
      return new Response(JSON.stringify({ error: "Erro ao processar compra" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build Stripe line items from DB products
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://pure-identity-flow.lovable.app";

    const lineItems = items.map((item: { product_id: string; qty: number }) => {
      const product = productMap.get(item.product_id)!;
      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: product.nome,
          },
          unit_amount: Math.round(product.preco * 100), // convert to centavos
        },
        quantity: item.qty,
      };
    });

    const saleIds = salesResult!.map((s) => s.id);

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/loja/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/loja?canceled=true`,
      metadata: {
        sale_ids: JSON.stringify(saleIds),
        sale_order_id,
        type: "sale",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
