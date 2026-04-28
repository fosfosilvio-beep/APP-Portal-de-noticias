"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, Users, Image as ImageIcon, Copyright, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function TermosServico() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    supabase.from("configuracao_portal").select("*").single().then(({ data }: any) => {
      if (data) setConfig(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Header Minimalista (Simétrico à Privacidade) */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <ArrowLeft className="w-5 h-5 text-blue-600 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-slate-600">Voltar para o Portal</span>
            </Link>
            <div className="flex items-center gap-2">
                <Scale className="w-6 h-6 text-blue-600" />
                <span className="font-black text-slate-900 tracking-tighter uppercase">Termos</span>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Termos de Serviço
            </h1>
            <p className="text-slate-500 font-medium">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-12">
            
            {config?.texto_termos_uso ? (
              <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-600 prose-headings:text-slate-900 prose-headings:font-bold whitespace-pre-wrap">
                {config.texto_termos_uso}
              </div>
            ) : (
              <>
                {/* 1. Aceitação e Comunidade */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    1. Aceitação e Foco Comunitário
                  </h2>
                  <p className="leading-relaxed text-slate-600">
                    O Portal <strong>Nossa Web TV</strong> é uma plataforma dedicada à comunidade de Arapongas e região. Ao acessar nosso conteúdo e utilizar nossos serviços de interatividade, você concorda com estes Termos de Serviço e com nossas políticas de convivência.
                  </p>
                </section>

                {/* 2. Regras de Conduta */}
                <section className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                  <h2 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Regras de Conduta e Convivência
                  </h2>
                  <p className="leading-relaxed text-red-800/80 mb-4">
                    Valorizamos um ambiente de debate saudável e respeitoso. Por isso, reservamo-nos o direito de remover, sem aviso prévio, qualquer conteúdo que contenha:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-red-800/70 font-medium text-sm">
                    <li>Ofensas pessoais, calúnia ou difamação.</li>
                    <li>Disseminação de Fake News (Notícias Falsas).</li>
                    <li>Discursos de ódio, preconceito ou intolerância.</li>
                    <li>Spam ou publicidade não autorizada em comentários.</li>
                  </ul>
                </section>

                {/* 3. Uso de Imagem e Identidade */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    2. Uso de Imagem e Identidade Social
                  </h2>
                  <p className="leading-relaxed text-slate-600">
                    Ao utilizar o Login Social (Google ou Facebook) para interagir no portal, você autoriza explicitamente a exibição do seu <strong>nome de perfil</strong> e de sua <strong>foto de perfil pública</strong>. 
                  </p>
                  <p className="leading-relaxed text-slate-600 mt-4 italic text-sm">
                    * Importante: Esta exibição ocorre exclusivamente dentro dos contextos de interatividade em que você participa, como a seção de comentários de matérias ou o chat ao vivo das transmissões.
                  </p>
                </section>

                {/* 4. Propriedade Intelectual */}
                <section className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Copyright className="w-5 h-5 text-slate-700" />
                    3. Propriedade Intelectual
                  </h2>
                  <p className="leading-relaxed text-slate-600 mb-4">
                    Todo o conteúdo disponibilizado no Portal Nossa Web TV é protegido por direitos de propriedade intelectual, incluindo, mas não se limitando a:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 font-bold text-sm">
                    <li className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">Textos e Reportagens</li>
                    <li className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">Áudios gerados pelo Narrador</li>
                    <li className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">Vídeos das Transmissões</li>
                    <li className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">Design e Identidade Visual</li>
                  </ul>
                  <p className="leading-relaxed text-slate-500 mt-6 text-sm">
                    A reprodução integral ou parcial deste conteúdo sem autorização prévia e explícita da administração do portal é terminantemente proibida.
                  </p>
                </section>

                {/* 5. Modificações */}
                <section className="border-t border-slate-100 pt-8">
                  <h2 className="text-lg font-bold text-slate-900 mb-2">Modificações nos Termos</h2>
                  <p className="leading-relaxed text-slate-500 text-sm">
                    O Portal Nossa Web TV pode atualizar estes termos periodicamente para refletir mudanças em nossos serviços ou em exigências legais. Recomendamos a consulta regular a esta página.
                  </p>
                </section>
              </>
            )}

          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} Portal Nossa Web TV. Arapongas, PR.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
