import { supabase } from "@/src/lib/supabase";

export const revalidate = 0;

export default async function Home() {
  const { data: categorias, error } = await supabase.from('categorias').select('*');

  return (
    <div className="flex flex-col min-h-screen items-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full flex-col items-center py-24 px-4 sm:px-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-8 text-center pb-2 transition-all hover:scale-105 duration-300">
          Portal Arapongas
        </h1>

        {/* Formas geométricas de teste visual */}
        <div className="flex flex-row justify-center items-center gap-6 mb-10 w-full flex-wrap">
          <div className="w-20 h-20 bg-blue-500 rounded-2xl shadow-xl hover:bg-blue-400 hover:-translate-y-2 hover:shadow-blue-500/50 transition-all duration-300 border-4 border-blue-300 dark:border-blue-700"></div>
          <div className="w-20 h-20 bg-green-500 rounded-2xl shadow-xl hover:bg-green-400 hover:-translate-y-2 hover:shadow-green-500/50 transition-all duration-300 border-4 border-green-300 dark:border-green-700"></div>
          <div className="w-20 h-20 bg-purple-500 rounded-2xl shadow-xl hover:bg-purple-400 hover:-translate-y-2 hover:shadow-purple-500/50 transition-all duration-300 border-4 border-purple-300 dark:border-purple-700"></div>
          <div className="w-20 h-20 bg-pink-500 rounded-full shadow-xl hover:bg-pink-400 hover:-translate-y-2 hover:shadow-pink-500/50 transition-all duration-300 border-4 border-pink-300 dark:border-pink-700"></div>
        </div>

        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 border-b pb-4 dark:border-zinc-800">
            Categorias
          </h2>
          
          {error ? (
            <p className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
              Erro ao carregar categorias: {error.message}
            </p>
          ) : !categorias || categorias.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 italic text-center py-8">
              Nenhuma categoria encontrada no momento.
            </p>
          ) : (
            <ul className="space-y-4">
              {categorias.map((cat: any, index: number) => (
                <li 
                  key={cat.id || index} 
                  className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-800/30 hover:bg-blue-50 dark:hover:bg-indigo-900/10 hover:border-blue-200 dark:hover:border-indigo-800/50 hover:shadow-md transition-all duration-300 cursor-pointer group flex items-center justify-between"
                >
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-700 dark:group-hover:text-indigo-400 transition-colors text-lg">
                    {cat.nome || cat.name || cat.titulo || cat.title || JSON.stringify(cat)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-indigo-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
