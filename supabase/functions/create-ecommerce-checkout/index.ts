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

function ok(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

  if (!Deno.env.get("ASAAS_API_URL") || !Deno.env.get("ASAAS_API_KEY")) {
    console.error("Missing ASAAS_API_URL or ASAAS_API_KEY secrets");
    return err("Configuração de pagamento incompleta no servidor.", 500);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return err("Não autorizado", 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return err("Token inválido", 401);

    const { items, paymentMethod = "card", installments = 1 } = await req.json() as {
      items: { product_id: string; qty: number; tamanho?: string }[];
      paymentMethod?: "card" | "boleto" | "pix";
      installments?: number;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return err("Carrinho vazio");
    }

    // Fetch customer profile (need CPF for Asaas)
    const { data: profile, error: profileError } = await supabase
      .from("customer_profiles")
      .select("id, nome, email, cpf, telefone, asaas_customer_id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) return err("Perfil não encontrado", 404);

    // Fetch and validate products
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, nome, preco, estoque, ativo")
      .in("id", productIds);

    if (productError || !products) return err("Erro ao buscar produtos", 500);

    let total = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product || !product.ativo) {
        return err(`Produto não disponível: ${item.product_id}`);
      }
      if (product.estoque != null && product.estoque < item.qty) {
        return err(`Estoque insuficiente: ${product.nome}`);
      }
      total += product.preco * item.qty;
    }

    // Create order in DB
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: user.id, status: "pendente", total })
      .select("id")
      .single();

    if (orderError || !order) return err("Erro ao criar pedido", 500);

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

    // Resolve or create Asaas customer
    let customerId = profile.asaas_customer_id;
    if (!customerId) {
      const cpfClean = profile.cpf ? profile.cpf.replace(/\D/g, "") : null;
      if (cpfClean) {
        const search = await findCustomerByCpf(cpfClean);
        if (search.data && search.data.length > 0) {
          customerId = search.data[0].id;
        } else {
          const created = await createCustomer({
            name: profile.nome,
            email: profile.email,
            cpfCnpj: cpfClean,
            ...(profile.telefone ? { phone: profile.telefone } : {}),
          });
          customerId = created.id;
        }
      } else {
        const created = await createCustomer({
          name: profile.nome,
          email: profile.email,
          ...(profile.telefone ? { phone: profile.telefone } : {}),
        });
        customerId = created.id;
      }
      await supabase
        .from("customer_profiles")
        .update({ asaas_customer_id: customerId })
        .eq("id", profile.id);
    }

    // Create Asaas payment
    const billingType =
      paymentMethod === "card" ? "CREDIT_CARD"
      : paymentMethod === "pix" ? "PIX"
      : "BOLETO";

    const dueDate = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:8080";

    const paymentBody: Record<string, unknown> = {
      customer: customerId,
      billingType,
      value: total,
      dueDate,
      description: `Identidade Santidade 2026 — pedido ${order.id.slice(0, 8)}`,
      externalReference: `ecommerce:${order.id}`,
      callback: {
        successUrl: `${origin}/ecommerce/obrigado?order_id=${order.id}`,
        autoRedirect: true,
      },
    };

    if (paymentMethod === "card" && installments > 1) {
      // Asaas installment format: totalValue replaces value
      delete paymentBody.value;
      paymentBody.totalValue = total;
      paymentBody.installmentCount = installments;
    }

    const payment = await createPayment(paymentBody);

    // Save Asaas IDs to order
    await supabase
      .from("orders")
      .update({ asaas_payment_id: payment.id, asaas_invoice_url: payment.invoiceUrl })
      .eq("id", order.id);

    return ok({ url: payment.invoiceUrl });
  } catch (e) {
    console.error("create-ecommerce-checkout error:", e);
    const message = e instanceof Error ? e.message : "Erro interno desconhecido";
    const isCpfError = /cpf|cnpj/i.test(message);
    if (isCpfError) {
      return new Response(JSON.stringify({ error: message, code: "CPF_REQUIRED" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return err(message, 500);
  }
});
