"use client";

import Link from "next/link";
import Header from "../../components/Header";
import { ShieldCheck, Mail, Trash2, ArrowLeft } from "lucide-react";

export default function Privacidade() {
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
              Política de Privacidade
            </h1>
            <p className="text-slate-500 font-medium">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-10">
            
            {/* Introdução */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                Compromisso com a Transparência
              </h2>
              <p className="leading-relaxed text-slate-600">
                O Portal <strong>Nossa Web TV</strong> valoriza a sua privacidade. Esta página descreve como tratamos as informações coletadas através do sistema de login social para garantir uma experiência segura e interativa em nossa plataforma.
              </p>
            </section>

            {/* Coleta de Dados */}
            <section className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
              <h2 className="text-lg font-bold text-blue-900 mb-3">Coleta de Dados</h2>
              <p className="leading-relaxed text-blue-800/80">
                Coletamos exclusivamente o seu <strong>nome</strong> e <strong>e-mail</strong> através dos sistemas de Login Social (Google e Facebook). Não solicitamos nem armazenamos senhas ou dados sensíveis adicionais.
              </p>
            </section>

            {/* Uso das Informações */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                Finalidade do Uso
              </h2>
              <p className="leading-relaxed text-slate-600">
                Os dados coletados servem unicamente para:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-slate-600 ml-2">
                <li>Identificação de autoria na seção de comentários das matérias.</li>
                <li>Participação e identificação no chat interativo das transmissões ao vivo.</li>
                <li>Personalização básica da experiência de interatividade do portal.</li>
              </ul>
            </section>

            {/* Exclusão de Dados Geral */}
            <section className="border-t border-slate-100 pt-8 mt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Sua Autonomia: Exclusão de Dados
              </h2>
              <p className="leading-relaxed text-slate-600 mb-6">
                Você tem o direito total sobre seus dados. A qualquer momento, você pode solicitar a exclusão definitiva de seu perfil e histórico de interações em nossa base de dados.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-bold text-slate-700">nossawebtvbrasil@gmail.com</span>
                </div>
                <a 
                  href="mailto:nossawebtvbrasil@gmail.com?subject=Solicitação de Exclusão de Dados"
                  className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Solicitar Exclusão
                </a>
              </div>
            </section>

            {/* EXIGÊNCIA META (Facebook) */}
            <section className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200 border-l-4 border-l-blue-600">
              <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                Instruções de Exclusão de Dados do Usuário
              </h2>
              <p className="leading-relaxed text-slate-600 mb-4">
                De acordo com as regras de Plataforma do Facebook para Aplicativos, fornecemos o URL do Retorno de Chamada de Exclusão de Dados ou o URL das Instruções de Exclusão de Dados.
              </p>
              <p className="leading-relaxed text-slate-600">
                Se você deseja excluir suas atividades de usuário para o Aplicativo <strong>Nossa Web TV</strong>, basta seguir as instruções abaixo:
              </p>
              <ol className="list-decimal list-inside mt-4 space-y-3 text-slate-600 ml-2">
                <li>Vá para as Configurações e Privacidade de sua conta do Facebook. Clique em "Configurações".</li>
                <li>Procure por "Apps e sites" e você verá todos os aplicativos que conectou ao seu Facebook.</li>
                <li>Pesquise e clique em "Nossa Web TV" na barra de pesquisa.</li>
                <li>Role e clique em "Remover".</li>
                <li>Parabéns, você removeu com sucesso suas atividades de usuário e dados vinculados à nossa plataforma.</li>
              </ol>
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
