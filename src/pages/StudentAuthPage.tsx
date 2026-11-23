import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GraduationCap, CheckCircle2, Clock, XCircle, LogOut, ArrowRight } from 'lucide-react'
import { Card, Button, Badge } from '../components/ui/DesignSystem'
import {
  getSavedStudentSession,
  isStudentAccessActive,
  loginStudent,
  refreshStudentSession,
  registerStudent,
  saveStudentSession,
  StudentAccount,
} from '../lib/studentAuth'

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600'

export function StudentAuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const redirectTo = searchParams.get('redirect') || '/experiments'

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [session, setSession] = useState<StudentAccount | null>(() => getSavedStudentSession())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Registration fields
  const [fullName, setFullName] = useState('')
  const [semester, setSemester] = useState('3rd Semester')
  const [branch, setBranch] = useState('')
  const [course, setCourse] = useState('B.Tech')
  const [customCourse, setCustomCourse] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    refreshStudentSession().then((fresh) => {
      if (fresh) setSession(fresh)
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)
    const res = await loginStudent(loginEmail, loginPassword)
    setLoading(false)
    if (!res.ok || !res.student) {
      setError(res.error || 'Login failed.')
      return
    }
    setSession(res.student)
    const check = isStudentAccessActive(res.student)
    if (check.active) {
      navigate(redirectTo)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const finalCourse = course === 'Other' ? customCourse.trim() : course
    if (!fullName.trim() || !branch.trim() || !finalCourse || !email.trim() || !phone.trim() || !collegeName.trim()) {
      setError('Please fill in all required student details.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.')
      return
    }

    setLoading(true)
    const res = await registerStudent({
      full_name: fullName,
      semester,
      branch,
      course: finalCourse,
      email,
      password,
      phone,
      college_name: collegeName,
    })
    setLoading(false)

    if (!res.ok || !res.student) {
      setError(res.error || 'Registration failed.')
      return
    }
    setSession(res.student)
    setSuccessMsg('Registration request sent to Admin! You can enter experiments once approved.')
  }

  const accessCheck = isStudentAccessActive(session)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Student Portal Access
        </h1>
        <p className="text-sm text-slate-500">
          Log in or register as a student to open experiments, 3D simulations, and lab manuals.
        </p>
      </div>

      {session && (
        <Card className="p-6 space-y-4 border-2 border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-base font-extrabold text-slate-900">{session.full_name}</div>
              <div className="text-xs text-slate-500">
                {session.email} • {session.course} ({session.branch}, {session.semester})
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{session.college_name}</div>
            </div>
            <Badge
              tone={
                accessCheck.active
                  ? 'teal'
                  : accessCheck.reason === 'pending'
                  ? 'amber'
                  : 'rose'
              }
            >
              {accessCheck.active
                ? 'Approved & Active'
                : accessCheck.reason === 'pending'
                ? 'Pending Admin Approval'
                : accessCheck.reason === 'expired'
                ? 'Access Expired'
                : 'Request Declined'}
            </Badge>
          </div>

          {accessCheck.active && (
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs sm:text-sm text-teal-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                Your student access is active ({session.duration_label || 'Approved'}).
                {session.expires_at && (
                  <span className="block text-xs text-teal-700 mt-0.5">
                    Valid until: {new Date(session.expires_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {accessCheck.reason === 'pending' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                Your login request has been sent to the Admin. Once the Admin approves your account and sets your access duration, you will be able to enter all experiments.
              </div>
            </div>
          )}

          {(accessCheck.reason === 'declined' || accessCheck.reason === 'expired') && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-900 flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                {accessCheck.reason === 'expired'
                  ? 'Your approved access time period has expired. Please contact the Admin to renew your access.'
                  : 'Your student access request was declined by the Admin.'}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {accessCheck.active && (
              <Button variant="primary" onClick={() => navigate(redirectTo)}>
                Continue to Experiment <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={async () => {
                const fresh = await refreshStudentSession()
                if (fresh) setSession(fresh)
              }}
            >
              Check Approval Status
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                saveStudentSession(null)
                setSession(null)
              }}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </Card>
      )}

      {!session && (
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={
                mode === 'login'
                  ? 'py-2 rounded-lg bg-white shadow-xs text-sm font-bold text-teal-800 cursor-pointer'
                  : 'py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer'
              }
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError('')
              }}
              className={
                mode === 'register'
                  ? 'py-2 rounded-lg bg-white shadow-xs text-sm font-bold text-teal-800 cursor-pointer'
                  : 'py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer'
              }
            >
              New Student Registration
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 font-medium">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs sm:text-sm text-teal-800 font-medium">
              {successMsg}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gmail ID</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={inputCls}
                />
              </div>
              <Button variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Log In as Student'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course *</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className={inputCls}
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="Diploma">Diploma</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch *</label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Electrical Engineering"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Semester *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className={inputCls}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={`${s}${s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th'} Semester`}>
                        {s}{s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th'} Semester
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {course === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specify Course Name *</label>
                  <input
                    type="text"
                    required
                    value={customCourse}
                    onChange={(e) => setCustomCourse(e.target.value)}
                    placeholder="Enter your course name"
                    className={inputCls}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">University / College Name *</label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. Einstein Academy of Technology and Management"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gmail ID *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={inputCls}
                  />
                </div>
              </div>

              <Button variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Submitting Request...' : 'Register & Request Admin Approval'}
              </Button>
            </form>
          )}
        </Card>
      )}
    </div>
  )
}
