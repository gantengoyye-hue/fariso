import { useAuth } from '../App';
import { motion } from 'motion/react';
import { 
  FileText, 
  Users, 
  Award, 
  Clock, 
  ArrowUpRight,
  Plus,
  Database,
  LucideIcon,
  Trophy,
  Play,
  ClipboardList,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface StatItem {
  label: string;
  value: string;
  trend: string;
  trendColor: string;
  trendBg: string;
  icon: LucideIcon;
  valueColor?: string;
}

export function Dashboard() {
  const { profile } = useAuth();

  const stats: Record<string, StatItem[]> = {
    admin: [
      { label: 'Total Siswa', value: '1,248', trend: '+12 item', trendColor: 'text-green-600', trendBg: 'bg-green-50', icon: Users },
      { label: 'Ujian Aktif', value: '4', trend: 'Live Realtime', trendColor: 'text-slate-400', trendBg: 'bg-slate-50', icon: FileText, valueColor: 'text-red-600' },
      { label: 'Rata-rata Nilai', value: '84.2', trend: 'Skala 100', trendColor: 'text-blue-600', trendBg: 'bg-blue-50', icon: Award },
      { label: 'Bank Soal', value: '5,892', trend: 'Items synced', trendColor: 'text-slate-400', trendBg: 'bg-slate-50', icon: Database },
    ],
    guru: [
      { label: 'Ujian Saya', value: '4', trend: 'Tahun ini', trendColor: 'text-green-600', trendBg: 'bg-green-50', icon: FileText },
      { label: 'Tugas Aktif', value: '8', trend: 'Minggu ini', trendColor: 'text-blue-600', trendBg: 'bg-blue-50', icon: ClipboardList },
      { label: 'Peserta Ujian', value: '156', trend: 'Siswa aktif', trendColor: 'text-blue-600', trendBg: 'bg-blue-50', icon: Users },
      { label: 'Rata-rata Kelas', value: '82.1', trend: 'Target: 75', trendColor: 'text-slate-400', trendBg: 'bg-slate-50', icon: Award },
    ],
    siswa: [
      { label: 'Ujian Tersedia', value: '2', trend: 'Hari ini', trendColor: 'text-brand-primary', trendBg: 'bg-red-50', icon: Clock, valueColor: 'text-brand-primary' },
      { label: 'Tugas Baru', value: '12', trend: 'Belum dikumpul', trendColor: 'text-blue-600', trendBg: 'bg-blue-50', icon: ClipboardList },
      { label: 'Rata-rata Nilai', value: '88', trend: 'Skala 100', trendColor: 'text-green-600', trendBg: 'bg-green-50', icon: Award },
      { label: 'Peringkat', value: '5', trend: 'Top 5%', trendColor: 'text-orange-600', trendBg: 'bg-orange-50', icon: Trophy },
    ],
  };

  const currentStats = profile ? stats[profile.role] : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Halo, {profile?.full_name}! 👋
          </h1>
          <p className="text-slate-500 font-medium">
            Berikut ringkasan aktivitas {profile?.role} SMK Prima Unggul hari ini.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group"
          >
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <h3 className={cn("text-3xl font-bold mt-1 tracking-tight text-slate-900", stat.valueColor)}>
              {stat.value}
            </h3>
            <div className={cn(
              "mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block",
              stat.trendBg,
              stat.trendColor
            )}>
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Data & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Section */}
        <div className="lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Aktivitas Ujian Terbaru</h4>
              <Link to="/app/exams" className="text-red-600 text-sm font-semibold hover:underline">Lihat Semua</Link>
            </div>
            <div className="overflow-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Judul Ujian</th>
                    <th className="px-6 py-4">Mata Pelajaran</th>
                    <th className="px-6 py-4">Durasi</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[1, 2, 3].map((item) => (
                    <tr key={item} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-slate-800 text-sm truncate max-w-[200px]">
                        UTS Pemrograman Web Dasar Kelas {item + 9}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">TKJ</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">90 Menit</td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold",
                          item === 3 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {item === 3 ? 'SELESAI' : 'SEDANG BERJALAN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions & More */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-slate-900">Quick Actions</h4>
            {(profile?.role === 'admin' || profile?.role === 'guru') && (
              <>
                <Link to="/app/exams" className="flex items-center justify-center gap-3 bg-red-600 text-white p-4 rounded-xl font-bold shadow-md hover:bg-red-700 transition-all active:scale-95">
                  <Plus className="w-6 h-6" />
                  BUAT UJIAN BARU
                </Link>
                <Link to="/app/bank-soal" className="flex items-center justify-center gap-3 bg-white border-2 border-red-600 text-red-600 p-4 rounded-xl font-bold hover:bg-red-50 transition-all active:scale-95 text-center">
                  <Database className="w-6 h-6" />
                  TAMBAH BANK SOAL
                </Link>
              </>
            )}
            {profile?.role === 'siswa' && (
              <Link to="/app/available-exams" className="flex items-center justify-center gap-3 bg-red-600 text-white p-4 rounded-xl font-bold shadow-md hover:bg-red-700 transition-all active:scale-95">
                <Play className="w-6 h-6" />
                IKUTI UJIAN AKTIF
              </Link>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4">Informasi Sistem</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <p className="text-sm text-slate-600 leading-tight">Batas pendaftaran ujian akhir semester adalah Jumat ini.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <p className="text-sm text-slate-600 leading-tight">Update sistem keamanan rutin dilakukan setiap Minggu malam.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
