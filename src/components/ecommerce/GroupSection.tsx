import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";

export type GroupMember = { localId: string; nome: string };

type Props = {
  members: GroupMember[];
  onChange: (members: GroupMember[]) => void;
  onSave: () => void;
  saving: boolean;
};

export function GroupSection({ members, onChange, onSave, saving }: Props) {
  const addMember = () => {
    onChange([...members, { localId: crypto.randomUUID(), nome: "" }]);
  };

  const updateMember = (localId: string, nome: string) => {
    onChange(members.map((m) => (m.localId === localId ? { ...m, nome } : m)));
  };

  const removeMember = (localId: string) => {
    onChange(members.filter((m) => m.localId !== localId));
  };

  return (
    <div className="mt-10 pt-8 border-t border-foreground/10">
      <h2 className="font-display text-2xl md:text-3xl mb-6">Meu Grupo</h2>
      <p className="font-body text-sm text-muted-foreground mb-6">
        Cadastre os membros do seu grupo (família ou amigos).
      </p>

      {members.length > 0 && (
        <div className="space-y-3 mb-6">
          {members.map((member, index) => (
            <div key={member.localId} className="flex items-center gap-3">
              <div className="flex-1">
                {index === 0 && (
                  <Label className="font-body text-xs uppercase tracking-widest mb-2 block">
                    Nome Completo
                  </Label>
                )}
                <Input
                  value={member.nome}
                  onChange={(e) => updateMember(member.localId, e.target.value)}
                  placeholder="Nome do membro"
                  className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => removeMember(member.localId)}
                className={`text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 ${index === 0 ? "mt-7" : ""}`}
                aria-label="Remover membro"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={addMember}
          className="flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-widest px-5 py-2 border border-foreground/20 hover:border-foreground/60 transition-colors"
        >
          <Plus size={15} />
          Adicionar membro
        </button>

        <Button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="font-body text-sm font-semibold uppercase tracking-widest"
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}
