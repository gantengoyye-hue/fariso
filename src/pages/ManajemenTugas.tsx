import { useState, useEffect } from 'react';
import { supabase, type Exam } from '../lib/supabase';
import { useAuth } from '../App';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export function ManajemenTugas() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Exam[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Exam> | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (profile?.role === 'guru') {
        query = query.eq('created_by', profile.id);
      }
      
      // For now we filter by title starting with [TUGAS] or just show all
      // In a real app we'd have a 'type' column
      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask?.title || !currentTask?.start_time || !currentTask?.end_time) return;

    try {
      if (currentTask.id) {
        const { error } = await supabase
          .from('exams')
          .update(currentTask)
          .eq('id', currentTask.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exams')
          .insert([{ 
            ...currentTask, 
            created_by: profile?.id,
            // Prefix title with [TUGAS] if not present
            title: currentTask.title.startsWith('[TUGAS]') ? currentTask.title : `[TUGAS] ${currentTask.title}`
          }]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
    try {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Tugas</h1>
          <p className="text-slate-500 font-medium">Buat dan kelola tugas harian untuk siswa Anda.</p>
        </div>
        <button 
          onClick={() => { setCurrentTask({}); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Tugas Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-primary" /></div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
            <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-500 font-medium whitespace-pre-line">
              Belum ada tugas yang dibuat.
            </p>
          </div>
        ) : (
          tasks.map((task, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={task.id}
              className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setCurrentTask(task); setIsModalOpen(true); }} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(task.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{task.title}</h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2">{task.description || 'Tidak ada deskripsi.'}</p>
              
              <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{format(new Date(task.start_time), 'dd MMM yyyy', { locale: localeId })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{task.duration_minutes} Menit</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">{currentTask?.id ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Judul Tugas</label>
                  <input 
                    required
                    value={currentTask?.title || ''}
                    onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                    className="input-sleek" 
                    placeholder="Contoh: Tugas Mandiri Matematika" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Deskripsi</label>
                  <textarea 
                    value={currentTask?.description || ''}
                    onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                    className="input-sleek h-24" 
                    placeholder="Instruksi pengerjaan tugas..." 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mulai</label>
                    <input 
                      type="datetime-local"
                      required
                      value={currentTask?.start_time ? format(new Date(currentTask.start_time), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => setCurrentTask({ ...currentTask, start_time: new Date(e.target.value).toISOString() })}
                      className="input-sleek" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Selesai</label>
                    <input 
                      type="datetime-local"
                      required
                      value={currentTask?.end_time ? format(new Date(currentTask.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => setCurrentTask({ ...currentTask, end_time: new Date(e.target.value).toISOString() })}
                      className="input-sleek" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Durasi (Menit)</label>
                  <input 
                    type="number"
                    required
                    value={currentTask?.duration_minutes || 60}
                    onChange={(e) => setCurrentTask({ ...currentTask, duration_minutes: parseInt(e.target.value) })}
                    className="input-sleek" 
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 py-4">Batal</button>
                  <button type="submit" className="btn-primary flex-1 py-4">Simpan Tugas</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
