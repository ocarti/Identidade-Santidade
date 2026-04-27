import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";

type Registration = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  nascimento: string;
  cep: string;
  status_pagamento: string;
  checked_in: boolean;
  created_at: string;
};

export default function Admin() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRegistrations(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Painel Administrativo</h1>
        <Button variant="ghost" onClick={handleLogout} className="font-body text-xs uppercase tracking-widest">
          <LogOut size={16} className="mr-2" /> Sair
        </Button>
      </header>

      <main className="container py-8 space-y-12">
        <RegistrationsTable registrations={registrations} onRefresh={fetchData} />
      </main>
    </div>
  );
}
