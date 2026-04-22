/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cleanup URL: remove trailing slash if present
const supabaseUrl = rawUrl.trim().replace(/\/$/, '');
const supabaseAnonKey = rawKey.trim();

const isValidConfig = supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20;

export const supabase = createClient(
  isValidConfig ? supabaseUrl : 'https://placeholder.supabase.co',
  isValidConfig ? supabaseAnonKey : 'placeholder'
);

if (!isValidConfig) {
  console.warn('Supabase URL or Anon Key is missing. Please check your Secrets in AI Studio.');
}

export const isSupabaseConfigured = !!isValidConfig;

export type UserRole = 'admin' | 'guru' | 'siswa';

export interface Profile {
  id: string;
  full_name: string;
  nis?: string;
  role: UserRole;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
    [key: string]: string;
  };
  correct_answer: string;
}

export interface ExamResult {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  started_at: string;
  completed_at: string;
  exam?: Exam;
  student?: Profile;
}

export interface StudentResponse {
  id: string;
  result_id: string;
  question_id: string;
  selected_option: string;
}
