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
    const { nome, cpf, nascimento, cep, email } = await req.json();

    // Server-side validation
    if (!nome || typeof nome !== "string" || nome.trim().length < 3 || nome.trim().length > 100) {
      return new Response(JSON.stringify({ error: "Nome inválido (3-100 caracteres)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!cpf || !cpfRegex.test(cpf)) {
      return new Response(JSON.stringify({ error: "CPF inválido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!cep || !cepRegex.test(cep)) {
      return new Response(JSON.stringify({ error: "CEP inválido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!email || !emailRegex.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: "E-mail inválido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!nascimento) {
      return new Response(JSON.stringify({ error: "Data de nascimento obrigatória" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check duplicate CPF
    const { data: existing } = await supabase
      .from("registrations")
      .select("id")
      .eq("cpf", cpf)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "CPF já cadastrado" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data, error } = await supabase.from("registrations").insert({
      nome: nome.trim(),
      cpf,
      nascimento,
      cep,
      email: email.trim(),
    }).select("id").single();

    if (error) {
      return new Response(JSON.stringify({ error: "Erro ao registrar inscrição" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ id: data.id }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
