import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, createContext, useContext } from 'react';
import { supabase, type Profile } from './lib/supabase';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { ExamManagement } from './pages/ExamManagement';
import { BankSoal } from './pages/BankSoal';
import { RekapHasil } from './pages/RekapHasil';
import { UserManagement } from './pages/UserManagement';
import { StudentExams } from './pages/siswa/StudentExams';
import { ExamRoom } from './pages/siswa/ExamRoom';
import { StudentResults } from './pages/siswa/StudentResults';
import { MonitoringUjian } from './pages/MonitoringUjian';
import { ManajemenTugas } from './pages/ManajemenTugas';

// Auth Context
interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        console.error('Network error (Failed to fetch). Supabase might be down or paused.');
      } else {
        console.error('Error fetching profile:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/app/dashboard" />} />

          {/* Protected App Routes */}
          <Route path="/app" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/app/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Admin & Guru Routes */}
            {(profile?.role === 'admin' || profile?.role === 'guru') && (
              <>
                <Route path="all-exams" element={<ExamManagement />} />
                <Route path="exams" element={<ExamManagement />} />
                <Route path="tugas" element={<ManajemenTugas />} />
                <Route path="bank-soal" element={<BankSoal />} />
                <Route path="monitoring" element={<MonitoringUjian />} />
                <Route path="rekap" element={<RekapHasil />} />
              </>
            )}

            {/* Admin Only */}
            {profile?.role === 'admin' && (
              <Route path="users" element={<UserManagement />} />
            )}

            {/* Siswa Routes */}
            {profile?.role === 'siswa' && (
              <>
                <Route path="available-exams" element={<StudentExams />} />
                <Route path="tugas-siswa" element={<StudentExams />} />
                <Route path="my-results" element={<StudentResults />} />
              </>
            )}
          </Route>

          {/* Special Route: Exam Room (No complex layout) */}
          <Route 
            path="/app/exam/:id" 
            element={user && profile?.role === 'siswa' ? <ExamRoom /> : <Navigate to="/login" />} 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
