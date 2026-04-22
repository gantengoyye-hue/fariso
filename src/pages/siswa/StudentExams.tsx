import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Exam } from '../../lib/supabase';
import { useAuth } from '../../App';
import { 
  Calendar, 
  Clock, 
  Play, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function StudentExams() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [completedExams, setCompletedExams] = useState<string[]>([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const now = new Date().toISOString();
      const { data: allExams, error: examErr } = await supabase
        .from('exams')
        .select('*')
        .lte('start_time', now)
        .gte('end_time', now)
        .order('start_time', { ascending: true });
      
      const { data: results, error: resErr } = await supabase
        .from('exam_results')
        .select('exam_id')
        .eq('student_id', profile?.id)
        .not('completed_at', 'is', null);

      if (examErr) throw examErr;
      setExams(allExams || []);
      setCompletedExams(results?.map(r => r.exam_id) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Ujian Tersedia</h1>
        <p className="text-gray-500 font-medium">Daftar ujian yang sedang berlangsung dan bisa kamu ikuti.</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-primary" /></div>
      ) : exams.length === 0 ? (
        <div className="py-24 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Ujian Aktif</h3>
          <p className="text-gray-500 max-w-sm mx-auto font-medium">Hubungi wali kelas atau IT center jika kamu seharusnya memiliki jadwal ujian saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exams.map((exam) => {
            const isDone = completedExams.includes(exam.id);
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={exam.id}
                className={cn(
                  "p-10 bg-white border border-gray-100 rounded-[40px] shadow-sm transition-all overflow-hidden relative group",
                  isDone ? "opacity-75 grayscale" : "hover:shadow-2xl hover:border-brand-primary"
                )}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className={cn(
                      "p-5 rounded-[24px]",
                      isDone ? "bg-gray-100 text-gray-400" : "bg-red-50 text-brand-primary"
                    )}>
                      <Calendar className="w-8 h-8" />
                    </div>
                    {isDone && (
                      <span className="px-4 py-2 bg-green-50 text-green-600 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Selesai
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-extrabold text-gray-900 mb-3">{exam.title}</h3>
                  <p className="text-gray-500 font-medium mb-8 line-clamp-2 h-12 leading-relaxed">{exam.description || 'Petunjuk ujian belum tersedia.'}</p>

                  <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-brand-primary" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none mb-1">Durasi</p>
                        <p className="font-bold text-gray-700">{exam.duration_minutes} Menit</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-brand-primary" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none mb-1">Deadline</p>
                        <p className="font-bold text-gray-700">{format(new Date(exam.end_time), 'HH:mm', { locale: id })} WIB</p>
                      </div>
                    </div>
                  </div>

                  {!isDone && (
                    <Link 
                      to={`/app/exam/${exam.id}`}
                      className="btn-primary w-full mt-10 py-5 text-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
                    >
                      Mulai Kerjakan <Play className="w-5 h-5 fill-current" />
                    </Link>
                  )}
                  {isDone && (
                    <Link 
                      to="/app/my-results"
                      className="btn-secondary w-full mt-10 py-5 text-lg flex items-center justify-center gap-3"
                    >
                      Lihat Hasil <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-gray-50 rounded-full group-hover:scale-110 transition-transform -z-0" />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { cn } from '../../lib/utils';
