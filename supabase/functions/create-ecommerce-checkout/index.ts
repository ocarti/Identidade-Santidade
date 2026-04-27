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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { items } = await req.json() as { items: { product_id: string; qty: number; tamanho?: string }[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Carrinho vazio" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch and validate products
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, nome, preco, estoque, ativo")
      .in("id", productIds);

    if (productError || !products) {
      return new Response(JSON.stringify({ error: "Erro ao buscar produtos" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lineItems = [];
    let total = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product || !product.ativo) {
        return new Response(JSON.stringify({ error: `Produto não disponível: ${item.product_id}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (product.estoque != null && product.estoque < item.qty) {
        return new Response(JSON.stringify({ error: `Estoque insuficiente: ${product.nome}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const subtotal = Math.round(product.preco * item.qty * 100);
      total += subtotal;

      lineItems.push({
        price_data: {
          currency: "brl",
          product_data: { name: item.tamanho ? `${product.nome} (${item.tamanho})` : product.nome },
          unit_amount: Math.round(product.preco * 100),
        },
        quantity: item.qty,
      });
    }

    // Create order in DB
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: user.id, status: "pendente", total: total / 100 })
      .select("id")
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Erro ao criar pedido" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)!;
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantidade: item.qty,
        preco_unitario: product.preco,
        tamanho: item.tamanho ?? null,
      };
    });

    await supabase.from("order_items").insert(orderItems);

    // Create Stripe session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-06-20",
    });

    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:8080";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"],
      line_items: lineItems,
      mode: "payment",
      payment_method_options: {
        card: {
          installments: { enabled: true },
        },
        boleto: {
          expires_after_days: 3,
        },
      },
      success_url: `${origin}/ecommerce/obrigado?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ecommerce/carrinho`,
      metadata: {
        type: "ecommerce",
        order_id: order.id,
        user_id: user.id,
      },
    });

    // Save stripe session id to order
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Create ecommerce checkout error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
