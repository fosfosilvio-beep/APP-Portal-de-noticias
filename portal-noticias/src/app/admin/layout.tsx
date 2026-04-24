"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-950">
        <ConfirmDialogProvider>
          {children}
        </ConfirmDialogProvider>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-6 lg:p-10 overflow-auto no-scrollbar">
            <ConfirmDialogProvider>
              <AdminGuard>
                {children}
              </AdminGuard>
            </ConfirmDialogProvider>
          </main>
      </div>
    </div>
  );
}
