import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Department, Laboratory, Experiment, UserRole } from '../types/lab'
import { INITIAL_DEPARTMENTS, INITIAL_LABORATORIES, INITIAL_EXPERIMENTS } from '../data/initialData'
import { isSupabaseConfigured } from '../lib/supabase'

interface LabStoreContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  userEmail: string
  userName: string
  departments: Department[]
  laboratories: Laboratory[]
  experiments: Experiment[]
  recentLabIds: string[]
  recentExperimentIds: string[]
  bookmarkedExperimentIds: string[]
  recordLabVisit: (labId: string) => void
  recordExperimentVisit: (expId: string) => void
  toggleBookmarkExperiment: (expId: string) => void
  addDepartment: (dept: Department) => void
  updateDepartment: (dept: Department) => void
  deleteDepartment: (id: string) => void
  addLaboratory: (lab: Laboratory) => void
  updateLaboratory: (lab: Laboratory) => void
  deleteLaboratory: (id: string) => void
  addExperiment: (exp: Experiment) => void
  updateExperiment: (exp: Experiment) => void
  deleteExperiment: (id: string) => void
  resetToFactoryDefaults: () => void
  supabaseConnected: boolean
}

const LabStoreContext = createContext<LabStoreContextType | undefined>(undefined)

const STORAGE_KEYS = {
  ROLE: 'vll_role_v2',
  DEPT: 'vll_departments_v2',
  LABS: 'vll_laboratories_v2',
  EXPS: 'vll_experiments_v2',
  RECENT_LABS: 'vll_recent_labs_v2',
  RECENT_EXPS: 'vll_recent_exps_v2',
  BOOKMARKS: 'vll_bookmarks_v2',
}

export function LabStoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE)
    if (saved === 'student' || saved === 'instructor' || saved === 'admin') return saved
    return 'instructor'
  })

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPT)
    if (saved) {
      try { return JSON.parse(saved) } catch { /* fallback */ }
    }
    return INITIAL_DEPARTMENTS
  })

  const [laboratories, setLaboratories] = useState<Laboratory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LABS)
    if (saved) {
      try { return JSON.parse(saved) } catch { /* fallback */ }
    }
    return INITIAL_LABORATORIES
  })

  const [experiments, setExperiments] = useState<Experiment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPS)
    if (saved) {
      try { return JSON.parse(saved) } catch { /* fallback */ }
    }
    return INITIAL_EXPERIMENTS
  })

  const [recentLabIds, setRecentLabIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECENT_LABS)
    if (saved) {
      try { return JSON.parse(saved) } catch { /* fallback */ }
    }
    return ['lab-ee-em1', 'lab-ee-eca', 'lab-me-fm']
  })

  const [recentExperimentIds, setRecentExperimentIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECENT_EXPS)
    if (saved) {
      try { return JSON.parse(saved) } catch { /* fallback */ }
    }
    return ['exp-dc-motor-speed', 'exp-series-rlc-resonance']
  })

  const [bookmarkedExperimentIds, setBookmarkedExperimentIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
    if (saved) {
      try { return JSON.parse(saved) } catch { /* fallback */ }
    }
    return ['exp-dc-motor-speed']
  })

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ROLE, role) }, [role])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DEPT, JSON.stringify(departments)) }, [departments])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(laboratories)) }, [laboratories])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPS, JSON.stringify(experiments)) }, [experiments])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECENT_LABS, JSON.stringify(recentLabIds)) }, [recentLabIds])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECENT_EXPS, JSON.stringify(recentExperimentIds)) }, [recentExperimentIds])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedExperimentIds)) }, [bookmarkedExperimentIds])

  const setRole = (newRole: UserRole) => setRoleState(newRole)

  const userEmail =
    role === 'admin'
      ? 'admin@eatm.edu.in'
      : role === 'instructor'
      ? 'instructor.ee@eatm.edu.in'
      : 'student.btech@eatm.edu.in'

  const userName =
    role === 'admin'
      ? 'Platform Administrator'
      : role === 'instructor'
      ? 'Lab Instructor (EE)'
      : 'B.Tech Engineering Student'

  const recordLabVisit = useCallback((labId: string) => {
    setRecentLabIds((prev) => [labId, ...prev.filter((id) => id !== labId)].slice(0, 6))
  }, [])

  const recordExperimentVisit = useCallback((expId: string) => {
    setRecentExperimentIds((prev) => [expId, ...prev.filter((id) => id !== expId)].slice(0, 6))
  }, [])

  const toggleBookmarkExperiment = useCallback((expId: string) => {
    setBookmarkedExperimentIds((prev) =>
      prev.includes(expId) ? prev.filter((id) => id !== expId) : [expId, ...prev]
    )
  }, [])

  const addDepartment = (dept: Department) => setDepartments((prev) => [...prev, dept])
  const updateDepartment = (dept: Department) =>
    setDepartments((prev) => prev.map((d) => (d.id === dept.id ? dept : d)))
  const deleteDepartment = (id: string) =>
    setDepartments((prev) => prev.filter((d) => d.id !== id))

  const addLaboratory = (lab: Laboratory) => setLaboratories((prev) => [...prev, lab])
  const updateLaboratory = (lab: Laboratory) =>
    setLaboratories((prev) => prev.map((l) => (l.id === lab.id ? lab : l)))
  const deleteLaboratory = (id: string) =>
    setLaboratories((prev) => prev.filter((l) => l.id !== id))

  const addExperiment = (exp: Experiment) => setExperiments((prev) => [exp, ...prev])
  const updateExperiment = (exp: Experiment) =>
    setExperiments((prev) => prev.map((e) => (e.id === exp.id ? exp : e)))
  const deleteExperiment = (id: string) =>
    setExperiments((prev) => prev.filter((e) => e.id !== id))

  const resetToFactoryDefaults = () => {
    setDepartments(INITIAL_DEPARTMENTS)
    setLaboratories(INITIAL_LABORATORIES)
    setExperiments(INITIAL_EXPERIMENTS)
    setRecentLabIds(['lab-ee-em1', 'lab-ee-eca', 'lab-me-fm'])
    setRecentExperimentIds(['exp-dc-motor-speed', 'exp-series-rlc-resonance'])
    localStorage.removeItem(STORAGE_KEYS.DEPT)
    localStorage.removeItem(STORAGE_KEYS.LABS)
    localStorage.removeItem(STORAGE_KEYS.EXPS)
  }

  return (
    <LabStoreContext.Provider
      value={{
        role,
        setRole,
        userEmail,
        userName,
        departments,
        laboratories,
        experiments,
        recentLabIds,
        recentExperimentIds,
        bookmarkedExperimentIds,
        recordLabVisit,
        recordExperimentVisit,
        toggleBookmarkExperiment,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addLaboratory,
        updateLaboratory,
        deleteLaboratory,
        addExperiment,
        updateExperiment,
        deleteExperiment,
        resetToFactoryDefaults,
        supabaseConnected: isSupabaseConfigured,
      }}
    >
      {children}
    </LabStoreContext.Provider>
  )
}

export function useLabStore() {
  const ctx = useContext(LabStoreContext)
  if (!ctx) throw new Error('useLabStore must be used within LabStoreProvider')
  return ctx
}
