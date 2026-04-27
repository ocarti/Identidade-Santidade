import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type CustomerProfile = {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
};

type CustomerAuthContextValue = {
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<Pick<CustomerProfile, "nome" | "cpf" | "telefone">>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("email rate")) return "Limite de envios de e-mail atingido. Aguarde alguns minutos e tente novamente.";
  if (m.includes("already registered") || m.includes("user already exists")) return "Este e-mail já está cadastrado. Faça login ou recupere sua senha.";
  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de fazer login.";
  if (m.includes("password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
  if (m.includes("invalid email")) return "E-mail inválido.";
  if (m.includes("signup is disabled")) return "Cadastro temporariamente desativado.";
  if (m.includes("network") || m.includes("fetch")) return "Erro de conexão. Verifique sua internet e tente novamente.";
  return message;
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("customer_profiles")
      .select("id, user_id, nome, email, cpf, telefone")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data);
  };

  useEffect(() => {
    // Check current session
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        fetchProfile(sessionUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nome: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome } },
    });
    if (error) return { error: translateAuthError(error.message) };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: translateAuthError(error.message) };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    // Clear cart on logout
    localStorage.removeItem("ecommerce_cart");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/ecommerce/nova-senha`,
    });
    if (error) return { error: translateAuthError(error.message) };
    return { error: null };
  };

  const updateProfile = async (data: Partial<Pick<CustomerProfile, "nome" | "cpf" | "telefone">>) => {
    if (!user) return { error: "Não autenticado" };
    const { error } = await supabase
      .from("customer_profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (error) return { error: error.message };
    await fetchProfile(user.id);
    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <CustomerAuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, resetPassword, updateProfile, refreshProfile }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
