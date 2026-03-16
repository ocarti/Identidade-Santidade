import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cepRegex = /^\d{5}-?\d{3}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { participants, buyer_email } = body;

    // Validate buyer_email
    if (!buyer_email || !emailRegex.test(buyer_email) || buyer_email.length > 255) {
      return new Response(JSON.stringify({ error: "E-mail do comprador inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate participants array
    if (!Array.isArray(participants) || participants.length === 0 || participants.length > 10) {
      return new Response(JSON.stringify({ error: "Envie de 1 a 10 participantes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each participant
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.nome || typeof p.nome !== "string" || p.nome.trim().length < 3 || p.nome.trim().length > 100) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: Nome inválido (3-100 caracteres)` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!p.cpf || !cpfRegex.test(p.cpf)) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: CPF inválido` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!p.email || !emailRegex.test(p.email) || p.email.length > 255) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: E-mail inválido` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!p.nascimento) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: Data de nascimento obrigatória` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!p.cep || !cepRegex.test(p.cep)) {
        return new Response(JSON.stringify({ error: `Participante ${i + 1}: CEP inválido` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate a shared order_id
    const order_id = crypto.randomUUID();

    // Insert all participants
    const rows = participants.map((p: any) => ({
      nome: p.nome.trim(),
      cpf: p.cpf,
      nascimento: p.nascimento,
      cep: p.cep,
      email: p.email.trim(),
      buyer_email: buyer_email.trim(),
      order_id,
      qr_code_token: crypto.randomUUID(),
      transfer_token: crypto.randomUUID(),
    }));

    const { data, error } = await supabase
      .from("registrations")
      .insert(rows)
      .select("id, nome, email, qr_code_token, transfer_token");

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Erro ao registrar inscrições" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ order_id, registrations: data }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Request error:", err);
    return new Response(JSON.stringify({ error: "Requisição inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
