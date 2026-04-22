import NewsEditorForm from "@/components/admin/noticias/NewsEditorForm";

export default function EditarNoticiaPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-[1400px] mx-auto">
      <NewsEditorForm editId={params.id} />
    </div>
  );
}
