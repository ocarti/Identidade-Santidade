import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type CustomerProfile } from "@/contexts/CustomerAuthContext";

type ProfileData = { nome: string; cpf: string; telefone: string };

type Props = {
  profile: CustomerProfile;
  formData: ProfileData;
  onChange: (data: ProfileData) => void;
  errors: Record<string, string>;
  onSave: () => void;
  saving: boolean;
};

export function ProfileForm({ profile, formData, onChange, errors, onSave, saving }: Props) {
  const set = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...formData, [field]: e.target.value });

  const handleCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    const masked = digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    onChange({ ...formData, cpf: masked });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="font-body text-xs uppercase tracking-widest mb-2 block">Nome Completo</Label>
        <Input
          value={formData.nome}
          onChange={set("nome")}
          className="border-foreground/20 bg-transparent font-body focus:border-foreground"
        />
        {errors.nome && <p className="text-destructive text-xs mt-1 font-body">{errors.nome}</p>}
      </div>

      <div>
        <Label className="font-body text-xs uppercase tracking-widest mb-2 block">E-mail</Label>
        <Input
          value={profile.email}
          disabled
          className="border-foreground/20 bg-secondary font-body"
        />
        <p className="text-xs text-muted-foreground mt-1 font-body">O e-mail não pode ser alterado.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-body text-xs uppercase tracking-widest mb-2 block">CPF</Label>
          <Input
            value={formData.cpf}
            onChange={handleCpf}
            className="border-foreground/20 bg-transparent font-body focus:border-foreground"
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
          />
          {errors.cpf && <p className="text-destructive text-xs mt-1 font-body">{errors.cpf}</p>}
        </div>
        <div>
          <Label className="font-body text-xs uppercase tracking-widest mb-2 block">Telefone</Label>
          <Input
            value={formData.telefone}
            onChange={set("telefone")}
            className="border-foreground/20 bg-transparent font-body focus:border-foreground"
            placeholder="(00) 00000-0000"
          />
          {errors.telefone && <p className="text-destructive text-xs mt-1 font-body">{errors.telefone}</p>}
        </div>
      </div>

      <Button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="font-body text-sm font-semibold uppercase tracking-widest"
      >
        {saving ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </div>
  );
}
