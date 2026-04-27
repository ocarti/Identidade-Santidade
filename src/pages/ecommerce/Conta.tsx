import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { ProfileForm } from "@/components/ecommerce/ProfileForm";
import { GroupSection, type GroupMember } from "@/components/ecommerce/GroupSection";
import { motion } from "framer-motion";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { customerProfileSchema } from "@/lib/validations";
import { toast } from "sonner";

export default function Conta() {
  const { profile, user, updateProfile } = useCustomerAuth();

  const [profileData, setProfileData] = useState({
    nome: profile?.nome ?? "",
    cpf: profile?.cpf ?? "",
    telefone: profile?.telefone ?? "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("customer_group_members")
      .select("id, nome")
      .eq("user_id", user.id)
      .order("created_at")
      .then(({ data }) => {
        setGroupMembers(
          (data ?? []).map((m) => ({ localId: m.id, nome: m.nome }))
        );
      });
  }, [user]);

  if (!profile) return null;

  const handleSaveAll = async () => {
    const result = customerProfileSchema.safeParse(profileData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setProfileErrors(fieldErrors);
      return;
    }
    setProfileErrors({});
    setSaving(true);

    const { error: profileError } = await updateProfile({
      nome: result.data.nome,
      cpf: result.data.cpf || null,
      telefone: result.data.telefone || null,
    });

    if (profileError) {
      toast.error(profileError);
      setSaving(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from("customer_group_members")
      .delete()
      .eq("user_id", user!.id);

    if (deleteError) {
      toast.error("Erro ao salvar grupo.");
      setSaving(false);
      return;
    }

    const validMembers = groupMembers.filter((m) => m.nome.trim());
    if (validMembers.length > 0) {
      const { error: insertError } = await supabase
        .from("customer_group_members")
        .insert(
          validMembers.map((m) => ({
            user_id: user!.id,
            nome: m.nome.trim(),
          }))
        );

      if (insertError) {
        toast.error("Erro ao salvar membros do grupo.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    toast.success("Dados salvos com sucesso!");
  };

  return (
    <EcommerceLayout>
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex gap-2 mb-8">
            <span className="bg-primary text-primary-foreground font-body text-sm font-semibold uppercase tracking-widest px-5 py-2">
              Perfil
            </span>
            <Link
              to="/ecommerce/conta/pedidos"
              className="font-body text-sm font-semibold uppercase tracking-widest px-5 py-2 text-muted-foreground hover:bg-foreground/5 transition-colors"
            >
              Pedidos
            </Link>
            <Link
              to="/ecommerce"
              className="font-body text-sm font-semibold uppercase tracking-widest px-5 py-2 text-muted-foreground hover:bg-foreground/5 transition-colors"
            >
              Comprar Ingresso ou Camisetas
            </Link>
          </div>

          <h1 className="font-display text-4xl md:text-5xl mb-8">Minha Conta</h1>

          <ProfileForm
            profile={profile}
            formData={profileData}
            onChange={setProfileData}
            errors={profileErrors}
            onSave={handleSaveAll}
            saving={saving}
          />

          <GroupSection
            members={groupMembers}
            onChange={setGroupMembers}
            onSave={handleSaveAll}
            saving={saving}
          />
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}
