import { StudentApprovalsPanel } from '../components/admin/StudentApprovalsPanel'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Building2,
  FlaskConical,
  BookOpen,
  Edit3,
  Code2,
  Upload,
  Database,
} from 'lucide-react'
import { useLabStore } from '../context/LabStoreContext'
import { AdminLoginCard } from '../components/auth/AdminLoginCard'
import {
  Card,
  Badge,
  Button,
  FormField,
  inputClassName,
} from '../components/ui/DesignSystem'

export function AdminPage() {
  const {
    isAdminAuthenticated,
    departments,
    laboratories,
    experiments,
    addDepartment,
    deleteDepartment,
    addLaboratory,
    deleteLaboratory,
    updateExperiment,
    deleteExperiment,
    resetToFactoryDefaults,
    cloudSyncMessage,
  } = useLabStore()

  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    message: string
    confirmLabel: string
    variant: 'danger' | 'primary'
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    variant: 'primary',
    onConfirm: () => {},
  })

  const [statusBanner, setStatusBanner] = useState<string>('')
  const [deptName, setDeptName] = useState('')
  const [deptCode, setDeptCode] = useState('')
  const [deptDesc, setDeptDesc] = useState('')

  const [labName, setLabName] = useState('')
  const [labCode, setLabCode] = useState('')
  const [labDeptId, setLabDeptId] = useState(departments[0]?.id || 'dept-ee')
  const [labSem, setLabSem] = useState(3)
  const [labRoom, setLabRoom] = useState('Academic Lab Complex - Room 202')
  const [targetExpId, setTargetExpId] = useState(experiments[0]?.id || '')
  const [quickHtmlTarget, setQuickHtmlTarget] = useState<'3d' | 'sim'>('3d')
  const [quickHtmlCode, setQuickHtmlCode] = useState('')

  const handleQuickHtmlAttach = (e: React.FormEvent) => {
    e.preventDefault()
    const targetExp = experiments.find((ex) => ex.id === targetExpId)
    if (!targetExp || !quickHtmlCode.trim()) return
    if (quickHtmlTarget === '3d') {
      updateExperiment({
        ...targetExp,
        has3dModel: true,
        model3dSource: 'custom_html',
        customModelHtml: quickHtmlCode.trim(),
        updatedAt: new Date().toISOString().slice(0, 10),
      })
      setStatusBanner(`Uploaded HTML 3D Model to "${targetExp.title}" & synced to Supabase!`)
    } else {
      updateExperiment({
        ...targetExp,
        hasSimulation: true,
        simulationSource: 'custom_html',
        customSimulationHtml: quickHtmlCode.trim(),
        updatedAt: new Date().toISOString().slice(0, 10),
      })
      setStatusBanner(`Uploaded HTML Virtual Lab to "${targetExp.title}" & synced to Supabase!`)
    }
    setQuickHtmlCode('')
  }

  const handleQuickHtmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setQuickHtmlCode(reader.result)
    }
    reader.readAsText(file)
  }

  if (!isAdminAuthenticated) {
    return (
      <AdminLoginCard
        title="Admin Console Sign In"
        subtitle="Enter your Administrator email and password to manage engineering departments, laboratories, and HTML virtual labs."
      />
    )
  }

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName.trim() || !deptCode.trim()) return
    const nameSnapshot = deptName.trim()
    const codeSnapshot = deptCode.toUpperCase()
    const descSnapshot = deptDesc.trim() || 'Accredited engineering department.'
    setConfirmState({
      open: true,
      title: 'Publish New Branch / Department?',
      message: `Create and publish "${nameSnapshot}" (${codeSnapshot}) to the Virtual Lab Library?`,
      confirmLabel: 'Publish Branch',
      variant: 'primary',
      onConfirm: () => {
        addDepartment({
      id: `dept-${Date.now()}`,
      slug: deptName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      code: deptCode.toUpperCase(),
      name: deptName.trim(),
      shortName: `${deptName.trim()} (${deptCode.toUpperCase()})`,
      description: deptDesc.trim() || 'Accredited engineering department.',
      iconName: 'Zap',
      accentColor: 'teal',
      published: true,
    })
    setDeptName('')
    setDeptCode('')
    setDeptDesc('')
    setStatusBanner(`Added department "${nameSnapshot}"!`)
    setConfirmState((s) => ({ ...s, open: false }))
      },
    })
  }

  const handleCreateLab = (e: React.FormEvent) => {
    e.preventDefault()
    if (!labName.trim() || !labCode.trim()) return
    const nameSnapshot = labName.trim()
    const codeSnapshot = labCode.toUpperCase()
    const deptSnapshot = labDeptId
    const semSnapshot = labSem
    const roomSnapshot = labRoom
    setConfirmState({
      open: true,
      title: 'Publish New Laboratory?',
      message: `Create and publish "${nameSnapshot}" (${codeSnapshot}) to the Virtual Lab Library?`,
      confirmLabel: 'Publish Lab',
      variant: 'primary',
      onConfirm: () => {
        addLaboratory({
      id: `lab-${Date.now()}`,
      slug: labName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      code: labCode.toUpperCase(),
      name: labName.trim(),
      departmentId: labDeptId,
      semester: labSem,
      description: `Accredited laboratory for ${labName.trim()}.`,
      incharge: 'Faculty Lab In-Charge',
      roomNumber: labRoom,
      equipmentHighlights: ['Standard Test Workbench', 'Digital Meters'],
      featured: true,
      published: true,
    })
    setLabName('')
    setLabCode('')
    setStatusBanner(`Added laboratory "${nameSnapshot}"!`)
    setConfirmState((s) => ({ ...s, open: false }))
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge tone="teal">Administrator Console</Badge>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Platform Administration &amp; Curriculum Structure
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage engineering departments, laboratories, and published/draft experiments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/create">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" /> Create Experiment
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetToFactoryDefaults()
              setStatusBanner('Restored factory default departments, laboratories, and experiments.')
            }}
          >
            <RotateCcw className="w-4 h-4" /> Reset Defaults
          </Button>
        </div>
      </Card>

      {statusBanner && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs sm:text-sm text-teal-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
          <span>{statusBanner}</span>
        </div>
      )}

      <StudentApprovalsPanel />

      {/* Quick Upload 3D Model / Virtual Lab by HTML Code (Synced to Supabase) */}
      <Card className="p-6 space-y-4 border-2 border-teal-600/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-teal-700" />
              Quick Upload 3D Model / Virtual Lab by HTML Code
            </h2>
            <p className="text-xs text-slate-500">
              Attach a standalone HTML/Three.js 3D model or simulation directly to any existing experiment and sync to Supabase Cloud.
            </p>
          </div>
          <Badge tone="teal">
            <Database className="w-3 h-3" /> {cloudSyncMessage}
          </Badge>
        </div>

        <form onSubmit={handleQuickHtmlAttach} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField label="Select Target Experiment" required>
                <select
                  value={targetExpId}
                  onChange={(e) => setTargetExpId(e.target.value)}
                  className={inputClassName}
                >
                  {experiments.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.code} — {ex.title}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Target Slot" required>
              <select
                value={quickHtmlTarget}
                onChange={(e) => setQuickHtmlTarget(e.target.value as '3d' | 'sim')}
                className={inputClassName}
              >
                <option value="3d">Interactive 3D Model Viewer</option>
                <option value="sim">Virtual Lab Simulation Viewer</option>
              </select>
            </FormField>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Import .HTML File from iPad
              <input
                type="file"
                accept=".html,.htm"
                onChange={handleQuickHtmlFile}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-500">or paste your full HTML code below:</span>
          </div>

          <textarea
            rows={6}
            required
            value={quickHtmlCode}
            onChange={(e) => setQuickHtmlCode(e.target.value)}
            placeholder="<!DOCTYPE html><html>...paste your Three.js 3D model or Virtual Lab HTML code here...</html>"
            className={`${inputClassName} font-mono text-xs`}
          />

          <Button type="submit" variant="primary" size="md">
            <Upload className="w-4 h-4" /> Save &amp; Sync HTML Model to Supabase
          </Button>
        </form>
      </Card>

      {/* Departments & Laboratories Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Department */}
        <Card className="p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-700" />
            Manage Departments ({departments.length})
          </h2>

          <form onSubmit={handleCreateDept} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <FormField label="Department Name" required>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g., Aerospace Engineering"
                    className={inputClassName}
                  />
                </FormField>
              </div>
              <FormField label="Code" required>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="AE"
                  className={inputClassName}
                />
              </FormField>
            </div>
            <FormField label="Description">
              <input
                type="text"
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                placeholder="Aerodynamics, propulsion, and flight systems..."
                className={inputClassName}
              />
            </FormField>
            <Button type="submit" variant="primary" size="sm" className="w-full">
              <Plus className="w-4 h-4" /> Add Department
            </Button>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {departments.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900">{d.name}</span>{' '}
                  <Badge mono tone="slate">{d.code}</Badge>
                </div>
                <button
                  onClick={() =>
                    setConfirmState({
                      open: true,
                      title: 'Delete Branch / Department?',
                      message: `Are you sure you want to delete "${d.name}" (${d.code})? Tap Sync afterwards to update the public site across all devices.`,
                      confirmLabel: 'Delete Branch',
                      variant: 'danger',
                      onConfirm: () => {
                        deleteDepartment(d.id)
                        setConfirmState((s) => ({ ...s, open: false }))
                      },
                    })
                  }
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Delete Department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Add Laboratory */}
        <Card className="p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-sky-700" />
            Manage Laboratories ({laboratories.length})
          </h2>

          <form onSubmit={handleCreateLab} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <FormField label="Department" required>
              <select
                value={labDeptId}
                onChange={(e) => setLabDeptId(e.target.value)}
                className={inputClassName}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <FormField label="Laboratory Name" required>
                  <input
                    type="text"
                    required
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    placeholder="e.g., Power Electronics Lab"
                    className={inputClassName}
                  />
                </FormField>
              </div>
              <FormField label="Lab Code" required>
                <input
                  type="text"
                  required
                  value={labCode}
                  onChange={(e) => setLabCode(e.target.value)}
                  placeholder="EEPC-402"
                  className={inputClassName}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Semester">
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={labSem}
                  onChange={(e) => setLabSem(Number(e.target.value))}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Room Location">
                <input
                  type="text"
                  value={labRoom}
                  onChange={(e) => setLabRoom(e.target.value)}
                  className={inputClassName}
                />
              </FormField>
            </div>

            <Button type="submit" variant="primary" size="sm" className="w-full">
              <Plus className="w-4 h-4" /> Add Laboratory
            </Button>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {laboratories.map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900">{l.name}</span>{' '}
                  <Badge mono tone="teal">{l.code}</Badge>
                </div>
                <button
                  onClick={() =>
                    setConfirmState({
                      open: true,
                      title: 'Delete Laboratory?',
                      message: `Are you sure you want to delete "${l.name}" (${l.code})? Tap Sync afterwards to update the public site across all devices.`,
                      confirmLabel: 'Delete Lab',
                      variant: 'danger',
                      onConfirm: () => {
                        deleteLaboratory(l.id)
                        setConfirmState((s) => ({ ...s, open: false }))
                      },
                    })
                  }
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Delete Laboratory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Experiments Inventory */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-700" />
            All Experiments Inventory ({experiments.length})
          </h2>
          <Link to="/create">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4" /> Open 5-Step Experiment Creator
            </Button>
          </Link>
        </div>

        <div className="space-y-2">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge mono tone="sky">{exp.code}</Badge>
                  <Badge mono tone="slate">{exp.experimentNumber}</Badge>
                  <Badge tone={exp.status === 'draft' ? 'amber' : 'teal'}>
                    {exp.status}
                  </Badge>
                </div>
                <div className="text-sm font-bold text-slate-900">{exp.title}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/edit/${exp.slug}`}>
                  <Button variant="outline" size="sm">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Button>
                </Link>
                <button
                  onClick={() =>
                    setConfirmState({
                      open: true,
                      title: 'Delete Experiment?',
                      message: `Are you sure you want to permanently delete "${exp.title}"?`,
                      confirmLabel: 'Delete Experiment',
                      variant: 'danger',
                      onConfirm: () => {
                        deleteExperiment(exp.id)
                        setConfirmState((s) => ({ ...s, open: false }))
                      },
                    })
                  }
                  className="p-2 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s) => ({ ...s, open: false }))}
      />
    </div>
  )
}