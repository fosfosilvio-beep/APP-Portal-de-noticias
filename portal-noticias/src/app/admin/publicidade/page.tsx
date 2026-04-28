import AdCanvasEditor from "@/components/admin/ads/AdCanvasEditor";

export const metadata = {
  title: "Publicidade — Editor Visual | Admin Portal",
};

export default function PublicidadePage() {
  return (
    // O AdCanvasEditor preenche toda a área disponível no layout do admin
    // O padding é gerenciado internamente pelo editor para o split-view funcionar corretamente
    <div className="h-full flex flex-col">
      <AdCanvasEditor />
    </div>
  );
}
