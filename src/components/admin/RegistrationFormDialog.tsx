import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type RegistrationForm = {
  nome: string;
  cpf: string;
  email: string;
  nascimento: string;
  cep: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RegistrationForm) => void;
  initialData?: RegistrationForm | null;
  loading?: boolean;
};

const empty: RegistrationForm = { nome: "", cpf: "", email: "", nascimento: "", cep: "" };

export function RegistrationFormDialog({ open, onOpenChange, onSubmit, initialData, loading }: Props) {
  const [form, setForm] = useState<RegistrationForm>(empty);
  const isEdit = !!initialData;

  useEffect(() => {
    setForm(initialData ?? empty);
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const fieldClass = "border-foreground/20 bg-transparent font-body focus:border-foreground";
  const labelClass = "font-body text-xs uppercase tracking-widest mb-1 block";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEdit ? "Editar Inscrito" : "Adicionar Inscrito"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reg-nome" className={labelClass}>Nome Completo</Label>
            <Input id="reg-nome" name="nome" value={form.nome} onChange={handleChange} required className={fieldClass} placeholder="Nome completo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="reg-cpf" className={labelClass}>CPF</Label>
              <Input id="reg-cpf" name="cpf" value={form.cpf} onChange={handleChange} required className={fieldClass} placeholder="000.000.000-00" />
            </div>
            <div>
              <Label htmlFor="reg-nascimento" className={labelClass}>Nascimento</Label>
              <Input id="reg-nascimento" name="nascimento" type="date" value={form.nascimento} onChange={handleChange} required className={fieldClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="reg-cep" className={labelClass}>CEP</Label>
              <Input id="reg-cep" name="cep" value={form.cep} onChange={handleChange} required className={fieldClass} placeholder="00000-000" />
            </div>
            <div>
              <Label htmlFor="reg-email" className={labelClass}>E-mail</Label>
              <Input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} required className={fieldClass} placeholder="email@exemplo.com" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="font-body text-xs uppercase tracking-widest">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="font-body text-xs uppercase tracking-widest">
              {loading ? "Salvando..." : isEdit ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
