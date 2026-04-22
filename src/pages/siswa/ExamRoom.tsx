import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Exam, type Question, type ExamResult } from '../../lib/supabase';
import { useAuth } from '../../App';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function ExamRoom() {
  const { id: examId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [resultId, setResultId] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    startExamSession();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !loading && questions.length > 0) {
      finishExam();
    }
  }, [timeLeft, loading]);

  const startExamSession = async () => {
    try {
      // 1. Fetch Exam & Questions
      const [examRes, questionsRes] = await Promise.all([
        supabase.from('exams').select('*').eq('id', examId).single(),
        supabase.from('questions').select('*').eq('exam_id', examId)
      ]);

      if (examRes.error) throw examRes.error;
      if (questionsRes.error) throw questionsRes.error;

      setExam(examRes.data);
      setQuestions(questionsRes.data);
      setTimeLeft(examRes.data.duration_minutes * 60);

      // 2. Create or find existing exam_result
      const { data: existingResult } = await supabase
        .from('exam_results')
        .select('*')
        .eq('exam_id', examId)
        .eq('student_id', profile?.id)
        .maybeSingle();

      if (existingResult) {
        if (existingResult.completed_at) {
          navigate('/app/my-results');
          return;
        }
        setResultId(existingResult.id);
        // Fetch existing responses
        const { data: savedResponses } = await supabase
          .from('student_responses')
          .select('*')
          .eq('result_id', existingResult.id);
        
        const initialAnswers: Record<string, string> = {};
        savedResponses?.forEach(r => initialAnswers[r.question_id] = r.selected_option);
        setAnswers(initialAnswers);
      } else {
        const { data: newResult, error } = await supabase
          .from('exam_results')
          .insert([{ 
            exam_id: examId, 
            student_id: profile?.id,
            total_questions: questionsRes.data.length
          }])
          .select()
          .single();
        
        if (error) throw error;
        setResultId(newResult.id);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memulai ujian.');
      navigate('/app/available-exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (questionId: string, option: string) => {
    const prevAnswer = answers[questionId];
    setAnswers({ ...answers, [questionId]: option });
    
    // Save to DB optimistically
    try {
      if (prevAnswer) {
        await supabase
          .from('student_responses')
          .update({ selected_option: option })
          .eq('result_id', resultId)
          .eq('question_id', questionId);
      } else {
        await supabase
          .from('student_responses')
          .insert([{ result_id: resultId, question_id: questionId, selected_option: option }]);
      }
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const finishExam = async () => {
    setIsFinishing(true);
    try {
      // Calculate Score
      let correct = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) correct++;
      });
      const score = Math.round((correct / questions.length) * 100);

      const { error } = await supabase
        .from('exam_results')
        .update({
          score,
          correct_answers: correct,
          completed_at: new Date().toISOString()
        })
        .eq('id', resultId);

      if (error) throw error;
      navigate('/app/my-results');
    } catch (err) {
      alert('Gagal mengakhiri ujian. Silakan coba lagi.');
      setIsFinishing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-12 h-12 animate-spin text-brand-primary" /></div>;

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      {/* Exam Header */}
      <header className="h-20 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 text-brand-primary rounded-xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 truncate max-w-[200px] sm:max-w-md">{exam?.title}</h1>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Pengerjaan Mandiri • {profile?.full_name}</p>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-2xl font-mono text-xl font-bold transition-all",
          timeLeft < 300 ? "bg-red-600 text-white animate-pulse" : "bg-gray-900 text-white"
        )}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Question Side */}
        <main className="flex-1 p-8 lg:p-12 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-widest">
                  Soal No. {currentIdx + 1}
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-relaxed min-h-[100px]">
                {currentQuestion?.question_text}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {['a', 'b', 'c', 'd'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleAnswerChange(currentQuestion.id, key)}
                  className={cn(
                    "p-6 rounded-3xl border-2 text-left transition-all flex items-center gap-6 group relative overflow-hidden",
                    answers[currentQuestion.id] === key 
                      ? "bg-brand-primary text-white border-brand-primary shadow-xl shadow-red-500/20" 
                      : "bg-white border-gray-100 hover:border-gray-200 text-gray-700"
                  )}
                >
                  <span className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm uppercase shrink-0 transition-colors",
                    answers[currentQuestion.id] === key 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                  )}>
                    {key}
                  </span>
                  <p className="text-lg font-bold">{currentQuestion.options[key]}</p>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Navigation Sidebar */}
        <aside className="w-80 bg-white border-l p-8 hidden xl:flex flex-col">
          <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs opacity-40">Navigasi Soal</h3>
          <div className="grid grid-cols-5 gap-3 flex-1 content-start">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                  idx === currentIdx ? "ring-2 ring-brand-primary ring-offset-2" : "",
                  answers[q.id] 
                    ? "bg-brand-primary text-white" 
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="pt-8 border-t space-y-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-gray-400 uppercase tracking-widest text-xs">Dijawab</span>
              <span className="text-brand-primary">{Object.keys(answers).length} / {questions.length}</span>
            </div>
            <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-primary transition-all duration-500" 
                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
              />
            </div>
            <button 
              onClick={() => setShowConfirm(true)}
              className="btn-primary w-full py-4 mt-4 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Selesai Ujian
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Footer Nav */}
      <footer className="xl:hidden bg-white border-t p-4 flex items-center justify-between gap-4">
        <button 
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(prev => prev - 1)}
          className="p-4 bg-gray-50 rounded-2xl disabled:opacity-30"
        >
          <ChevronLeft />
        </button>
        <div className="font-bold text-gray-900">
          Soal {currentIdx + 1} / {questions.length}
        </div>
        {currentIdx === questions.length - 1 ? (
          <button 
            onClick={() => setShowConfirm(true)}
            className="p-4 bg-brand-primary text-white rounded-2xl"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={() => setCurrentIdx(prev => prev + 1)}
            className="p-4 bg-gray-900 text-white rounded-2xl"
          >
            <ChevronRight />
          </button>
        )}
      </footer>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white p-12 rounded-[40px] max-w-lg w-full text-center shadow-2xl">
              <div className="w-24 h-24 bg-red-50 text-brand-primary rounded-[32px] flex items-center justify-center mx-auto mb-8">
                <Send className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-extrabold mb-4">Selesaikan Ujian?</h3>
              <p className="text-gray-500 mb-10 leading-relaxed">
                Anda telah menjawab <span className="font-bold text-brand-primary">{Object.keys(answers).length} dari {questions.length}</span> soal. 
                Pastikan semua jawaban sudah benar sebelum mengirim.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button disabled={isFinishing} onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 py-4">Kembali</button>
                <button disabled={isFinishing} onClick={finishExam} className="btn-primary flex-1 py-4">
                  {isFinishing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Ya, Kirim Sekarang'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
