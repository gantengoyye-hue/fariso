import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, Shield, GraduationCap, ArrowRight } from 'lucide-react';

const JURUSAN = [
  { id: 'TKJ', name: 'Teknik Komputer & Jaringan', icon: BookOpen },
  { id: 'DKV', name: 'Desain Komunikasi Visual', icon: Award },
  { id: 'AK', name: 'Akuntansi', icon: Shield },
  { id: 'BC', name: 'Broadcasting', icon: Users },
  { id: 'MPLB', name: 'Manajemen Perkantoran', icon: GraduationCap },
  { id: 'BD', name: 'Bisnis Digital', icon: BookOpen },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-red-100 selection:text-red-700">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
              PU
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900 leading-none">Exalance</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">SMK Prima Unggul</p>
            </div>
          </div>
          
          <Link to="/login" className="btn-primary">
            Portal Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 inline-block">
              Welcome to SMK Prima Unggul
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tighter">
              Platform Ujian Digital <br />
              <span className="text-brand-primary">Masa Depan.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Membangun kompetensi unggul melalui sistem evaluasi pembelajaran yang modern, 
              transparan, dan akuntabel di SMK Prima Unggul.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link to="/login" className="btn-primary min-w-[200px] py-4">
                Mulai Ujian Sekarang
              </Link>
              <a href="#jurusan" className="btn-secondary min-w-[200px] py-4">
                Lihat Jurusan
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '6+', label: 'Jurusan Unggulan' },
            { value: '1000+', label: 'Siswa Aktif' },
            { value: '50+', label: 'Guru Kompeten' },
            { value: '100%', label: 'Digital Oriented' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <h3 className="text-4xl font-bold text-brand-primary mb-2">{stat.value}</h3>
              <p className="text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Jurusan */}
      <section id="jurusan" className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Jurusan Kompetensi</h2>
            <p className="text-gray-500">Mempersiapkan tenaga kerja profesional di berbagai bidang.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {JURUSAN.map((j, i) => (
              <motion.div
                key={j.id}
                whileHover={{ y: -10 }}
                className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-50 transition-colors">
                  <j.icon className="w-6 h-6 text-gray-400 group-hover:text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{j.id}</h3>
                <p className="text-gray-500 font-medium">{j.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">SMK Prima Unggul</h1>
          </div>
          <p className="text-gray-400 max-w-lg mx-auto mb-10">
            Jl. Raya Pendidikan No. 123, Indonesia. <br />
            Mencetak Generasi Unggul dan Berkarakter.
          </p>
          <div className="pt-10 border-t border-white/10 text-gray-500 text-sm">
            &copy; 2026 SMK Prima Unggul. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
