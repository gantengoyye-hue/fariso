import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase, type Question, type Exam } from '../lib/supabase';
import { useAuth } from '../App';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Database,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function BankSoal() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(searchParams.get('examId') || '');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchQuestions(selectedExamId);
    } else {
      setQuestions([]);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      let query = supabase.from('exams').select('*').order('created_at', { ascending: false });
      
      // Guru only see their exams
      if (profile?.role === 'guru') {
        query = query.eq('created_by', profile.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setExams(data || []);
      
      // Select exam from query param if valid, else first exam
      const urlExamId = searchParams.get('examId');
      if (urlExamId && data?.some(e => e.id === urlExamId)) {
        setSelectedExamId(urlExamId);
      } else if (data && data.length > 0 && !selectedExamId) {
        setSelectedExamId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (examId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId);
      
      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus soal ini?')) return;
    
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Gagal menghapus soal.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) return alert('Silakan pilih ujian terlebih dahulu.');
    if (!currentQuestion) return;
    
    setSubmitting(true);
    
    const payload: any = {
      question_text: currentQuestion.question_text || '',
      options: {
        a: currentQuestion.options?.a || '',
        b: currentQuestion.options?.b || '',
        c: currentQuestion.options?.c || '',
        d: currentQuestion.options?.d || '',
      },
      correct_answer: currentQuestion.correct_answer || 'a',
      exam_id: selectedExamId,
    };

    try {
      if (currentQuestion.id) {
        // Update
        const { error } = await supabase
          .from('questions')
          .update(payload)
          .eq('id', currentQuestion.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('questions')
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchQuestions(selectedExamId);
    } catch (err: any) {
      console.error('CRITICAL: Error saving question:', err);
      // Detailed error for debugging
      const errorMsg = err.message || JSON.stringify(err);
      alert(`Gagal menyimpan soal.\n\nDetail: ${errorMsg}\n\nPastikan semua field terisi dan koneksi internet stabil.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Bank Soal</h1>
          <p className="text-gray-500 font-medium">Kelola pertanyaan untuk setiap mata pelajaran.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentQuestion({
              question_text: '',
              options: { a: '', b: '', c: '', d: '' },
              correct_answer: 'a'
            });
            setIsModalOpen(true);
          }}
          disabled={!selectedExamId}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Soal
        </button>
      </div>

      {/* Select Exam Filter */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Pilih Ujian / Paket Soal</label>
          <select 
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none focus:border-brand-primary font-bold text-sm"
          >
            {exams.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.title}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Cari Soal</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-3 rounded-xl outline-none focus:border-brand-primary placeholder:font-medium text-sm"
              placeholder="Ketik kata kunci..."
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
        ) : questions.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium whitespace-pre-line">
              {selectedExamId ? 'Ujian ini belum memiliki soal.\nKlik tombol Tambah Soal untuk memulai.' : 'Silakan pilih ujian terlebih dahulu.'}
            </p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={q.id}
              className="group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pertanyaan</span>
                  </div>
                  <p className="text-slate-800 font-bold text-lg leading-relaxed mb-6">{q.question_text}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(q.options).map(([key, val]) => (
                      <div 
                        key={key}
                        className={cn(
                          "p-4 rounded-xl border flex items-center gap-4 transition-all",
                          q.correct_answer === key 
                            ? "bg-green-50 border-green-200 text-green-700" 
                            : "bg-slate-50 border-slate-100 text-slate-600"
                        )}
                      >
                        <span className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs uppercase",
                          q.correct_answer === key ? "bg-green-600 text-white" : "bg-white border border-slate-200"
                        )}>
                          {key}
                        </span>
                        <span className="font-semibold text-sm">{val}</span>
                        {q.correct_answer === key && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setCurrentQuestion(q); setIsModalOpen(true); }} className="p-3 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(q.id)} className="p-3 hover:bg-slate-50 text-slate-400 hover:text-brand-primary rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Soal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b flex items-center justify-between">
                <h3 className="text-2xl font-bold">{currentQuestion?.id ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-8 overflow-auto">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">Pertanyaan</label>
                  <textarea
                    required
                    rows={4}
                    value={currentQuestion?.question_text}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                    className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-brand-primary font-medium"
                    placeholder="Tuliskan pertanyaan di sini..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['a', 'b', 'c', 'd'].map(key => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Opsi {key.toUpperCase()}</label>
                        <button
                          type="button"
                          onClick={() => setCurrentQuestion({ ...currentQuestion, correct_answer: key })}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                            currentQuestion?.correct_answer === key 
                              ? "bg-green-600 text-white shadow-lg shadow-green-500/30" 
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          )}
                        >
                          {currentQuestion?.correct_answer === key ? 'Kunci Jawaban' : 'Jadikan Kunci'}
                        </button>
                      </div>
                      <input
                        required
                        value={currentQuestion?.options?.[key]}
                        onChange={(e) => {
                          const newOpts = { ...currentQuestion?.options, [key]: e.target.value };
                          setCurrentQuestion({ ...currentQuestion, options: newOpts as any });
                        }}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-semibold"
                        placeholder={`Jawaban opsi ${key}...`}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t flex justify-end items-center gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                  <button type="submit" disabled={submitting} className="btn-primary min-w-[160px] flex items-center justify-center">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Soal'}
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
