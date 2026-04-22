import AdminActionsClient from "@/components/admin/auditoria/AdminActionsClient";
import { ShieldAlert } from "lucide-react";

export default function AuditoriaPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <ShieldAlert size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Auditoria</h1>
          <p className="text-sm text-slate-400">Rastreabilidade completa de ações administrativas e de conteúdo.</p>
        </div>
      </div>

      <AdminActionsClient />
    </div>
  );
}
