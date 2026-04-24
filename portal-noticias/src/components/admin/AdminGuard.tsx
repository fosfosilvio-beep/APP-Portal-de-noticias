"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Role } from "@/lib/auth/roles";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";

const RESTRICTED_FOR_AUTHORS = [
  "/admin", // Root redirect
  "/admin/dashboard",
  "/admin/metricas",
  "/admin/publicidade",
  "/admin/auditoria",
  "/admin/branding",
  "/admin/relatorios",
  "/admin/colunistas",
  "/admin/push-alertas",
  "/admin/branding"
];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    async function checkAuth() {
      // EXCEÇÃO: Se estiver na página de login, não faz nada
      if (pathname === "/admin/login") {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = "/admin/login";
        return;
      }

      // Buscar a role (com fallback de email)
      const { data: roleData, error: roleErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      let role = roleData?.role as Role;

      if (!role || roleErr) {
        const adminEmails = ["fosfosilvio@gmail.com", "fosfosilvio.beep@gmail.com"];
        const columnistEmails = ["colunista@gmail.com"];
        if (adminEmails.includes(session.user.email || "")) {
          role = "admin";
        } else if (columnistEmails.includes(session.user.email || "")) {
          role = "colunista";
        } else {
          role = "autor";
        }
      }

      // Lista Branca para Colunistas (Autores)
      if (role === "autor") {
        const isAllowed = 
          pathname.startsWith("/admin/noticias") || 
          pathname === "/admin/login";
        
        if (!isAllowed) {
          toast.error("Acesso Negado", "Sua conta de colunista tem acesso restrito apenas às suas notícias.");
          router.push("/admin/noticias");
          return;
        }
      }

      setAuthorized(true);
      setLoading(false);
    }

    checkAuth();
  }, [pathname, router, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">Validando credenciais...</p>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
