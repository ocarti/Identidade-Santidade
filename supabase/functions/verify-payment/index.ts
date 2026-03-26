import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id || typeof session_id !== "string") {
      return new Response(JSON.stringify({ error: "session_id obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "Pagamento não confirmado", status: session.payment_status }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const type = session.metadata?.type;
    const stripePaymentId = session.payment_intent as string;

    if (type === "registration") {
      const order_id = session.metadata?.order_id;
      if (!order_id) {
        return new Response(JSON.stringify({ error: "order_id não encontrado" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update registrations to paid
      await supabase
        .from("registrations")
        .update({ status_pagamento: "pago", stripe_transaction_id: stripePaymentId })
        .eq("order_id", order_id);

      // Fetch registration data to return
      const { data: registrations } = await supabase
        .from("registrations")
        .select("id, nome, email, qr_code_token, transfer_token, buyer_email")
        .eq("order_id", order_id);

      return new Response(JSON.stringify({
        type: "registration",
        order_id,
        registrations,
        buyer_email: registrations?.[0]?.buyer_email,
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "sale") {
      const saleIdsStr = session.metadata?.sale_ids;
      const sale_order_id = session.metadata?.sale_order_id;

      if (saleIdsStr) {
        const saleIds = JSON.parse(saleIdsStr);
        await supabase
          .from("sales")
          .update({ status_pagamento: "pago", stripe_transaction_id: stripePaymentId })
          .in("id", saleIds);
      }

      return new Response(JSON.stringify({
        type: "sale",
        sale_order_id,
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Tipo de pagamento desconhecido" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    return new Response(JSON.stringify({ error: "Erro ao verificar pagamento" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
