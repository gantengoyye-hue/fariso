import { useState, useEffect } from 'react';
import { supabase, type ExamResult } from '../../lib/supabase';
import { useAuth } from '../../App';
import { 
  Award, 
  FileText, 
  Clock, 
  ChevronRight, 
  Loader2,
  Trophy,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../../lib/utils';

export function StudentResults() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*, exam:exams(*)')
        .eq('student_id', profile?.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setResults(data as any || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length)
    : 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hasil Belajar</h1>
          <p className="text-slate-500 font-medium">Rekapitulasi pencapaian akademik kamu di SMK Prima Unggul.</p>
        </div>
        
        <div className="flex items-center gap-6 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-xl flex flex-col items-center justify-center">
            <span className="text-2xl font-black">{averageScore}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-[-2px]">Score</span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Rata-rata Nilai</p>
            <p className="font-bold text-slate-900">{averageScore >= 80 ? 'A - Sangat Baik' : 'B - Baik'}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-primary" /></div>
      ) : results.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Selesaikan ujian pertama kamu untuk melihat hasil di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map((res, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={res.id}
              className="group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-xl flex flex-col items-center justify-center font-black text-xl shadow-sm transition-transform group-hover:scale-105",
                  res.score >= 75 ? "bg-green-50 text-green-700" : "bg-red-50 text-brand-primary"
                )}>
                  {res.score}
                  <span className="text-[8px] uppercase font-bold tracking-widest mt-[-2px] opacity-60">Skor</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{res.exam?.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(res.completed_at), 'dd MMM yyyy', { locale: id })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      {res.correct_answers} / {res.total_questions} Benar
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-slate-50 rounded-lg text-center hidden sm:block">
                  <p className={cn(
                    "font-bold text-sm",
                    res.score >= 75 ? "text-green-600" : "text-brand-primary"
                  )}>
                    {res.score >= 75 ? 'Lulus' : 'Remedi'}
                  </p>
                </div>
                <button className="p-3 hover:bg-slate-50 text-slate-300 hover:text-brand-primary rounded-xl transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
