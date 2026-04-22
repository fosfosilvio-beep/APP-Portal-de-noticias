import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";

export const metadata: Metadata = {
  title: "Admin — Nossa Web TV",
  description: "Painel de administração do Portal Nossa Web TV",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar — desktop only */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <ConfirmDialogProvider>
              {children}
            </ConfirmDialogProvider>
          </main>
      </div>
    </div>
  );
}
