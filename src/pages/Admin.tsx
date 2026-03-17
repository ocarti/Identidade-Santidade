import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { LogOut, Download } from "lucide-react";
import { motion } from "framer-motion";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";

type Sale = {
  id: string;
  nome_comprador: string;
  email_comprador: string;
  cpf_comprador: string | null;
  valor: number;
  product_id: string | null;
  created_at: string;
  product_name?: string;
  status_pagamento: string;
};

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

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Admin() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [regRes, salesRes, productsRes] = await Promise.all([
      supabase.from("registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("sales").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("id, nome"),
    ]);
    if (regRes.data) setRegistrations(regRes.data);
    if (salesRes.data && productsRes.data) {
      const productMap = new Map(productsRes.data.map((p) => [p.id, p.nome]));
      setSales(salesRes.data.map((s) => ({ ...s, product_name: s.product_id ? productMap.get(s.product_id) ?? "—" : "—" })));
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const exportSales = () => {
    const headers = ["Comprador", "E-mail", "CPF", "Produto", "Valor", "Data"];
    const rows = sales.map((s) => [
      s.nome_comprador, s.email_comprador, s.cpf_comprador ?? "—",
      s.product_name ?? "—", `R$ ${Number(s.valor).toFixed(2).replace(".", ",")}`,
      new Date(s.created_at).toLocaleDateString("pt-BR"),
    ]);
    exportCSV("vendas.csv", headers, rows);
    toast.success("CSV de vendas exportado!");
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

        {/* Sales */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-3xl">Vendas da Loja</h2>
            <Button variant="outline" onClick={exportSales} className="font-body text-xs uppercase tracking-widest">
              <Download size={14} className="mr-2" /> Exportar CSV
            </Button>
          </div>
          <div className="border border-border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body text-xs uppercase tracking-widest">Comprador</TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-widest">E-mail</TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-widest">CPF</TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-widest">Produto</TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-widest">Valor</TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-widest">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground font-body py-8">
                      Nenhuma venda encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-body">{s.nome_comprador}</TableCell>
                      <TableCell className="font-body">{s.email_comprador}</TableCell>
                      <TableCell className="font-body">{s.cpf_comprador ?? "—"}</TableCell>
                      <TableCell className="font-body">{s.product_name}</TableCell>
                      <TableCell className="font-body">R$ {Number(s.valor).toFixed(2).replace(".", ",")}</TableCell>
                      <TableCell className="font-body">{new Date(s.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
