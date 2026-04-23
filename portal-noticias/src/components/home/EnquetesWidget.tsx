"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnquetesWidget() {
  const [enquete, setEnquete] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    fetchActiveEnquete();
  }, []);

  const fetchActiveEnquete = async () => {
    const { data } = await supabase
      .from("enquetes")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setEnquete(data);
      if (localStorage.getItem(`voted_enquete_${data.id}`)) {
        setVoted(true);
      }
    }
    setLoading(false);
  };

  const handleVote = async (opcaoId: string) => {
    if (voted || !enquete) return;
    setIsVoting(true);

    const newOpcoes = enquete.opcoes.map((op: any) => {
      if (op.id === opcaoId) return { ...op, votos: (op.votos || 0) + 1 };
      return op;
    });

    const { error } = await supabase
      .from("enquetes")
      .update({ opcoes: newOpcoes })
      .eq("id", enquete.id);

    if (!error) {
      setEnquete({ ...enquete, opcoes: newOpcoes });
      setVoted(true);
      localStorage.setItem(`voted_enquete_${enquete.id}`, "true");
    }
    setIsVoting(false);
  };

  if (loading || !enquete) return null;

  const totalVotos = enquete.opcoes.reduce((acc: number, op: any) => acc + (op.votos || 0), 0);

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
          <PieChart size={20} />
        </div>
        <div>
          <h3 className="font-black text-slate-900 uppercase tracking-tighter text-sm">Arapongas Opina</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{totalVotos} Participações</p>
        </div>
      </div>

      <h4 className="font-black text-slate-800 text-lg mb-6 leading-tight">{enquete.pergunta}</h4>

      <div className="space-y-3">
        <AnimatePresence>
          {enquete.opcoes.map((op: any) => {
            const percentage = totalVotos === 0 ? 0 : Math.round((op.votos / totalVotos) * 100);
            
            return (
              <div key={op.id} className="relative">
                {voted ? (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative h-12 bg-slate-50 rounded-xl overflow-hidden flex items-center px-4 border border-slate-100"
                  >
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute left-0 top-0 h-full bg-purple-100"
                    />
                    <div className="relative z-10 w-full flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700">{op.texto}</span>
                      <span className="text-sm font-black text-purple-700">{percentage}%</span>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => handleVote(op.id)}
                    disabled={isVoting}
                    className="w-full text-left bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all flex items-center justify-between group/btn disabled:opacity-50"
                  >
                    {op.texto}
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover/btn:border-purple-400 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {voted && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center justify-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-widest bg-emerald-50 py-2 rounded-xl"
        >
          <CheckCircle2 size={16} /> Voto Computado
        </motion.div>
      )}
    </div>
  );
}
