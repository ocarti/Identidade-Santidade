import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function sendOrderEmail(supabase: ReturnType<typeof createClient>, orderId: string) {
  const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_KEY) {
    console.warn("RESEND_API_KEY não configurado — email não enviado.");
    return;
  }

  // Busca pedido + itens + produtos
  const { data: order } = await supabase
    .from("orders")
    .select("id, total, created_at, user_id, order_items(quantidade, preco_unitario, products(nome))")
    .eq("id", orderId)
    .single();

  if (!order) return;

  // Busca perfil do comprador
  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("nome, email")
    .eq("user_id", order.user_id)
    .single();

  const compradorNome = profile?.nome ?? "Cliente";
  const compradorEmail = profile?.email ?? "";

  const itensHtml = (order.order_items as { quantidade: number; preco_unitario: number; products: { nome: string } | null }[])
    .map((item) => {
      const subtotal = (item.preco_unitario * item.quantidade).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      const unitario = item.preco_unitario.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.products?.nome ?? "Produto"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantidade}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${unitario}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${subtotal}</td>
        </tr>`;
    })
    .join("");

  const totalFormatado = Number(order.total).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const dataFormatada = new Date(order.created_at).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <div style="background:#111;color:#fff;padding:24px 32px;">
        <h1 style="margin:0;font-size:22px;letter-spacing:2px;text-transform:uppercase;">
          Identidade Santidade 2026
        </h1>
      </div>
      <div style="padding:32px;">
        <h2 style="margin-top:0;font-size:18px;">Nova compra confirmada</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          <tr>
            <td style="color:#666;font-size:13px;padding:4px 0;">Comprador</td>
            <td style="font-weight:600;padding:4px 0;">${compradorNome}</td>
          </tr>
          <tr>
            <td style="color:#666;font-size:13px;padding:4px 0;">E-mail</td>
            <td style="padding:4px 0;">${compradorEmail}</td>
          </tr>
          <tr>
            <td style="color:#666;font-size:13px;padding:4px 0;">Pedido</td>
            <td style="padding:4px 0;">#${order.id.slice(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="color:#666;font-size:13px;padding:4px 0;">Data</td>
            <td style="padding:4px 0;">${dataFormatada}</td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Produto</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Qtd</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Unitário</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itensHtml}</tbody>
        </table>
        <div style="text-align:right;margin-top:16px;font-size:18px;font-weight:700;">
          Total: ${totalFormatado}
        </div>
      </div>
      <div style="background:#f5f5f5;padding:16px 32px;font-size:12px;color:#888;text-align:center;">
        Identidade Santidade 2026 — identidadesantidade.com.br
      </div>
    </div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Identidade Santidade <onboarding@resend.dev>",
      to: ["ocarti@gmail.com"],
      subject: `Compra IDS: ${compradorNome}`,
      html,
    }),
  });
}

Deno.serve(async (req) => {
  const token = req.headers.get("asaas-access-token");
  if (token !== Deno.env.get("ASAAS_WEBHOOK_TOKEN")) {
    return new Response("forbidden", { status: 403 });
  }

  try {
    const body = await req.json();
    const event = body.event as string;
    const payment = body.payment as {
      id: string;
      status: string;
      externalReference: string | null;
    };

    const paid = event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED";
    const cancelled = event === "PAYMENT_REFUNDED" || event === "PAYMENT_DELETED";

    if (!paid && !cancelled) {
      return new Response("ok", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ref = payment.externalReference ?? "";

    if (ref.startsWith("ecommerce:")) {
      const orderId = ref.slice("ecommerce:".length);

      // Verifica se já estava pago para não reenviar email
      const { data: existing } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

      const status = paid ? "pago" : "cancelado";
      await supabase.from("orders").update({ status }).eq("id", orderId);

      if (paid && existing?.status !== "pago") {
        await sendOrderEmail(supabase, orderId);
      }
    } else if (ref.startsWith("registration:")) {
      const orderId = ref.slice("registration:".length);
      const status_pagamento = paid ? "pago" : "pendente";
      await supabase
        .from("registrations")
        .update({ status_pagamento })
        .eq("order_id", orderId);
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("asaas-webhook error:", e);
    return new Response("error", { status: 500 });
  }
});
