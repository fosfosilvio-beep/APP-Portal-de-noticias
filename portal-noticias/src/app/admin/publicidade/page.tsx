import AdSlotManager from "@/components/admin/AdSlotManager";

export const metadata = {
  title: "Publicidade | Admin Portal",
};

export default function PublicidadePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdSlotManager />
    </div>
  );
}
