import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // GET: Fetch registration by transfer_token
    if (req.method === "GET") {
      const token = url.searchParams.get("token");
      if (!token) {
        return new Response(JSON.stringify({ error: "Token não fornecido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data, error } = await supabase
        .from("registrations")
        .select("id, nome, cpf, email, qr_code_token")
        .eq("transfer_token", token)
        .maybeSingle();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Ingresso não encontrado ou link inválido" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: Execute transfer
    if (req.method === "POST") {
      const { transfer_token, novo_nome, novo_cpf, novo_email } = await req.json();

      if (!transfer_token) {
        return new Response(JSON.stringify({ error: "Token não fornecido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!novo_nome || typeof novo_nome !== "string" || novo_nome.trim().length < 3 || novo_nome.trim().length > 100) {
        return new Response(JSON.stringify({ error: "Nome inválido (3-100 caracteres)" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!novo_cpf || !cpfRegex.test(novo_cpf)) {
        return new Response(JSON.stringify({ error: "CPF inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!novo_email || !emailRegex.test(novo_email) || novo_email.length > 255) {
        return new Response(JSON.stringify({ error: "E-mail inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Find registration by transfer_token
      const { data: reg } = await supabase
        .from("registrations")
        .select("id")
        .eq("transfer_token", transfer_token)
        .maybeSingle();

      if (!reg) {
        return new Response(JSON.stringify({ error: "Ingresso não encontrado ou link já utilizado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate new QR code token (invalidates old one) and new transfer token (single use)
      const new_qr_code_token = crypto.randomUUID();
      const new_transfer_token = crypto.randomUUID();

      const { data, error } = await supabase
        .from("registrations")
        .update({
          nome: novo_nome.trim(),
          cpf: novo_cpf,
          email: novo_email.trim(),
          qr_code_token: new_qr_code_token,
          transfer_token: new_transfer_token,
        })
        .eq("id", reg.id)
        .select("id, nome, email, qr_code_token, transfer_token")
        .single();

      if (error) {
        console.error("Transfer error:", error);
        return new Response(JSON.stringify({ error: "Erro ao transferir ingresso" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, registration: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Método não suportado" }), {
      status: 405,
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
