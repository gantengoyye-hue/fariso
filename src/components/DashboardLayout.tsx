import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  BarChart3, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap,
  Calendar,
  Settings,
  ClipboardList,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = {
    admin: [
      { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/app/exams', icon: FileText, label: 'Manajemen Ujian' },
      { path: '/app/bank-soal', icon: Database, label: 'Bank Soal' },
      { path: '/app/rekap', icon: BarChart3, label: 'Rekap Hasil' },
      { path: '/app/users', icon: Users, label: 'User Management' },
    ],
    guru: [
      { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/app/exams', icon: FileText, label: 'Buat Ujian' },
      { path: '/app/tugas', icon: ClipboardList, label: 'Manajemen Tugas' },
      { path: '/app/bank-soal', icon: Database, label: 'Bank Soal' },
      { path: '/app/monitoring', icon: Activity, label: 'Pantau Ujian' },
      { path: '/app/rekap', icon: BarChart3, label: 'Hasil Ujian' },
    ],
    siswa: [
      { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/app/available-exams', icon: Calendar, label: 'Daftar Ujian' },
      { path: '/app/tugas-siswa', icon: ClipboardList, label: 'Tugas Saya' },
      { path: '/app/my-results', icon: Award, label: 'Hasil Belajar' },
    ],
  };

  const currentMenu = profile ? menuItems[profile.role] : [];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col",
        !sidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
              PU
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900">SMK PRIMA UNGGUL</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">{profile?.role} Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {currentMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all group text-sm",
                  location.pathname === item.path
                    ? "bg-red-50 text-red-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  location.pathname === item.path ? "text-red-700" : "text-slate-400 group-hover:text-slate-900 shadow-none"
                )} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Profile Info Footer */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-900 rounded-xl p-4 text-white">
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-semibold truncate">{profile?.full_name}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {location.pathname.split('/').pop()?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Supabase Connected
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-secondary shadow-sm transition-colors active:scale-95"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// Placeholder for missing Award icon
function Award({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  );
}
