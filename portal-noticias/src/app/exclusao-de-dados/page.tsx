import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "../../lib/supabase-server";

export const metadata: Metadata = {
  title: "Exclusão de Dados - Nossa Web TV",
  description: "Instruções para exclusão de dados de usuário e remoção de vínculo com redes sociais.",
  robots: "index, follow",
};

export default async function ExclusaoDeDados() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("configuracao_portal").select("*").single();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Header Minimalista para Foco no Conteúdo */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <ArrowLeft className="w-5 h-5 text-blue-600 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-slate-600">Voltar para o Portal</span>
            </Link>
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                <span className="font-black text-slate-900 tracking-tighter uppercase">Privacidade</span>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Instruções para Exclusão de Dados
            </h1>
            <p className="text-slate-500 font-medium">
              Saiba como remover suas informações de nossa plataforma.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-10">
            
            <section className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200 border-l-4 border-l-blue-600">
              <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-500" />
                Como excluir seus dados de usuário
              </h2>
              <p className="leading-relaxed text-slate-600 mb-4">
                O Portal <strong>Nossa Web TV</strong> utiliza o login social (Facebook e Google) para permitir comentários e interações em transmissões ao vivo.
                Se você deseja remover o acesso e excluir permanentemente seu histórico ou vinculação com o nosso Aplicativo, siga os passos de acordo com a plataforma que você usou para fazer login:
              </p>

              <h3 className="font-bold text-slate-800 mt-8 mb-2">Exclusão de Dados do Facebook</h3>
              <p className="leading-relaxed text-slate-600 mb-4">
                Para remover as atividades de usuário vinculadas ao nosso aplicativo no seu Facebook:
              </p>
              <ol className="list-decimal list-inside mt-4 space-y-3 text-slate-600 ml-2">
                <li>Vá para as <strong>Configurações e Privacidade</strong> de sua conta do Facebook e clique em <strong>"Configurações"</strong>.</li>
                <li>No menu à esquerda, procure por <strong>"Apps e sites"</strong> para ver os aplicativos conectados à sua conta.</li>
                <li>Pesquise e clique no aplicativo <strong>"Nossa Web TV Portal de Noticia"</strong> na lista.</li>
                <li>Role a tela e clique em <strong>"Remover"</strong>.</li>
                <li>Siga as instruções na tela de confirmação. Parabéns, você removeu com sucesso o aplicativo e os dados vinculados à nossa plataforma.</li>
              </ol>

              <h3 className="font-bold text-slate-800 mt-8 mb-2">Exclusão Manual (via E-mail)</h3>
              <p className="leading-relaxed text-slate-600 mb-4">
                Se você preferir que nossa equipe exclua manualmente seu perfil e histórico de nossa base de dados (independente da rede social usada), você pode nos enviar um e-mail solicitando a exclusão.
              </p>
              <div className="bg-white border border-slate-200 rounded-xl p-4 mt-4">
                <p className="text-slate-600 font-medium">
                  Envie um e-mail para: <strong className="text-blue-600">{config?.email_contato || "nossawebtvbrasil@gmail.com"}</strong><br />
                  Assunto: <strong>Solicitação de Exclusão de Dados</strong><br />
                  <span className="text-sm mt-2 block text-slate-500">Por favor, envie a solicitação utilizando o mesmo e-mail que você usou para fazer o login em nosso portal, para que possamos identificá-lo.</span>
                </p>
              </div>
            </section>

          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} Portal Nossa Web TV. Todos os direitos reservados.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
