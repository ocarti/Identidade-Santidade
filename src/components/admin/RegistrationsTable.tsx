import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Download, Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { RegistrationFormDialog } from "./RegistrationFormDialog";

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

type Props = {
  registrations: Registration[];
  onRefresh: () => void;
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

export function RegistrationsTable({ registrations, onRefresh }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const exportRegistrations = () => {
    const headers = ["Nome", "CPF", "E-mail", "Nascimento", "CEP", "Pagamento", "Check-in", "Data"];
    const rows = registrations.map((r) => [
      r.nome, r.cpf, r.email, r.nascimento, r.cep,
      r.status_pagamento, r.checked_in ? "Sim" : "Não",
      new Date(r.created_at).toLocaleDateString("pt-BR"),
    ]);
    exportCSV("inscritos.csv", headers, rows);
    toast.success("CSV de inscritos exportado!");
  };

  const handleAdd = () => {
    setEditingReg(null);
    setFormOpen(true);
  };

  const handleEdit = (r: Registration) => {
    setEditingReg(r);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: { nome: string; cpf: string; email: string; nascimento: string; cep: string }) => {
    setSaving(true);
    if (editingReg) {
      const { error } = await supabase.from("registrations").update(data).eq("id", editingReg.id);
      if (error) { toast.error("Erro ao atualizar: " + error.message); }
      else { toast.success("Inscrito atualizado!"); }
    } else {
      const { error } = await supabase.from("registrations").insert(data);
      if (error) { toast.error("Erro ao adicionar: " + error.message); }
      else { toast.success("Inscrito adicionado!"); }
    }
    setSaving(false);
    setFormOpen(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("registrations").delete().eq("id", deleteId);
    if (error) { toast.error("Erro ao excluir: " + error.message); }
    else { toast.success("Inscrito removido!"); }
    setDeleteId(null);
    onRefresh();
  };

  const thClass = "font-body text-xs uppercase tracking-widest";

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-display text-3xl">Inscritos no Evento</h2>
        <div className="flex gap-2">
          <Button variant="default" onClick={handleAdd} className="font-body text-xs uppercase tracking-widest">
            <Plus size={14} className="mr-2" /> Adicionar Inscrito
          </Button>
          <Button variant="outline" onClick={exportRegistrations} className="font-body text-xs uppercase tracking-widest">
            <Download size={14} className="mr-2" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={thClass}>Nome</TableHead>
              <TableHead className={thClass}>CPF</TableHead>
              <TableHead className={thClass}>E-mail</TableHead>
              <TableHead className={thClass}>Nascimento</TableHead>
              <TableHead className={thClass}>CEP</TableHead>
              <TableHead className={thClass}>Pagamento</TableHead>
              <TableHead className={thClass}>Check-in</TableHead>
              <TableHead className={thClass}>Data</TableHead>
              <TableHead className={thClass}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground font-body py-8">
                  Nenhum inscrito encontrado.
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-body">{r.nome}</TableCell>
                  <TableCell className="font-body">{r.cpf}</TableCell>
                  <TableCell className="font-body">{r.email}</TableCell>
                  <TableCell className="font-body">{new Date(r.nascimento).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-body">{r.cep}</TableCell>
                  <TableCell className="font-body capitalize">{r.status_pagamento}</TableCell>
                  <TableCell className="font-body">{r.checked_in ? "✅" : "—"}</TableCell>
                  <TableCell className="font-body">{new Date(r.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-body">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} title="Editar">
                        <Pencil size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)} title="Excluir" className="text-destructive hover:text-destructive">
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <RegistrationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingReg ? { nome: editingReg.nome, cpf: editingReg.cpf, email: editingReg.email, nascimento: editingReg.nascimento, cep: editingReg.cep } : null}
        loading={saving}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              Tem certeza que deseja excluir este inscrito? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body text-xs uppercase tracking-widest">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground font-body text-xs uppercase tracking-widest">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.section>
  );
}
