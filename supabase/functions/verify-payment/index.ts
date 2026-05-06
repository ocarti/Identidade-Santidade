import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getPayment } from "../_shared/asaas.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_id } = await req.json();

    if (!payment_id || typeof payment_id !== "string") {
      return new Response(JSON.stringify({ error: "payment_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payment = await getPayment(payment_id);
    const isPaid = payment.status === "RECEIVED" || payment.status === "CONFIRMED";

    if (!isPaid) {
      return ok({ paid: false, status: payment.status });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ref = payment.externalReference ?? "";

    if (ref.startsWith("ecommerce:")) {
      const orderId = ref.slice("ecommerce:".length);
      await supabase.from("orders").update({ status: "pago" }).eq("id", orderId);
    } else if (ref.startsWith("registration:")) {
      const orderId = ref.slice("registration:".length);
      await supabase
        .from("registrations")
        .update({ status_pagamento: "pago" })
        .eq("order_id", orderId);
    }

    return ok({ paid: true, status: payment.status });
  } catch (e) {
    console.error("verify-payment error:", e);
    return new Response(JSON.stringify({ error: "Erro ao verificar pagamento" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
