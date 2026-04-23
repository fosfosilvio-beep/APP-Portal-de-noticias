import NewsEditorForm from "@/components/admin/noticias/NewsEditorForm";

export default async function EditarNoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="max-w-[1400px] mx-auto">
      <NewsEditorForm editId={id} />
    </div>
  );
}
