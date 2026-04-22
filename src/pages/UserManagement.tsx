import { useState, useEffect } from 'react';
import { supabase, type Profile, type UserRole } from '../lib/supabase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users,
  Loader2,
  X,
  UserPlus,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<Profile> & { email?: string; password?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (currentUser?.id) {
        // Update profile
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: currentUser.full_name,
            nis: currentUser.nis,
            role: currentUser.role
          })
          .eq('id', currentUser.id);
        
        if (error) throw error;
      } else {
        // Create new user (Simulated create - usually done via Edge function or admin dashboard in Supabase)
        // Note: Client side auth.signUp doesn't set metadata/roles automatically without triggers
        alert('Fitur tambah user memerlukan konfigurasi Supabase Auth Admin. Gunakan dashboard Supabase atau buat Edge Function untuk sinkronisasi penuh.');
      }
      
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Gagal menyimpan data user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === (await supabase.auth.getUser()).data.user?.id) {
      alert('Anda tidak bisa menghapus diri sendiri!');
      return;
    }
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Gagal menghapus user.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">User Management</h1>
          <p className="text-gray-500 font-medium">Kelola akses dan data seluruh warga sekolah.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentUser({ full_name: '', nis: '', role: 'siswa' });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Tambah User
        </button>
      </div>

      <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center gap-6 relative">
        <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input className="w-full bg-gray-50 border border-gray-100 pl-14 pr-4 py-4 rounded-2xl outline-none focus:border-brand-primary font-medium" placeholder="Cari nama atau NIS..." />
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">NIS / NIP</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" /></td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-bold",
                      user.role === 'admin' ? "bg-red-50 text-brand-primary" : 
                      user.role === 'guru' ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600"
                    )}>
                      {user.role === 'admin' ? <ShieldCheck className="w-6 h-6" /> : 
                       user.role === 'guru' ? <Users className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-400 font-medium">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    user.role === 'admin' ? "bg-red-100 text-brand-primary" : 
                    user.role === 'guru' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <p className="font-mono text-sm text-gray-500 font-bold">{user.nis || '-'}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal User */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xl bg-white rounded-[32px] p-10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-8">{currentUser?.id ? 'Edit User' : 'Tambah User Baru'}</h3>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input required value={currentUser?.full_name} onChange={e => setCurrentUser({...currentUser, full_name: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">NIS / NIP</label>
                    <input value={currentUser?.nis} onChange={e => setCurrentUser({...currentUser, nis: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Role</label>
                    <select value={currentUser?.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value as UserRole})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold">
                      <option value="siswa">Siswa</option>
                      <option value="guru">Guru</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-8 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                  <button type="submit" disabled={submitting} className="btn-primary min-w-[160px] flex items-center justify-center">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan User'}
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
