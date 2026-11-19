import React, { useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { z } from 'zod'
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  Eye,
  Save,
  Send,
  Box,
  Sliders,
  FileText,
  AlertCircle,
  ShieldAlert,
  Play,
  CheckSquare,
  Square,
} from 'lucide-react'
import { useLabStore } from '../context/LabStoreContext'
import { DEFAULT_SECTIONS_CONFIG } from '../data/initialData'
import type {
  Experiment,
  ModelPresetId,
  SimulationPresetId,
  DownloadableResource,
  ApparatusItem,
  EquationItem,
  VivaQuestion,
} from '../types/lab'
import {
  Card,
  Badge,
  Button,
  FormField,
  inputClassName,
} from '../components/ui/DesignSystem'
import { Engineering3DViewer } from '../components/viewer3d/Engineering3DViewer'
import { VirtualLabSimulator } from '../components/simulation/VirtualLabSimulator'
import { cn } from '../lib/utils'

const Step1Schema = z.object({
  departmentId: z.string().min(1, 'Please select an engineering department'),
  labId: z.string().min(1, 'Please select or enter a laboratory'),
  experimentNumber: z.string().min(2, 'Experiment number is required (e.g., EXP-05)'),
  code: z.string().min(2, 'Course/Experiment code is required (e.g., EEPC2201-EXP-05)'),
  title: z.string().min(5, 'Experiment title must be at least 5 characters'),
  summary: z.string().min(10, 'Short description must be at least 10 characters'),
})

const STEPS = [
  { id: 1, label: 'Step 1: Basic Info', short: '1. Basic Info' },
  { id: 2, label: 'Step 2: Learning Content', short: '2. Content' },
  { id: 3, label: 'Step 3: 3D Model & Simulation', short: '3. 3D & Sim' },
  { id: 4, label: 'Step 4: PDF, PPT & Resources', short: '4. Uploads' },
  { id: 5, label: 'Step 5: Preview & Publish', short: '5. Publish' },
]

