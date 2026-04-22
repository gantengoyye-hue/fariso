# Panduan Pitching Supabase - Exalance

Untuk menjalankan aplikasi ini, Anda perlu mengonfigurasi database di Supabase. Ikuti langkah-langkah berikut:

## 1. Salin Environment Variables
Buka panel **Secrets** di AI Studio dan tambahkan variabel berikut (ambil dari dashboard Supabase: Project Settings > API):
- `VITE_SUPABASE_URL`: URL project Anda.
- `VITE_SUPABASE_ANON_KEY`: Anon key project Anda.

## 2. Jalankan SQL di Supabase SQL Editor
Buka **SQL Editor** di dashboard Supabase Anda, lalu tempel dan jalankan kode berikut untuk membuat tabel dan kebijakan keamanan (RLS):

```sql
-- TABEL PROFIL PENGGUNA
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  nis TEXT,
  role TEXT CHECK (role IN ('admin', 'guru', 'siswa')) DEFAULT 'siswa',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL UJIAN
CREATE TABLE exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL BANK SOAL
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL HASIL UJIAN
CREATE TABLE exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score NUMERIC DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(exam_id, student_id)
);

-- TABEL JAWABAN SISWA
CREATE TABLE student_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  result_id UUID REFERENCES exam_results(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  UNIQUE(result_id, question_id)
);

-- AKTIFKAN RLS (ROW LEVEL SECURITY)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_responses ENABLE ROW LEVEL SECURITY;

-- KEBIJAKAN (POLICIES)
CREATE POLICY "Profiles viewable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Manage profile" ON profiles FOR ALL USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Exams select" ON exams FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Exams manage" ON exams FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru')));

CREATE POLICY "Questions select" ON questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Questions manage" ON questions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru')));

CREATE POLICY "Results manage" ON exam_results FOR ALL USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru')));

CREATE POLICY "Responses manage" ON student_responses FOR ALL USING (EXISTS (SELECT 1 FROM exam_results WHERE id = result_id AND (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'guru')))));

-- OTOMATIS CREATE PROFILE SAAT SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User Baru'),
    CASE WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin' ELSE 'siswa' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 3. Akun Admin Pertama
User pertama yang mendaftar (Sign Up) melalui aplikasi atau dashboard Supabase akan **otomatis menjadi Admin**.

Selamat mencoba!
