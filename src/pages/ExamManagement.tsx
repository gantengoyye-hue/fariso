import { useState, useEffect } from 'react';
import { supabase, type Exam } from '../lib/supabase';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar,
  Clock,
  Loader2,
  X,
  ChevronRight,
  ArrowRight,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function ExamManagement() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState<Partial<Exam> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      let query = supabase.from('exams').select('*').order('created_at', { ascending: false });
      
      if (profile?.role === 'guru') {
        query = query.eq('created_by', profile?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setExams(data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus ujian ini? Semua soal & hasil juga akan terhapus.')) return;
    try {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
      setExams(exams.filter(e => e.id !== id));
    } catch (err) {
      alert('Gagal menghapus ujian.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      ...currentExam,
      created_by: profile?.id,
    };

    try {
      if (currentExam?.id) {
        const { error } = await supabase.from('exams').update(payload).eq('id', currentExam.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('exams').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      alert('Gagal menyimpan ujian.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manajemen Ujian</h1>
          <p className="text-gray-500 font-medium">Buat dan atur jadwal pelaksanaan ujian sekolah.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentExam({
              title: '',
              description: '',
              duration_minutes: 60,
              start_time: new Date().toISOString().slice(0, 16),
              end_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
            });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ujian Baru
        </button>
      </div>

      <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center gap-6 relative">
        <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          className="w-full bg-gray-50 border border-gray-100 pl-14 pr-4 py-4 rounded-2xl outline-none focus:border-brand-primary font-medium"
          placeholder="Cari berdasarkan judul ujian..."
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-primary" /></div>
      ) : exams.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Belum ada jadwal ujian yang dibuat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={exam.id}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-50 text-brand-primary rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setCurrentExam(exam); setIsModalOpen(true); }} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(exam.id)} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-red-700 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{exam.title}</h3>
                <p className="text-slate-500 text-xs mb-6 line-clamp-2 h-8">{exam.description || 'Tidak ada deskripsi.'}</p>
                
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{exam.duration_minutes} Menit</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      {format(new Date(exam.start_time), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link 
                    to={`/app/bank-soal?examId=${exam.id}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group/link hover:bg-brand-primary hover:text-white transition-all"
                  >
                    <span className="text-xs font-bold font-sans">Kelola Soal</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit Exam */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-white rounded-[32px] p-10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-8">{currentExam?.id ? 'Edit Ujian' : 'Buat Ujian Baru'}</h3>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Judul Ujian</label>
                  <input required value={currentExam?.title} onChange={e => setCurrentExam({...currentExam, title: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold" placeholder="Contoh: UAS Matematika Kelas X" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Deskripsi</label>
                  <textarea rows={3} value={currentExam?.description} onChange={e => setCurrentExam({...currentExam, description: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-medium" placeholder="Tuliskan petunjuk ujian..." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Durasi (Menit)</label>
                    <input type="number" required value={currentExam?.duration_minutes} onChange={e => setCurrentExam({...currentExam, duration_minutes: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Jumlah Soal</label>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold italic">Otomatis dari bank soal</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Waktu Mulai</label>
                    <input type="datetime-local" required value={currentExam?.start_time?.slice(0, 16)} onChange={e => setCurrentExam({...currentExam, start_time: new Date(e.target.value).toISOString()})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Waktu Selesai</label>
                    <input type="datetime-local" required value={currentExam?.end_time?.slice(0, 16)} onChange={e => setCurrentExam({...currentExam, end_time: new Date(e.target.value).toISOString()})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold" />
                  </div>
                </div>
                <div className="pt-8 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                  <button type="submit" disabled={submitting} className="btn-primary min-w-[160px] flex items-center justify-center">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Ujian'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