export function CreateExperimentPage() {
  const { expSlug } = useParams()
  const navigate = useNavigate()
  const {
    role,
    setRole,
    userName,
    departments,
    laboratories,
    experiments,
    addLaboratory,
    addExperiment,
    updateExperiment,
  } = useLabStore()

  const existingExp = useMemo(
    () => (expSlug ? experiments.find((e) => e.slug === expSlug) : undefined),
    [expSlug, experiments]
  )

  const [step, setStep] = useState<number>(1)
  const [validationError, setValidationError] = useState<string>('')
  const [notice, setNotice] = useState<string>('')

  // Step 1 State
  const [departmentId, setDepartmentId] = useState<string>(
    existingExp?.departmentId || departments[0]?.id || 'dept-ee'
  )
  const deptLabs = laboratories.filter((l) => l.departmentId === departmentId)
  const [labId, setLabId] = useState<string>(
    existingExp?.labId || deptLabs[0]?.id || laboratories[0]?.id || 'lab-ee-em1'
  )
  const [customLabName, setCustomLabName] = useState<string>('')
  const [experimentNumber, setExperimentNumber] = useState<string>(
    existingExp?.experimentNumber || 'EXP-05'
  )
  const [code, setCode] = useState<string>(existingExp?.code || 'EEPC-EXP-05')
  const [title, setTitle] = useState<string>(existingExp?.title || '')
  const [summary, setSummary] = useState<string>(existingExp?.summary || '')
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    existingExp?.difficulty || 'Intermediate'
  )
  const [semester, setSemester] = useState<number>(existingExp?.semester || 3)
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(
    existingExp?.estimatedMinutes || 120
  )
  const [objectivesText, setObjectivesText] = useState<string>(
    existingExp?.objectives.join('\n') ||
      'Verify theoretical characteristics using the virtual simulator.\nInspect internal 3D sub-assemblies and cutaway views.'
  )

  // Step 2 State: Structured Learning Content
  const [aim, setAim] = useState<string>(
    existingExp?.aim || 'To study and experimentally verify the operating characteristics.'
  )
  const [learningOutcomesText, setLearningOutcomesText] = useState<string>(
    existingExp?.learningOutcomes.join('\n') ||
      'CO1: Connect and operate the laboratory test bench safely.\nCO2: Plot characteristic curves and evaluate performance metrics.'
  )
  const [apparatus, setApparatus] = useState<ApparatusItem[]>(
    existingExp?.apparatus || [
      { name: 'Primary Machine / Circuit Assembly', specification: '220V / Standard Rating', quantity: 1 },
      { name: 'Digital Voltmeter & Ammeter', specification: '0–300V, 0–20A', quantity: 2 },
    ]
  )
  const [theory, setTheory] = useState<string>(
    existingExp?.theory ||
      'Enter the complete analytical engineering derivation, physical principles, and operating regions for this experiment.'
  )
  const [equations, setEquations] = useState<EquationItem[]>(
    existingExp?.equations || [
      {
        label: 'Fundamental Governing Equation',
        formula: 'E_b = V_a - I_a · R_a   [Volts]',
        variables: 'V_a = Applied Voltage (V), I_a = Current (A), R_a = Resistance (Ω)',
      },
    ]
  )
  const [circuitDiagramSvgType, setCircuitDiagramSvgType] = useState<
    'dc-shunt' | 'series-rlc' | 'thevenin' | 'pump-loop' | 'digital-logic'
  >(existingExp?.circuitDiagramSvgType || 'dc-shunt')
  const [circuitDiagramDescription, setCircuitDiagramDescription] = useState<string>(
    existingExp?.circuitDiagramDescription ||
      'Standard laboratory circuit schematic with supply, rheostats, and instrumentation.'
  )
  const [procedureText, setProcedureText] = useState<string>(
    existingExp?.procedure.join('\n') ||
      '1. Verify all circuit connections according to the schematic diagram.\n2. Energize the workbench and vary the control parameters in steps.\n3. Record instrument readings in the observation table and plot the graph.'
  )
  const [sampleCalculations, setSampleCalculations] = useState<string>(
    existingExp?.sampleCalculations ||
      'At Rated Operating Point:\n• Input = 220 V, Current = 5.0 A\n• Efficiency η = (Output / Input) × 100%'
  )
  const [resultsTemplate, setResultsTemplate] = useState<string>(
    existingExp?.resultsTemplate ||
      'The experimental characteristics were verified and matched theoretical predictions within permissible limits.'
  )
  const [precautionsText, setPrecautionsText] = useState<string>(
    existingExp?.precautions.join('\n') ||
      'Ensure all connections are tight before switching on the supply.\nDo not exceed rated voltage or current ratings.'
  )
  const [vivaQuestions, setVivaQuestions] = useState<VivaQuestion[]>(
    existingExp?.vivaQuestions || [
      {
        id: 'vq-1',
        question: 'What is the physical significance of this experiment?',
        answer: 'It validates the mathematical relationship between excitation, load, and output response under real operating constraints.',
      },
    ]
  )
  const [referencesText, setReferencesText] = useState<string>(
    existingExp?.references.join('\n') ||
      '1. Standard B.Tech Engineering Laboratory Curriculum Manual.\n2. IEEE / NPTEL Virtual Laboratory Reference Texts.'
  )

  // Step 3 State: 3D Model & Simulation (Wireframe Panel 3 Checkboxes + Safe Config + Live Preview)
  const [has3dModel, setHas3dModel] = useState<boolean>(existingExp?.has3dModel ?? true)
  const [model3dPreset, setModel3dPreset] = useState<ModelPresetId>(
    existingExp?.model3dPreset || 'dc-shunt-motor'
  )
  const [customGlbUrl, setCustomGlbUrl] = useState<string>(existingExp?.customGlbUrl || '')
  const [hasSimulation, setHasSimulation] = useState<boolean>(existingExp?.hasSimulation ?? true)
  const [simulationPreset, setSimulationPreset] = useState<SimulationPresetId>(
    existingExp?.simulationPreset || 'dc-motor-speed-control'
  )
  const [previewTab, setPreviewTab] = useState<'3d' | 'sim'>('3d')

  // Step 4 State: PDF, PPT & Resource Uploads (Wireframe Panel 3 Checkbox + Import + Validation)
  const [hasDocuments, setHasDocuments] = useState<boolean>(true)
  const [downloads, setDownloads] = useState<DownloadableResource[]>(
    existingExp?.downloads || [
      {
        id: 'dl-init-1',
        title: 'Official Laboratory Manual & Observation Sheet (.PDF)',
        fileType: 'PDF',
        fileSize: '1.2 MB',
        url: '#lab-manual-pdf',
        requiresAuth: false,
      },
    ]
  )
  const [uploadError, setUploadError] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  // Role Permission Guard
  if (role === 'student') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Instructor or Administrator Permission Required
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          You are currently signed in as a <strong>Student</strong>. Only authorized Instructors and Administrators can create or publish laboratory experiments.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="primary" onClick={() => setRole('instructor')}>
            Switch to Instructor Role
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  const validateAndAdvance = (targetStep: number) => {
    setValidationError('')
    if (targetStep > 1) {
      const effectiveLabId = customLabName.trim() ? 'new-lab' : labId
      const parsed = Step1Schema.safeParse({
        departmentId,
        labId: effectiveLabId,
        experimentNumber: experimentNumber.trim(),
        code: code.trim(),
        title: title.trim(),
        summary: summary.trim(),
      })
      if (!parsed.success) {
        setValidationError(parsed.error.issues[0].message)
        setStep(1)
        return
      }
    }
    setStep(targetStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Validated File Selection from iPad Files / Safari
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('')
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toUpperCase() || ''
    const allowed = ['PDF', 'PPT', 'PPTX', 'GLB', 'GLTF', 'PNG', 'JPG', 'JPEG', 'DOCX', 'ZIP']
    if (!allowed.includes(ext)) {
      setUploadError(
        `Unsupported file format ".${ext}". Allowed formats: PDF, PPTX, GLB/GLTF, PNG/JPG, DOCX, ZIP.`
      )
      return
    }

    const maxBytes = 25 * 1024 * 1024 // 25 MB validation
    if (file.size > maxBytes) {
      setUploadError('File exceeds 25 MB maximum upload limit.')
      return
    }

    setUploadProgress(35)
    setTimeout(() => setUploadProgress(80), 180)
    setTimeout(() => {
      setUploadProgress(100)
      const mappedType: DownloadableResource['fileType'] =
        ext === 'PPT' || ext === 'PPTX'
          ? 'PPTX'
          : ext === 'GLB' || ext === 'GLTF'
          ? 'GLB'
          : ext === 'PNG' || ext === 'JPG' || ext === 'JPEG'
          ? 'IMAGE'
          : ext === 'DOCX'
          ? 'DOCX'
          : 'PDF'

      const sizeMB =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${Math.max(12, Math.round(file.size / 1024))} KB`

      const newDoc: DownloadableResource = {
        id: `dl-${Date.now()}`,
        title: file.name,
        fileType: mappedType,
        fileSize: sizeMB,
        url: URL.createObjectURL(file),
        requiresAuth: true,
        uploadedAt: new Date().toISOString().slice(0, 10),
      }
      setDownloads((prev) => [...prev, newDoc])
      if (mappedType === 'GLB') {
        setCustomGlbUrl(file.name)
      }
    }, 350)
  }

  const buildExperimentObject = (status: 'published' | 'draft'): Experiment => {
    let finalLabId = labId
    if (customLabName.trim()) {
      const createdLabId = `lab-${Date.now()}`
      addLaboratory({
        id: createdLabId,
        slug: customLabName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        code: code.split('-')[0] || 'LAB-101',
        name: customLabName.trim(),
        departmentId,
        semester,
        description: `Curriculum laboratory for ${customLabName.trim()}.`,
        incharge: userName,
        roomNumber: 'Academic Lab Complex',
        equipmentHighlights: apparatus.map((a) => a.name).slice(0, 3),
        featured: true,
        published: true,
      })
      finalLabId = createdLabId
    }

    const slug =
      existingExp?.slug ||
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      `experiment-${Date.now()}`

    return {
      id: existingExp?.id || `exp-${Date.now()}`,
      slug,
      code: code.trim().toUpperCase(),
      experimentNumber: experimentNumber.trim().toUpperCase(),
      title: title.trim(),
      labId: finalLabId,
      departmentId,
      semester,
      difficulty,
      estimatedMinutes,
      published: status === 'published',
      status,
      viewsCount: existingExp?.viewsCount || 1,
      createdAt: existingExp?.createdAt || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      authorName: userName,
      authorRole: role,
      topics: [experimentNumber.trim(), code.trim(), difficulty],
      summary: summary.trim(),
      aim: aim.trim(),
      objectives: objectivesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      learningOutcomes: learningOutcomesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      apparatus,
      theory,
      equations,
      circuitDiagramSvgType,
      circuitDiagramDescription,
      has3dModel,
      model3dPreset,
      customGlbUrl: customGlbUrl.trim() || undefined,
      hasSimulation,
      simulationPreset,
      procedure: procedureText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      sampleCalculations,
      resultsTemplate,
      precautions: precautionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      vivaQuestions,
      references: referencesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      downloads: hasDocuments ? downloads : [],
      sectionsConfig: existingExp?.sectionsConfig || DEFAULT_SECTIONS_CONFIG,
    }
  }

  const handleSave = (status: 'published' | 'draft') => {
    const parsed = Step1Schema.safeParse({
      departmentId,
      labId: customLabName.trim() ? 'new-lab' : labId,
      experimentNumber: experimentNumber.trim(),
      code: code.trim(),
      title: title.trim(),
      summary: summary.trim(),
    })
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0].message)
      setStep(1)
      return
    }

    const expObj = buildExperimentObject(status)
    if (existingExp) {
      updateExperiment(expObj)
    } else {
      addExperiment(expObj)
    }

    if (status === 'draft') {
      setNotice('Saved as Draft! You can resume editing anytime from My Contributions.')
    } else {
      navigate(`/experiment/${expObj.slug}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-xs font-semibold text-teal-700 hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
            </Link>
            <Badge tone="teal">Experiment Creation Studio</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {existingExp ? `Edit Experiment: ${existingExp.title}` : 'Create New Laboratory Experiment'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave('draft')}>
            <Save className="w-4 h-4" /> Save as Draft
          </Button>
          <Button variant="primary" size="sm" onClick={() => validateAndAdvance(5)}>
            <Eye className="w-4 h-4" /> Preview &amp; Publish
          </Button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {STEPS.map((s) => {
          const active = step === s.id
          const completed = step > s.id
          return (
            <button
              key={s.id}
              onClick={() => validateAndAdvance(s.id)}
              className={cn(
                'py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                active
                  ? 'bg-teal-700 text-white shadow-xs'
                  : completed
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              )}
            >
              {completed && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
              <span className="truncate">{s.short}</span>
            </button>
          )
        })}
      </div>

      {/* Validation or Save Notice */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-center gap-2.5 font-medium">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {notice && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs sm:text-sm text-teal-900 flex items-center justify-between gap-2.5 font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />
            {notice}
          </span>
          <Link to="/contributions" className="text-xs font-bold underline">
            View My Contributions
          </Link>
        </div>
      )}

      {/* STEP 1: BASIC INFORMATION (Matches Wireframe Top Fields: Lab Name, Experiment Number, Experiment Name) */}
      {step === 1 && (
        <Card className="p-6 sm:p-8 space-y-6 border-2 border-teal-600/20">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Step 1: Basic Experiment Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Define the department, laboratory name, experiment number, and core learning objectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Engineering Department" required>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value)
                  const firstLab = laboratories.find((l) => l.departmentId === e.target.value)
                  if (firstLab) setLabId(firstLab.id)
                }}
                className={inputClassName}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Laboratory Name"
              hint="Select an existing laboratory or type a new Lab Name below"
              required
            >
              <select
                value={labId}
                onChange={(e) => setLabId(e.target.value)}
                className={inputClassName}
              >
                {deptLabs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.code})
                  </option>
                ))}
                {deptLabs.length === 0 && (
                  <option value="">No existing lab in this department — type below</option>
                )}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormField
              label="Or Create New Lab Name (Optional)"
              hint="Leave blank to use the selected laboratory above"
            >
              <input
                type="text"
                value={customLabName}
                onChange={(e) => setCustomLabName(e.target.value)}
                placeholder="e.g., Power Systems Lab"
                className={inputClassName}
              />
            </FormField>

            <FormField label="Experiment Number" required>
              <input
                type="text"
                value={experimentNumber}
                onChange={(e) => setExperimentNumber(e.target.value)}
                placeholder="e.g., EXP-05"
                className={inputClassName}
              />
            </FormField>

            <FormField label="Course / Experiment Code" required>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., EEPC2201-EXP-05"
                className={inputClassName}
              />
            </FormField>
          </div>

          <FormField label="Experiment Name / Title" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Verification of Thevenin's & Maximum Power Transfer Theorem"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Short Description / Executive Overview" required>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summarize what students will investigate, visualize in 3D, and simulate..."
              className={inputClassName}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FormField label="Difficulty Level">
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')
                }
                className={inputClassName}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </FormField>

            <FormField label="Target Semester">
              <input
                type="number"
                min={1}
                max={8}
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className={inputClassName}
              />
            </FormField>

            <FormField label="Duration (Minutes)">
              <input
                type="number"
                min={30}
                max={240}
                step={15}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className={inputClassName}
              />
            </FormField>
          </div>

          <FormField
            label="Learning Objectives (One per line)"
            hint="Each line becomes a bulleted objective on the experiment page"
          >
            <textarea
              rows={3}
              value={objectivesText}
              onChange={(e) => setObjectivesText(e.target.value)}
              className={inputClassName}
            />
          </FormField>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <Button variant="primary" onClick={() => validateAndAdvance(2)}>
              Continue to Step 2: Learning Content <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: STRUCTURED LEARNING CONTENT EDITOR */}
      {step === 2 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Step 2: Structured Learning Content Editor
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure Aim, Apparatus, Theory, Mathematical Equations, Circuit Schematic, Procedure, Calculations, Precautions, and Viva Questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Aim of the Experiment" required>
              <textarea
                rows={3}
                value={aim}
                onChange={(e) => setAim(e.target.value)}
                className={inputClassName}
              />
            </FormField>

            <FormField label="Course Learning Outcomes (One per line)">
              <textarea
                rows={3}
                value={learningOutcomesText}
                onChange={(e) => setLearningOutcomesText(e.target.value)}
                className={inputClassName}
              />
            </FormField>
          </div>

          {/* Dynamic Apparatus Table Editor */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Apparatus &amp; Instruments Required
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setApparatus([
                    ...apparatus,
                    { name: 'New Instrument', specification: 'Standard Range', quantity: 1 },
                  ])
                }
              >
                <Plus className="w-3.5 h-3.5" /> Add Instrument
              </Button>
            </div>
            <div className="space-y-2">
              {apparatus.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const next = [...apparatus]
                      next[idx].name = e.target.value
                      setApparatus(next)
                    }}
                    placeholder="Instrument Name"
                    className={cn(inputClassName, 'sm:col-span-5')}
                  />
                  <input
                    type="text"
                    value={item.specification}
                    onChange={(e) => {
                      const next = [...apparatus]
                      next[idx].specification = e.target.value
                      setApparatus(next)
                    }}
                    placeholder="Rated Specification"
                    className={cn(inputClassName, 'sm:col-span-5')}
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const next = [...apparatus]
                      next[idx].quantity = Number(e.target.value)
                      setApparatus(next)
                    }}
                    className={cn(inputClassName, 'sm:col-span-1 text-center')}
                  />
                  <button
                    type="button"
                    onClick={() => setApparatus(apparatus.filter((_, i) => i !== idx))}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 sm:col-span-1 flex justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <FormField label="Engineering Theory & Analytical Derivation">
            <textarea
              rows={6}
              value={theory}
              onChange={(e) => setTheory(e.target.value)}
              className={inputClassName}
            />
          </FormField>

          {/* Dynamic Mathematical Equations Editor */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Mathematical Equations (SI Units)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setEquations([
                    ...equations,
                    { label: 'Equation Name', formula: 'Y = m · X', variables: 'Define variables' },
                  ])
                }
              >
                <Plus className="w-3.5 h-3.5" /> Add Equation
              </Button>
            </div>
            <div className="space-y-2.5">
              {equations.map((eq, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={eq.label}
                    onChange={(e) => {
                      const next = [...equations]
                      next[idx].label = e.target.value
                      setEquations(next)
                    }}
                    placeholder="Label"
                    className={cn(inputClassName, 'sm:col-span-3')}
                  />
                  <input
                    type="text"
                    value={eq.formula}
                    onChange={(e) => {
                      const next = [...equations]
                      next[idx].formula = e.target.value
                      setEquations(next)
                    }}
                    placeholder="Formula"
                    className={cn(inputClassName, 'sm:col-span-4 font-mono')}
                  />
                  <input
                    type="text"
                    value={eq.variables}
                    onChange={(e) => {
                      const next = [...equations]
                      next[idx].variables = e.target.value
                      setEquations(next)
                    }}
                    placeholder="Variables & Units"
                    className={cn(inputClassName, 'sm:col-span-4')}
                  />
                  <button
                    type="button"
                    onClick={() => setEquations(equations.filter((_, i) => i !== idx))}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 sm:col-span-1 flex justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Circuit / Workbench Schematic Type">
              <select
                value={circuitDiagramSvgType}
                onChange={(e) => setCircuitDiagramSvgType(e.target.value as any)}
                className={inputClassName}
              >
                <option value="dc-shunt">DC Shunt Motor &amp; 3-Point Starter Schematic</option>
                <option value="series-rlc">Series R-L-C &amp; Dual-Channel CRO Schematic</option>
                <option value="thevenin">Linear Bilateral Network / Thevenin Bridge</option>
                <option value="pump-loop">Closed-Loop Centrifugal Pump Hydraulic Rig</option>
                <option value="digital-logic">TTL 74xx Digital IC Logic Trainer</option>
              </select>
            </FormField>

            <FormField label="Schematic Diagram Caption / Description">
              <input
                type="text"
                value={circuitDiagramDescription}
                onChange={(e) => setCircuitDiagramDescription(e.target.value)}
                className={inputClassName}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Step-by-Step Procedure (One step per line)">
              <textarea
                rows={4}
                value={procedureText}
                onChange={(e) => setProcedureText(e.target.value)}
                className={inputClassName}
              />
            </FormField>

            <FormField label="Sample Engineering Calculations">
              <textarea
                rows={4}
                value={sampleCalculations}
                onChange={(e) => setSampleCalculations(e.target.value)}
                className={cn(inputClassName, 'font-mono text-xs')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Results & Conclusion Summary">
              <textarea
                rows={3}
                value={resultsTemplate}
                onChange={(e) => setResultsTemplate(e.target.value)}
                className={inputClassName}
              />
            </FormField>

            <FormField label="Safety & Laboratory Precautions (One per line)">
              <textarea
                rows={3}
                value={precautionsText}
                onChange={(e) => setPrecautionsText(e.target.value)}
                className={inputClassName}
              />
            </FormField>
          </div>

          {/* Viva Questions Editor */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Viva-Voce Questions &amp; Answers
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setVivaQuestions([
                    ...vivaQuestions,
                    { id: `vq-${Date.now()}`, question: 'New Viva Question?', answer: 'Model Answer.' },
                  ])
                }
              >
                <Plus className="w-3.5 h-3.5" /> Add Viva Q&amp;A
              </Button>
            </div>
            <div className="space-y-2.5">
              {vivaQuestions.map((vq, idx) => (
                <div key={vq.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                  <input
                    type="text"
                    value={vq.question}
                    onChange={(e) => {
                      const next = [...vivaQuestions]
                      next[idx].question = e.target.value
                      setVivaQuestions(next)
                    }}
                    placeholder="Question"
                    className={cn(inputClassName, 'sm:col-span-5')}
                  />
                  <input
                    type="text"
                    value={vq.answer}
                    onChange={(e) => {
                      const next = [...vivaQuestions]
                      next[idx].answer = e.target.value
                      setVivaQuestions(next)
                    }}
                    placeholder="Model Answer"
                    className={cn(inputClassName, 'sm:col-span-6')}
                  />
                  <button
                    type="button"
                    onClick={() => setVivaQuestions(vivaQuestions.filter((_, i) => i !== idx))}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 sm:col-span-1 flex justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <FormField label="Standard Textbooks & References (One per line)">
            <textarea
              rows={2}
              value={referencesText}
              onChange={(e) => setReferencesText(e.target.value)}
              className={inputClassName}
            />
          </FormField>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4" /> Back to Step 1
            </Button>
            <Button variant="primary" onClick={() => validateAndAdvance(3)}>
              Continue to Step 3: 3D Model &amp; Simulation <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: 3D MODEL & SIMULATION (Directly Honors Wireframe Panel 3: Yes/No Toggles + Safe Integration Box + Live Preview Box) */}
      {step === 3 && (
        <Card className="p-6 sm:p-8 space-y-6 border-2 border-teal-600/20">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Step 3: Interactive 3D Model &amp; Virtual Simulation Studio
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select validated 3D CAD assemblies, upload .GLB/.GLTF files, configure the simulation engine, and inspect the live preview side by side.
            </p>
          </div>

          {/* Yes / No Toggles (From Wireframe: "Have any 3D model or not [x] Yes [ ] No") */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Include Interactive 3D Model?
                </div>
                <div className="text-xs text-slate-500">
                  Enables 360° orbit, exploded assembly, and stator cutaway
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHas3dModel(true)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer',
                    has3dModel
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-600 border-slate-300'
                  )}
                >
                  {has3dModel ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setHas3dModel(false)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer',
                    !has3dModel
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-300'
                  )}
                >
                  {!has3dModel ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  No
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Include Virtual Lab Simulation?
                </div>
                <div className="text-xs text-slate-500">
                  Enables real-time SI-unit solver, graphs, and observation table
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHasSimulation(true)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer',
                    hasSimulation
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-600 border-slate-300'
                  )}
                >
                  {hasSimulation ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setHasSimulation(false)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer',
                    !hasSimulation
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-300'
                  )}
                >
                  {!hasSimulation ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Wireframe Two-Column Layout: Left Configuration Box + Right Live Preview Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Validated 3D & Simulation Configuration */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Validated 3D &amp; Simulation Configuration
              </div>

              {has3dModel && (
                <div className="space-y-4">
                  <FormField
                    label="Approved Three.js 3D Engineering Assembly"
                    hint="Secure, touch-optimized procedural & CAD assembly viewer"
                  >
                    <select
                      value={model3dPreset}
                      onChange={(e) => setModel3dPreset(e.target.value as ModelPresetId)}
                      className={inputClassName}
                    >
                      <option value="dc-shunt-motor">4-Pole DC Shunt Motor (Cutaway &amp; Exploded)</option>
                      <option value="rlc-workbench">Series R-L-C &amp; Dual-Channel DSO Workbench</option>
                      <option value="centrifugal-pump">Single-Stage Volute Centrifugal Pump</option>
                      <option value="three-phase-induction">3-Phase Squirrel-Cage Induction Motor</option>
                      <option value="logic-gate-ic-trainer">74xx Digital IC Breadboard Trainer</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Optional Custom .GLB / .GLTF Model URL or Asset Name"
                    hint="Only validated .glb/.gltf 3D asset paths are accepted (arbitrary scripts are blocked)"
                  >
                    <input
                      type="text"
                      value={customGlbUrl}
                      onChange={(e) => setCustomGlbUrl(e.target.value)}
                      placeholder="https://cdn.vlab.edu.in/models/custom-machine.glb"
                      className={inputClassName}
                    />
                  </FormField>
                </div>
              )}

              {hasSimulation && (
                <FormField
                  label="Scientific Simulation Engine Profile"
                  hint="Computes real-time SI-unit equations, waveforms, and observation tables"
                >
                  <select
                    value={simulationPreset}
                    onChange={(e) => setSimulationPreset(e.target.value as SimulationPresetId)}
                    className={inputClassName}
                  >
                    <option value="dc-motor-speed-control">DC Shunt Motor Speed &amp; Flux Solver</option>
                    <option value="series-rlc-resonance">Series R-L-C Frequency Response Solver</option>
                    <option value="bernoulli-flow-rig">Centrifugal Pump Head &amp; Efficiency Solver</option>
                  </select>
                </FormField>
              )}

              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-[11px] text-teal-900 leading-relaxed">
                <strong>Security Policy:</strong> Arbitrary user-pasted HTML/JavaScript is disabled to prevent XSS vulnerabilities. All 3D scenes and mathematical solvers run through validated React Three Fiber / Three.js modules.
              </div>
            </div>

            {/* Right Column: Live Interactive Preview Box (Matches Wireframe "Preview [Play]" Box) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Interactive Preview
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('3d')}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer',
                      previewTab === '3d'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    <Box className="w-3.5 h-3.5 inline mr-1" />
                    Preview 3D Model
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('sim')}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer',
                      previewTab === 'sim'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    <Sliders className="w-3.5 h-3.5 inline mr-1" />
                    Preview Simulator
                  </button>
                </div>
              </div>

              {previewTab === '3d' ? (
                has3dModel ? (
                  <Engineering3DViewer
                    preset={model3dPreset}
                    title={title || 'Live 3D Model Preview'}
                  />
                ) : (
                  <div className="py-16 text-center text-xs text-slate-500">
                    3D Model is toggled set to &ldquo;No&rdquo;. Toggle &ldquo;Yes&rdquo; above to preview.
                  </div>
                )
              ) : hasSimulation ? (
                <VirtualLabSimulator preset={simulationPreset} />
              ) : (
                <div className="py-16 text-center text-xs text-slate-500">
                  Virtual Simulation is toggled to &ldquo;No&rdquo;. Toggle &ldquo;Yes&rdquo; above to preview.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4" /> Back to Step 2
            </Button>
            <Button variant="primary" onClick={() => validateAndAdvance(4)}>
              Continue to Step 4: PDF &amp; PPT Uploads <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: PDF, PPT & RESOURCE UPLOADS (Matches Wireframe: "Have any PDF or PPT [x] Yes [ ] No  [Import]") */}
      {step === 4 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Step 4: PDF Manuals, PPTX Slides &amp; Supporting Documents
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Import laboratory manuals (.PDF), lecture slides (.PPTX), .GLB models, or reference images with automatic file validation.
              </p>
            </div>

            {/* Wireframe Yes/No Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 mr-1">Include PDF / PPT?</span>
              <button
                type="button"
                onClick={() => setHasDocuments(true)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 cursor-pointer',
                  hasDocuments
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-600 border-slate-300'
                )}
              >
                {hasDocuments ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                Yes
              </button>
              <button
                type="button"
                onClick={() => setHasDocuments(false)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 cursor-pointer',
                  !hasDocuments
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-300'
                )}
              >
                {!hasDocuments ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                No
              </button>
            </div>
          </div>

          {hasDocuments && (
            <div className="space-y-6">
              {/* iPad Touch File Import Box */}
              <div className="border-2 border-dashed border-teal-600/40 bg-teal-50/30 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-700/10 text-teal-700 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Import PDF Manuals, PPT/PPTX Presentations, or .GLB Assets
                  </h3>
                  <p className="text-xs text-slate-500">
                    Validated formats: .PDF, .PPTX, .GLB, .PNG, .JPG, .DOCX (Max 25 MB per file)
                  </p>
                </div>

                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Tap to Import File from iPad</span>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.glb,.gltf,.png,.jpg,.jpeg,.docx,.zip"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="max-w-xs mx-auto pt-2 space-y-1">
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-teal-600 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-teal-800 font-medium">
                      Validating &amp; attaching resource ({uploadProgress}%)...
                    </p>
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs font-semibold text-rose-600 pt-1">{uploadError}</p>
                )}
              </div>

              {/* Attached Files List with Replace / Remove Controls */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Attached Educational Resources ({downloads.length})
                </h3>
                {downloads.map((dl) => (
                  <div
                    key={dl.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-700 font-mono text-xs font-bold">
                        {dl.fileType}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{dl.title}</div>
                        <div className="text-xs text-slate-500">
                          Size: {dl.fileSize} • Status: Verified &amp; Ready
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDownloads(
                            downloads.map((d) =>
                              d.id === dl.id ? { ...d, requiresAuth: !d.requiresAuth } : d
                            )
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        {dl.requiresAuth ? 'Protected (Student Login)' : 'Public Download'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDownloads(downloads.filter((d) => d.id !== dl.id))}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4" /> Back to Step 3
            </Button>
            <Button variant="primary" onClick={() => validateAndAdvance(5)}>
              Continue to Step 5: Complete Preview &amp; Publish <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: COMPLETE PREVIEW & PUBLISH */}
      {step === 5 && (
        <div className="space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 border-2 border-teal-600/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <Badge tone="teal">Step 5 • Final Verification</Badge>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Complete Experiment Preview Before Publishing
                </h2>
                <p className="text-xs text-slate-500">
                  Review your experiment details, 3D model, simulator, and attached documents below.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={() => handleSave('draft')}>
                  <Save className="w-4 h-4" /> Save as Draft
                </Button>
                <Button variant="primary" onClick={() => handleSave('published')}>
                  <Send className="w-4 h-4" /> Publish Experiment Now
                </Button>
              </div>
            </div>

            {/* Summary Preview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge mono tone="sky">{code}</Badge>
                <Badge mono tone="slate">{experimentNumber}</Badge>
                <Badge tone="teal">{difficulty}</Badge>
                <Badge tone="slate">Semester {semester}</Badge>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {title || 'Untitled Experiment'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold uppercase text-slate-400 mb-1">Aim</div>
                  <p className="text-xs text-slate-800 leading-relaxed">{aim}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold uppercase text-slate-400 mb-1">
                    Attached Modules
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                    <span>3D Model: {has3dModel ? model3dPreset : 'Disabled'}</span>
                    <span>•</span>
                    <span>Simulator: {hasSimulation ? simulationPreset : 'Disabled'}</span>
                    <span>•</span>
                    <span>Files: {hasDocuments ? downloads.length : 0} attached</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Embedded 3D & Simulator Preview */}
            {has3dModel && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-teal-700" /> Interactive 3D Assembly Preview
                </h4>
                <Engineering3DViewer preset={model3dPreset} title={title || 'Preview'} />
              </div>
            )}

            {hasSimulation && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-sky-700" /> Virtual Laboratory Simulator Preview
                </h4>
                <VirtualLabSimulator preset={simulationPreset} />
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(4)}>
                <ArrowLeft className="w-4 h-4" /> Back to Step 4
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => handleSave('draft')}>
                  <Save className="w-4 h-4" /> Save as Draft
                </Button>
                <Button variant="primary" size="lg" onClick={() => handleSave('published')}>
                  <Send className="w-4 h-4" /> Confirm &amp; Publish to Library
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
