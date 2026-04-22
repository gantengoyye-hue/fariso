import { useState, useEffect } from 'react';
import { supabase, type ExamResult, type Exam, type Profile } from '../lib/supabase';
import { useAuth } from '../App';
import { 
  Activity, 
  Users, 
  Clock, 
  Loader2, 
  Circle, 
  RefreshCw,
  Search,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function MonitoringUjian() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeExams, setActiveExams] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActiveExams();
    const interval = setInterval(fetchActiveExams, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchActiveExams = async () => {
    try {
      // Fetch results that are in progress (completed_at is null)
      let query = supabase
        .from('exam_results')
        .select(`
          *,
          exam:exams!inner(*),
          student:profiles!inner(*)
        `)
        .is('completed_at', null)
        .order('started_at', { ascending: false });

      if (profile?.role === 'guru') {
        query = query.eq('exams.created_by', profile.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setActiveExams(data || []);
    } catch (err) {
      console.error('Error fetching active exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeExams.filter(item => 
    item.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pantau Ujian Realtime</h1>
          <p className="text-slate-500 font-medium">Memantau aktivitas siswa yang sedang mengerjakan ujian saat ini.</p>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchActiveExams(); }}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Siswa Aktif</p>
              <h3 className="text-2xl font-black text-slate-900">{activeExams.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Cari nama siswa atau mata pelajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-brand-primary placeholder:font-medium"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siswa</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ujian</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Waktu Mulai</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Durasi Ujian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && activeExams.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-brand-primary mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="max-w-xs mx-auto">
                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Tidak ada aktivitas ujian aktif saat ini.</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map((item, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.id} 
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 border border-white">
                      {item.student?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.student?.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NIS: {item.student?.nis || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-300" />
                    <span className="font-semibold text-slate-700">{item.exam?.title}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <Circle className="w-2 h-2 fill-green-600 animate-pulse" />
                    Sedang Mengerjakan
                  </span>
                </td>
                <td className="px-8 py-6 text-right font-bold text-slate-400 text-sm">
                  {item.exam?.duration_minutes} Menit
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
