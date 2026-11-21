import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Department, Laboratory, Experiment, UserRole } from '../types/lab'
import { INITIAL_DEPARTMENTS, INITIAL_LABORATORIES, INITIAL_EXPERIMENTS } from '../data/initialData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface LabStoreContextType {
  role: UserRole
  isAdminAuthenticated: boolean
  loginAsAdmin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logoutAdmin: () => Promise<void>
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
  syncAllToCloud: () => Promise<void>
  supabaseConnected: boolean
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'offline'
  cloudSyncMessage: string
}

const LabStoreContext = createContext<LabStoreContextType | undefined>(undefined)

const STORAGE_KEYS = {
  ADMIN_SESSION: 'vll_admin_auth_session_v3',
  DEPT: 'vll_departments_v2',
  LABS: 'vll_laboratories_v2',
  EXPS: 'vll_experiments_v2',
  RECENT_LABS: 'vll_recent_labs_v2',
  RECENT_EXPS: 'vll_recent_exps_v2',
  BOOKMARKS: 'vll_bookmarks_v2',
  DELETED_IDS: 'vll_deleted_ids_v1',
}

const CONFIGURED_ADMIN_EMAIL =
  (import.meta.env.VITE_ADMIN_EMAIL || 'admin@vlab.edu.in').trim().toLowerCase()
const CONFIGURED_ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD || 'VLabAdmin@2026'

