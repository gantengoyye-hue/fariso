import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion } from 'motion/react';
import { GraduationCap, Mail, Lock, Loader2, AlertCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError('Gagal menghubungi database (Failed to fetch). Pastikan Supabase URL benar dan project Anda tidak dipause.');
      } else {
        setError(err.message || 'Gagal login. Silakan periksa kembali email & password Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
              PU
            </div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">Exalance</h1>
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500 font-medium">Masuk ke akun Anda untuk melanjutkan ke platform ujian.</p>
          </div>

          {!isSupabaseConfigured && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-[28px] flex gap-4"
            >
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl h-fit">
                <Settings className="w-6 h-6 animate-spin-slow" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900">Supabase Belum Dikonfigurasi</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Buka panel <span className="font-bold">Secrets</span> di AI Studio dan tambahkan 
                  <span className="font-bold italic"> VITE_SUPABASE_URL</span> & 
                  <span className="font-bold italic"> VITE_SUPABASE_ANON_KEY</span>.
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600 text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Sekolah</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-brand-primary" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-brand-primary outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                  placeholder="name@smkprimaunggul.sch.id"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-brand-primary" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-brand-primary outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Masalah saat masuk? Hubungi IT Center SMK Prima Unggul.
          </p>
        </div>
      </div>

      {/* Right side: Illustration/Graphic */}
      <div className="hidden lg:flex flex-1 bg-brand-primary items-center justify-center p-20">
        <div className="relative w-full max-w-lg">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-white text-center"
          >
            <div className="w-32 h-32 bg-white/20 backdrop-blur-xl rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-white/30">
              <GraduationCap className="w-16 h-16" />
            </div>
            <h2 className="text-4xl font-bold mb-6 italic leading-snug">
              "Digitalisasi Pendidikan untuk Generasi Indonesia Maju."
            </h2>
            <p className="text-red-100 text-lg opacity-80">
              Platform evaluasi belajar terpadu yang didesain khusus untuk efisiensi dan integritas akademik.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
