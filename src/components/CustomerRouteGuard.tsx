import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function CustomerRouteGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/ecommerce/login", { replace: true });
        return;
      }
      setAuthorized(true);
    })();
  }, [navigate]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Verificando acesso...</p>
      </div>
    );
  }

  return <>{children}</>;
}
