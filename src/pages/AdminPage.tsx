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
} from 'lucide-react'
import { useLabStore } from '../context/LabStoreContext'
import {
  Card,
  Badge,
  Button,
  FormField,
  inputClassName,
} from '../components/ui/DesignSystem'

export function AdminPage() {
  const {
    role,
    setRole,
    departments,
    laboratories,
    experiments,
    addDepartment,
    deleteDepartment,
    addLaboratory,
    deleteLaboratory,
    deleteExperiment,
    resetToFactoryDefaults,
  } = useLabStore()

  const [statusBanner, setStatusBanner] = useState<string>('')
  const [deptName, setDeptName] = useState('')
  const [deptCode, setDeptCode] = useState('')
  const [deptDesc, setDeptDesc] = useState('')

  const [labName, setLabName] = useState('')
  const [labCode, setLabCode] = useState('')
  const [labDeptId, setLabDeptId] = useState(departments[0]?.id || 'dept-ee')
  const [labSem, setLabSem] = useState(3)
  const [labRoom, setLabRoom] = useState('Academic Lab Complex - Room 202')

  if (role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Administrator Panel Access
        </h1>
        <p className="text-sm text-slate-600">
          You are currently viewing the platform as <strong className="uppercase">{role}</strong>. Switch to the <strong>Admin</strong> role to manage departments, laboratories, and system settings.
        </p>
        <Button variant="primary" onClick={() => setRole('admin')}>
          Switch to Administrator Role
        </Button>
      </div>
    )
  }

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName.trim() || !deptCode.trim()) return
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
    setStatusBanner(`Added department "${deptName}"!`)
  }

  const handleCreateLab = (e: React.FormEvent) => {
    e.preventDefault()
    if (!labName.trim() || !labCode.trim()) return
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
    setStatusBanner(`Added laboratory "${labName}"!`)
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
                  onClick={() => deleteDepartment(d.id)}
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
                  onClick={() => deleteLaboratory(l.id)}
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
                  onClick={() => deleteExperiment(exp.id)}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
