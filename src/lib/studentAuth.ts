import { supabase } from './supabase'

export type StudentStatus = 'pending' | 'approved' | 'declined'

export interface StudentAccount {
  id: string
  full_name: string
  semester: string
  branch: string
  course: string
  email: string
  phone: string
  college_name: string
  status: StudentStatus
  duration_label: string | null
  approved_at: string | null
  expires_at: string | null
  created_at: string
}

export const APPROVAL_DURATIONS = [
  { label: '1 Day', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '15 Days', days: 15 },
  { label: '30 Days', days: 30 },
  { label: '60 Days', days: 60 },
  { label: '6 Months', days: 180 },
] as const

const SESSION_KEY = 'vll_student_session_v1'

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function getSavedStudentSession(): StudentAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as StudentAccount) : null
  } catch {
    return null
  }
}

export function saveStudentSession(student: StudentAccount | null) {
  if (!student) {
    localStorage.removeItem(SESSION_KEY)
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(student))
  }
  window.dispatchEvent(new Event('vll-student-auth-change'))
}

export function isStudentAccessActive(student: StudentAccount | null): {
  active: boolean
  reason?: 'not_logged_in' | 'pending' | 'declined' | 'expired'
} {
  if (!student) return { active: false, reason: 'not_logged_in' }
  if (student.status === 'pending') return { active: false, reason: 'pending' }
  if (student.status === 'declined') return { active: false, reason: 'declined' }
  if (student.expires_at && new Date(student.expires_at).getTime() <= Date.now()) {
    return { active: false, reason: 'expired' }
  }
  return { active: true }
}

export async function refreshStudentSession(): Promise<StudentAccount | null> {
  const saved = getSavedStudentSession()
  if (!saved || !supabase) return saved
  const { data, error } = await supabase
    .from('student_accounts')
    .select('id, full_name, semester, branch, course, email, phone, college_name, status, duration_label, approved_at, expires_at, created_at')
    .eq('id', saved.id)
    .maybeSingle()
  if (!error && data) {
    const fresh = data as StudentAccount
    saveStudentSession(fresh)
    return fresh
  }
  return saved
}

export async function registerStudent(payload: {
  full_name: string
  semester: string
  branch: string
  course: string
  email: string
  password: string
  phone: string
  college_name: string
}): Promise<{ ok: boolean; error?: string; student?: StudentAccount }> {
  if (!supabase) return { ok: false, error: 'Cloud database is not configured.' }
  const cleanEmail = payload.email.trim().toLowerCase()
  const password_hash = await hashPassword(payload.password)

  const { data, error } = await supabase
    .from('student_accounts')
    .insert({
      full_name: payload.full_name.trim(),
      semester: payload.semester.trim(),
      branch: payload.branch.trim(),
      course: payload.course.trim(),
      email: cleanEmail,
      password_hash,
      phone: payload.phone.trim(),
      college_name: payload.college_name.trim(),
      status: 'pending',
    })
    .select('id, full_name, semester, branch, course, email, phone, college_name, status, duration_label, approved_at, expires_at, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'An account with this Gmail ID already exists. Please log in instead.' }
    }
    return { ok: false, error: error.message }
  }

  const student = data as StudentAccount
  saveStudentSession(student)
  return { ok: true, student }
}

export async function loginStudent(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string; student?: StudentAccount }> {
  if (!supabase) return { ok: false, error: 'Cloud database is not configured.' }
  const cleanEmail = email.trim().toLowerCase()
  const password_hash = await hashPassword(password)

  const { data, error } = await supabase
    .from('student_accounts')
    .select('id, full_name, semester, branch, course, email, phone, college_name, status, duration_label, approved_at, expires_at, created_at, password_hash')
    .eq('email', cleanEmail)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data || data.password_hash !== password_hash) {
    return { ok: false, error: 'Invalid Gmail ID or password.' }
  }

  const { password_hash: _ignored, ...student } = data
  saveStudentSession(student as StudentAccount)
  return { ok: true, student: student as StudentAccount }
}

export async function fetchAllStudents(): Promise<StudentAccount[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('student_accounts')
    .select('id, full_name, semester, branch, course, email, phone, college_name, status, duration_label, approved_at, expires_at, created_at')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data as StudentAccount[]
}

export async function approveStudentAccount(
  studentId: string,
  days: number,
  durationLabel: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Cloud database not configured.' }
  const now = new Date()
  const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  const { error } = await supabase
    .from('student_accounts')
    .update({
      status: 'approved',
      duration_label: durationLabel,
      approved_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })
    .eq('id', studentId)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function declineStudentAccount(
  studentId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Cloud database not configured.' }
  const { error } = await supabase
    .from('student_accounts')
    .update({
      status: 'declined',
      duration_label: null,
      approved_at: null,
      expires_at: null,
    })
    .eq('id', studentId)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