export function LabStoreProvider({ children }: { children: React.ReactNode }) {
  const [adminSessionEmail, setAdminSessionEmail] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) || null
    } catch {
      return null
    }
  })

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle')
  const [cloudSyncMessage, setCloudSyncMessage] = useState<string>('Connecting to Supabase...')

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

  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_IDS) || "[]") } catch { return [] }
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

  // Load latest cloud data from Supabase on mount (merges cloud records with defaults)
  useEffect(() => {
    if (!supabase) {
      setCloudSyncStatus('offline')
      setCloudSyncMessage('Offline mode (Local Storage)')
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        setAdminSessionEmail(data.session.user.email)
      }
    })

    const fetchCloudData = async () => {
      setCloudSyncStatus('syncing')
      try {
        const [deptRes, labRes, expRes] = await Promise.all([
          supabase!.from('departments').select('*'),
          supabase!.from('laboratories').select('*'),
          supabase!.from('experiments').select('*'),
        ])

        if (deptRes.error || labRes.error || expRes.error) {
          setCloudSyncStatus('offline')
          setCloudSyncMessage('Supabase connected — run supabase/schema.sql to initialize tables')
          return
        }

        if (deptRes.data && deptRes.data.length > 0) {
          const mappedDepts: Department[] = deptRes.data.map((row: any) => ({
            id: row.id,
            slug: row.slug,
            code: row.code,
            name: row.name,
            shortName: row.short_name || row.name,
            description: row.description || '',
            iconName: row.icon_name || 'Zap',
            accentColor: row.accent_color || 'teal',
            published: row.published ?? true,
          }))
          setDepartments((prev) => {
            const ids = new Set(mappedDepts.map((d) => d.id))
            const del = new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_IDS) || "[]"))
            return [...mappedDepts, ...prev.filter((d) => !ids.has(d.id))].filter((d) => !del.has(d.id))
          })
        }

        if (labRes.data && labRes.data.length > 0) {
          const mappedLabs: Laboratory[] = labRes.data.map((row: any) => ({
            id: row.id,
            slug: row.slug,
            code: row.code,
            name: row.name,
            departmentId: row.department_id,
            semester: row.semester ?? 3,
            description: row.description || '',
            incharge: row.incharge || 'Faculty Lab In-Charge',
            roomNumber: row.room_number || 'Academic Lab Complex',
            equipmentHighlights: Array.isArray(row.equipment_highlights)
              ? row.equipment_highlights
              : [],
            featured: row.featured ?? true,
            published: row.published ?? true,
          }))
          setLaboratories((prev) => {
            const ids = new Set(mappedLabs.map((l) => l.id))
            const del = new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_IDS) || "[]"))
            return [...mappedLabs, ...prev.filter((l) => !ids.has(l.id))].filter((l) => !del.has(l.id))
          })
        }

        if (expRes.data && expRes.data.length > 0) {
          const mappedExps: Experiment[] = expRes.data
            .map((row: any) => row.payload as Experiment)
            .filter((p): p is Experiment => Boolean(p && p.id && p.title))
          if (mappedExps.length > 0) {
            setExperiments((prev) => {
              const ids = new Set(mappedExps.map((e) => e.id))
              const del = new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_IDS) || "[]"))
              return [...mappedExps, ...prev.filter((e) => !ids.has(e.id))].filter((e) => !del.has(e.id))
            })
          }
        }

        setCloudSyncStatus('synced')
        setCloudSyncMessage('Synced with Supabase Cloud')
      } catch {
        setCloudSyncStatus('offline')
        setCloudSyncMessage('Using local cache (Supabase unreachable)')
      }
    }

    fetchCloudData()
  }, [])

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DEPT, JSON.stringify(departments)) }, [departments])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(laboratories)) }, [laboratories])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPS, JSON.stringify(experiments)) }, [experiments])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECENT_LABS, JSON.stringify(recentLabIds)) }, [recentLabIds])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECENT_EXPS, JSON.stringify(recentExperimentIds)) }, [recentExperimentIds])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedExperimentIds)) }, [bookmarkedExperimentIds])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(deletedIds)) }, [deletedIds])

  const isAdminAuthenticated = Boolean(adminSessionEmail)
  const role: UserRole = isAdminAuthenticated ? 'admin' : 'student'

  const loginAsAdmin = async (
    emailInput: string,
    passwordInput: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase()
    const cleanPass = passwordInput

    if (!cleanEmail || !cleanPass) {
      return { ok: false, error: 'Please enter both Admin Email and Password.' }
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      })
      if (!error && data.user) {
        const loggedEmail = data.user.email || cleanEmail
        setAdminSessionEmail(loggedEmail)
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, loggedEmail)
        return { ok: true }
      }
    }

    if (cleanEmail === CONFIGURED_ADMIN_EMAIL && cleanPass === CONFIGURED_ADMIN_PASSWORD) {
      setAdminSessionEmail(cleanEmail)
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, cleanEmail)
      experiments.forEach((exp) => { syncExperimentToCloud(exp) })
      return { ok: true }
    }

    return { ok: false, error: 'Incorrect Admin email or password. Access denied.' }
  }

  const logoutAdmin = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setAdminSessionEmail(null)
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION)
  }

  // Cloud Sync Helper Functions (Fire-and-sync to Supabase PostgreSQL)
  const syncDepartmentToCloud = async (dept: Department) => {
    if (!supabase) return
    const { error } = await supabase!.from('departments').upsert({
      id: dept.id,
      slug: dept.slug,
      code: dept.code,
      name: dept.name,
      short_name: dept.shortName,
      description: dept.description,
      icon_name: dept.iconName,
      accent_color: dept.accentColor,
      published: dept.published,
    })
    if (!error) {
      setCloudSyncStatus('synced')
      setCloudSyncMessage('Saved to Supabase Cloud')
    }
  }

  const syncLabToCloud = async (lab: Laboratory) => {
    if (!supabase) return
    const { error } = await supabase!.from('laboratories').upsert({
      id: lab.id,
      slug: lab.slug,
      code: lab.code,
      name: lab.name,
      department_id: lab.departmentId,
      semester: lab.semester,
      description: lab.description,
      incharge: lab.incharge,
      room_number: lab.roomNumber,
      equipment_highlights: lab.equipmentHighlights || [],
      featured: lab.featured ?? true,
      published: lab.published,
    })
    if (!error) {
      setCloudSyncStatus('synced')
      setCloudSyncMessage('Saved to Supabase Cloud')
    }
  }

  const syncExperimentToCloud = async (exp: Experiment) => {
    if (!supabase) return
    // Ensure parent dept & lab exist in Supabase before inserting experiment
    const parentDept = departments.find((d) => d.id === exp.departmentId)
    const parentLab = laboratories.find((l) => l.id === exp.labId)
    if (parentDept) await syncDepartmentToCloud(parentDept)
    if (parentLab) await syncLabToCloud(parentLab)

    const { error } = await supabase!.from('experiments').upsert({
      id: exp.id,
      slug: exp.slug,
      code: exp.code,
      title: exp.title,
      lab_id: exp.labId,
      department_id: exp.departmentId,
      semester: exp.semester,
      difficulty: exp.difficulty,
      estimated_minutes: exp.estimatedMinutes,
      published: exp.published,
      payload: exp,
      updated_at: new Date().toISOString(),
    })
    if (!error) {
      setCloudSyncStatus('synced')
      setCloudSyncMessage('Experiment & HTML 3D Lab saved to Supabase Cloud')
    } else {
      console.error("Supabase experiment sync error:", error)
      setCloudSyncStatus('offline')
      setCloudSyncMessage(`Sync Error: ${error.message}`)
    }
  }

  const syncAllToCloud = async () => {
    if (!supabase) {
      setCloudSyncStatus('offline')
      setCloudSyncMessage('Supabase not configured')
      return
    }
    setCloudSyncStatus('syncing')
    setCloudSyncMessage('Fast syncing all changes to Cloud...')
    try {
      const currentDeleted: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_IDS) || "[]")
      await Promise.all([
        ...departments.map((d) => syncDepartmentToCloud(d)),
        ...laboratories.map((l) => syncLabToCloud(l)),
        ...experiments.map((e) => syncExperimentToCloud(e)),
        ...(currentDeleted.length > 0
          ? [
              supabase.from('experiments').delete().in('id', currentDeleted),
              supabase.from('laboratories').delete().in('id', currentDeleted),
              supabase.from('departments').delete().in('id', currentDeleted),
            ]
          : []),
      ])
      setCloudSyncStatus('synced')
      setCloudSyncMessage(`Fast-synced ${laboratories.length} labs & ${experiments.length} experiments`)
    } catch (err: any) {
      setCloudSyncStatus('offline')
      setCloudSyncMessage(`Sync failed: ${err?.message || 'Unknown error'}`)
    }
  }

  const userEmail = adminSessionEmail || 'student@vlab.edu.in'
  const userName = isAdminAuthenticated ? 'Administrator' : 'Student Visitor'

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

  const addDepartment = (dept: Department) => {
    setDepartments((prev) => [...prev, dept])
    syncDepartmentToCloud(dept)
  }
  const updateDepartment = (dept: Department) => {
    setDepartments((prev) => prev.map((d) => (d.id === dept.id ? dept : d)))
    syncDepartmentToCloud(dept)
  }
  const deleteDepartment = (id: string) => {
    setDeletedIds((prev) => Array.from(new Set([...prev, id])))
    setDepartments((prev) => prev.filter((d) => d.id !== id))
    if (supabase) supabase!.from('departments').delete().eq('id', id)
  }

  const addLaboratory = (lab: Laboratory) => {
    setLaboratories((prev) => [...prev, lab])
    syncLabToCloud(lab)
  }
  const updateLaboratory = (lab: Laboratory) => {
    setLaboratories((prev) => prev.map((l) => (l.id === lab.id ? lab : l)))
    syncLabToCloud(lab)
  }
  const deleteLaboratory = (id: string) => {
    setDeletedIds((prev) => Array.from(new Set([...prev, id])))
    setLaboratories((prev) => prev.filter((l) => l.id !== id))
    if (supabase) supabase!.from('laboratories').delete().eq('id', id)
  }

  const addExperiment = (exp: Experiment) => {
    setExperiments((prev) => [exp, ...prev])
    syncExperimentToCloud(exp)
  }
  const updateExperiment = (exp: Experiment) => {
    setExperiments((prev) => prev.map((e) => (e.id === exp.id ? exp : e)))
    syncExperimentToCloud(exp)
  }
  const deleteExperiment = (id: string) => {
    setDeletedIds((prev) => Array.from(new Set([...prev, id])))
    setExperiments((prev) => prev.filter((e) => e.id !== id))
    if (supabase) supabase!.from('experiments').delete().eq('id', id)
  }

  const resetToFactoryDefaults = () => {
    setDepartments(INITIAL_DEPARTMENTS)
    setLaboratories(INITIAL_LABORATORIES)
    setExperiments(INITIAL_EXPERIMENTS)
    localStorage.removeItem(STORAGE_KEYS.DEPT)
    localStorage.removeItem(STORAGE_KEYS.LABS)
    localStorage.removeItem(STORAGE_KEYS.EXPS)
  }

  return (
    <LabStoreContext.Provider
      value={{
        role,
        isAdminAuthenticated,
        loginAsAdmin,
        logoutAdmin,
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
        syncAllToCloud,
        supabaseConnected: isSupabaseConfigured,
        cloudSyncStatus,
        cloudSyncMessage,
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
