import React, { useEffect, useState } from 'react'
import { GraduationCap, RefreshCw, CheckCircle2, XCircle, Clock, Mail, Phone, Building2 } from 'lucide-react'
import { Card, Badge, Button } from '../ui/DesignSystem'
import {
  APPROVAL_DURATIONS,
  approveStudentAccount,
  declineStudentAccount,
  fetchAllStudents,
  StudentAccount,
} from '../../lib/studentAuth'

export function StudentApprovalsPanel() {
  const [students, setStudents] = useState<StudentAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDays, setSelectedDays] = useState<Record<string, number>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  const loadStudents = async () => {
    setLoading(true)
    const list = await fetchAllStudents()
    setStudents(list)
    setLoading(false)
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleApprove = async (student: StudentAccount) => {
    const days = selectedDays[student.id] ?? 30
    const durationObj = APPROVAL_DURATIONS.find((d) => d.days === days) || APPROVAL_DURATIONS[4]
    setBusyId(student.id)
    const res = await approveStudentAccount(student.id, durationObj.days, durationObj.label)
    setBusyId(null)
    if (res.ok) {
      setFeedback(`Approved ${student.full_name} for ${durationObj.label} (starts now).`)
      await loadStudents()
    } else {
      setFeedback(`Error: ${res.error}`)
    }
  }

  const handleDecline = async (student: StudentAccount) => {
    setBusyId(student.id)
    const res = await declineStudentAccount(student.id)
    setBusyId(null)
    if (res.ok) {
      setFeedback(`Declined access request for ${student.full_name}.`)
      await loadStudents()
    } else {
      setFeedback(`Error: ${res.error}`)
    }
  }

  const pendingCount = students.filter((s) => s.status === 'pending').length

  return (
    <Card className="p-6 space-y-5 border-2 border-sky-600/25">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">
                Student Login Requests &amp; Access Approvals
              </h2>
              {pendingCount > 0 && (
                <Badge tone="amber">{pendingCount} Pending</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Approve students with a time limit (starts immediately upon approval) or decline requests.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadStudents} disabled={loading}>
          <RefreshCw className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} /> Refresh
        </Button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-900">
          {feedback}
        </div>
      )}

      {students.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-500">
          {loading ? 'Loading student requests...' : 'No student registration requests yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((s) => {
            const isExpired =
              s.status === 'approved' &&
              s.expires_at &&
              new Date(s.expires_at).getTime() <= Date.now()
            const chosenDays = selectedDays[s.id] ?? 30

            return (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{s.full_name}</span>
                    <Badge tone="sky">{s.course}</Badge>
                    <Badge tone="slate">{s.branch}</Badge>
                    <Badge tone="slate">{s.semester}</Badge>
                    <Badge
                      tone={
                        s.status === 'approved' && !isExpired
                          ? 'teal'
                          : s.status === 'pending'
                          ? 'amber'
                          : 'rose'
                      }
                    >
                      {isExpired
                        ? 'Expired'
                        : s.status === 'approved'
                        ? `Approved (${s.duration_label || 'Active'})`
                        : s.status === 'pending'
                        ? 'Pending'
                        : 'Declined'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {s.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {s.college_name}
                    </span>
                  </div>

                  {s.expires_at && s.status === 'approved' && (
                    <div className="text-[11px] font-medium text-teal-700 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires: {new Date(s.expires_at).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <select
                    value={chosenDays}
                    onChange={(e) =>
                      setSelectedDays((prev) => ({
                        ...prev,
                        [s.id]: Number(e.target.value),
                      }))
                    }
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800"
                  >
                    {APPROVAL_DURATIONS.map((d) => (
                      <option key={d.days} value={d.days}>
                        {d.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={busyId === s.id}
                    onClick={() => handleApprove(s)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {s.status === 'approved' ? 'Renew' : 'Approve'}
                  </button>

                  <button
                    type="button"
                    disabled={busyId === s.id}
                    onClick={() => handleDecline(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
