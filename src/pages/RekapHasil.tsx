import { useState, useEffect } from 'react';
import { supabase, type ExamResult, type Exam } from '../lib/supabase';
import { useAuth } from '../App';
import { 
  BarChart3, 
  Search, 
  Download, 
  Users,
  Award,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';

export function RekapHasil() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [filterExamId, setFilterExamId] = useState<string>('all');

  useEffect(() => {
    fetchExams();
    fetchResults();
  }, [filterExamId]);

  const fetchExams = async () => {
    let query = supabase.from('exams').select('*');
    if (profile?.role === 'guru') query = query.eq('created_by', profile.id);
    const { data } = await query;
    setExams(data || []);
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('exam_results')
        .select(`
          *,
          exam:exams!inner(*),
          student:profiles!inner(*)
        `)
        .order('completed_at', { ascending: false });

      if (profile?.role === 'guru') {
        query = query.eq('exams.created_by', profile.id);
      }

      if (filterExamId !== 'all') {
        query = query.eq('exam_id', filterExamId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setResults(data as any || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Rekap Hasil Ujian</h1>
          <p className="text-slate-500 font-medium">Analisis nilai dan performa siswa secara mendalam.</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Excel
        </button>
      </div>

      <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Filter Mata Pelajaran</label>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              value={filterExamId}
              onChange={(e) => setFilterExamId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-brand-primary font-bold appearance-none text-sm"
            >
              <option value="all">Semua Ujian</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Cari Siswa</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-brand-primary placeholder:font-medium text-sm" placeholder="Masukkan nama siswa..." />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siswa</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mata Pelajaran</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Skor</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Benar / Total</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Durasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" /></td></tr>
            ) : results.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">Belum ada hasil ujian masuk.</td></tr>
            ) : results.map(res => (
              <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 border border-white">
                      {res.student?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{res.student?.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NIS: {res.student?.nis || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 font-semibold text-slate-600 text-sm">{res.exam?.title}</td>
                <td className="px-8 py-6 text-center">
                  <span className={cn(
                    "px-3 py-1.5 rounded-lg font-bold text-sm",
                    res.score >= 75 ? "bg-green-50 text-green-700" : "bg-red-50 text-brand-primary"
                  )}>
                    {res.score}
                  </span>
                </td>
                <td className="px-8 py-6 text-center font-mono text-sm font-bold text-slate-400">
                  <span className="text-slate-900">{res.correct_answers}</span> / {res.total_questions}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    {res.completed_at && res.started_at ? Math.round((new Date(res.completed_at).getTime() - new Date(res.started_at).getTime()) / 60000) : '-'} m
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

import { cn } from '../lib/utils';
