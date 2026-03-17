import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strip HTML tags to prevent XSS/injection */
function sanitize(val: string): string {
  return val.replace(/<[^>]*>/g, "").trim();
}

// Rate limiting: max 5 requests per IP per 60 seconds
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
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { nome, email, cpf, items } = await req.json();

    // Validate buyer info
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

    // Verify products exist and prices match
    const productIds = items.map((i: { product_id: string }) => i.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, preco")
      .in("id", productIds);

    if (!products || products.length !== new Set(productIds).size) {
      return new Response(JSON.stringify({ error: "Produto não encontrado" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const priceMap = new Map(products.map((p) => [p.id, p.preco]));

    const salesData = items.map((item: { product_id: string; qty: number }) => {
      const unitPrice = priceMap.get(item.product_id);
      if (!unitPrice || !item.qty || item.qty < 1) throw new Error("Invalid item");
      return {
        nome_comprador: nome.trim(),
        email_comprador: email.trim(),
        cpf_comprador: cpf,
        product_id: item.product_id,
        valor: unitPrice * item.qty,
        status_pagamento: "pendente",
      };
    });

    const { error } = await supabase.from("sales").insert(salesData);

    if (error) {
      return new Response(JSON.stringify({ error: "Erro ao processar compra" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
