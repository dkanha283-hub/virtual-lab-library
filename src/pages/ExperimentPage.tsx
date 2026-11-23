import { getSavedStudentSession, isStudentAccessActive, refreshStudentSession, StudentAccount } from '../lib/studentAuth'
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  Cpu,
  Download,
  Lock,
  HelpCircle,
  AlertTriangle,
  FileText,
  Calculator,
  Compass,
  Bookmark,
  Box,
  Sliders,
  Layers,
  Edit3,
  Clock,
} from 'lucide-react'
import { useLabStore } from '../context/LabStoreContext'
import { Engineering3DViewer } from '../components/viewer3d/Engineering3DViewer'
import { SandboxedHtmlLabViewer } from '../components/viewer3d/SandboxedHtmlLabViewer'
import { VirtualLabSimulator } from '../components/simulation/VirtualLabSimulator'
import { Card, Badge, Button } from '../components/ui/DesignSystem'
import { cn } from '../lib/utils'

type LearningTab = 'all' | 'theory' | '3d_schematic' | 'simulation' | 'viva_downloads'

export function ExperimentPage() {
  const { expSlug } = useParams()
  const [studentSession, setStudentSession] = useState<StudentAccount | null>(() => getSavedStudentSession())
  useEffect(() => {
    refreshStudentSession().then((fresh) => {
      if (fresh) setStudentSession(fresh)
    })
  }, [])
  const {
    experiments,
    laboratories,
    departments,
    role,
    recordExperimentVisit,
    bookmarkedExperimentIds,
    toggleBookmarkExperiment,
    isAdminAuthenticated,
  } = useLabStore()

  const [activeTab, setActiveTab] = useState<LearningTab>('all')
  const [liveRpm, setLiveRpm] = useState<number>(1500)
  const [downloadNotice, setDownloadNotice] = useState<string>('')

  const exp = experiments.find((e) => e.slug === expSlug) || experiments[0]
  const lab = laboratories.find((l) => l.id === exp?.labId)
  const dept = departments.find((d) => d.id === exp?.departmentId)

  useEffect(() => {
    if (exp?.id) {
      recordExperimentVisit(exp.id)
    }
  }, [exp?.id, recordExperimentVisit])

  if (!exp) return null

  const isBookmarked = bookmarkedExperimentIds.includes(exp.id)

  const handleDownload = (title: string, url: string) => {
    if (url && url.startsWith('blob:')) {
      const a = document.createElement('a')
      a.href = url
      a.download = title
      a.click()
      setDownloadNotice(`Downloaded "${title}"!`)
      return
    }

    const content = `VIRTUAL LAB LIBRARY — OFFICIAL ENGINEERING LAB MANUAL
====================================================================
Experiment Number : ${exp.experimentNumber} (${exp.code})
Experiment Title  : ${exp.title}
Department        : ${dept?.name || 'Engineering'}
Laboratory        : ${lab?.name || 'Laboratory'}
====================================================================

1. AIM:
${exp.aim}

2. LEARNING OBJECTIVES:
${exp.objectives.map((o, i) => `   ${i + 1}. ${o}`).join('\n')}

3. ENGINEERING THEORY:
${exp.theory}

4. PROCEDURE:
${exp.procedure.map((p, i) => `   ${i + 1}. ${p}`).join('\n')}

5. SAMPLE CALCULATIONS:
${exp.sampleCalculations}

6. SAFETY PRECAUTIONS:
${exp.precautions.map((p, i) => `   ${i + 1}. ${p}`).join('\n')}
`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const objUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objUrl
    a.download = `${exp.code}-${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(objUrl)
    setDownloadNotice(`Downloaded "${title}" successfully!`)
  }

  const showTheory = activeTab === 'all' || activeTab === 'theory'
  const show3dSchematic = activeTab === 'all' || activeTab === '3d_schematic'
  const studentAccess = isStudentAccessActive(studentSession)
  if (!isAdminAuthenticated && !studentAccess.active) {
    return (
      <div className="max-w-xl mx-auto px-4 py-14">
        <Card className="p-8 text-center space-y-5 border-2 border-teal-600/20">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto font-extrabold text-xl">
            🔒
          </div>
          <div className="space-y-1.5">
            <Badge tone="amber">Student Login Required</Badge>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {exp.title}
            </h1>
            <p className="text-sm text-slate-600">
              {studentAccess.reason === 'pending'
                ? 'Your student account is currently pending Admin approval. Please check back once approved.'
                : studentAccess.reason === 'expired'
                ? 'Your approved student access period has expired. Please contact the Admin to renew.'
                : studentAccess.reason === 'declined'
                ? 'Your student access request was declined by the Admin.'
                : 'Public visitors can browse lab and experiment titles. Please log in or register as a student to open this experiment.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to={`/student-login?redirect=/experiment/${exp.slug}`}>
              <Button variant="primary">
                {studentSession ? 'Check Student Status' : 'Student Login / Register'}
              </Button>
            </Link>
            <Link to="/experiments">
              <Button variant="outline">Back to Experiments</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }
  const showSimulation = activeTab === 'all' || activeTab === 'simulation'
  const showVivaDownloads = activeTab === 'all' || activeTab === 'viva_downloads'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-teal-700 font-medium">Home</Link>
          <span>/</span>
          {dept && (
            <>
              <Link to={`/department/${dept.slug}`} className="hover:text-teal-700 font-medium">
                {dept.shortName}
              </Link>
              <span>/</span>
            </>
          )}
          {lab && (
            <>
              <Link to={`/laboratory/${lab.slug}`} className="hover:text-teal-700 font-medium">
                {lab.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="font-mono font-bold text-slate-900">{exp.code}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmarkExperiment(exp.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer',
              isBookmarked
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            )}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>

          {(role === 'instructor' || role === 'admin') && (
            <Link to={`/edit/${exp.slug}`}>
              <Button variant="outline" size="sm">
                <Edit3 className="w-3.5 h-3.5" /> Edit Experiment
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Experiment Header Card */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge mono tone="teal">{exp.experimentNumber}</Badge>
            <Badge mono tone="sky">{exp.code}</Badge>
            <Badge tone="slate">Semester {exp.semester}</Badge>
            <Badge tone={exp.difficulty === 'Advanced' ? 'amber' : 'teal'}>
              {exp.difficulty}
            </Badge>
            {exp.status === 'draft' && <Badge tone="amber">Draft Mode</Badge>}
          </div>
          <span className="text-xs text-slate-500 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Est. {exp.estimatedMinutes} mins
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {exp.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {exp.summary}
        </p>
      </Card>

      {/* Sticky Segmented Mode Bar (Prevents Excessive Scrolling on iPad & Desktop) */}
      <div className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md py-2">
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all',
              activeTab === 'all'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Complete Lab View
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all',
              activeTab === 'theory'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            1. Theory, Equations &amp; Apparatus
          </button>
          <button
            onClick={() => setActiveTab('3d_schematic')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all',
              activeTab === '3d_schematic'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Box className="w-3.5 h-3.5" />
            2. 3D Model &amp; Circuit Diagram
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all',
              activeTab === 'simulation'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            3. Virtual Simulator &amp; Observations
          </button>
          <button
            onClick={() => setActiveTab('viva_downloads')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all',
              activeTab === 'viva_downloads'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Download className="w-3.5 h-3.5" />
            4. Viva, Precautions &amp; Manuals ({exp.downloads.length})
          </button>
        </div>
      </div>

      {/* SECTION GROUP 1: AIM, OUTCOMES, APPARATUS, THEORY & EQUATIONS */}
      {showTheory && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-700" />
                Aim &amp; Experimental Objectives
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-teal-50/50 p-3.5 rounded-xl border border-teal-200/70">
                {exp.aim}
              </p>
              <ul className="space-y-2 pt-1">
                {exp.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-700" />
                Course Learning Outcomes (COs)
              </h2>
              <ul className="space-y-2.5">
                {exp.learningOutcomes.map((co, i) => (
                  <li
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed"
                  >
                    {co}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Apparatus Table */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-700" />
              Apparatus &amp; Instrument Specifications
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3 rounded-tl-lg">Sl. No.</th>
                    <th className="py-2.5 px-3">Equipment / Instrument Name</th>
                    <th className="py-2.5 px-3">Engineering Specification &amp; Range</th>
                    <th className="py-2.5 px-3 rounded-tr-lg">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {exp.apparatus.map((item, i) => (
                    <tr key={i} className="text-slate-800">
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-700">{i + 1}</td>
                      <td className="py-2.5 px-3 font-semibold">{item.name}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-600">
                        {item.specification}
                      </td>
                      <td className="py-2.5 px-3 font-bold">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Theory & Mathematical Equations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Engineering Theory
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {exp.theory}
              </div>
            </Card>

            <Card className="lg:col-span-5 p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-700" />
                Mathematical Equations
              </h2>
              <div className="space-y-3">
                {exp.equations.map((eq, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <div className="text-xs font-bold text-teal-800">{eq.label}</div>
                    <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200">
                      {eq.formula}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{eq.variables}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SECTION GROUP 2: CIRCUIT SCHEMATIC & INTERACTIVE 3D MODEL */}
      {show3dSchematic && (
        <div className="space-y-6">
          {(exp.circuitDiagramImageUrl || exp.circuitDiagramSvgType !== 'none') && (
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Interactive Circuit / Workbench Schematic Diagram
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{exp.circuitDiagramDescription}</p>
            </div>

            {exp.circuitDiagramImageUrl ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <img
                  src={exp.circuitDiagramImageUrl}
                  alt={exp.title + " Circuit Diagram"}
                  className="w-full max-w-3xl max-h-[460px] object-contain rounded-xl"
                />
              </div>
            ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
              <svg viewBox="0 0 680 210" className="w-full max-w-3xl h-auto">
                <rect x="10" y="10" width="660" height="190" rx="14" fill="#090d16" stroke="#1e293b" strokeWidth="2" />
                <line x1="50" y1="45" x2="580" y2="45" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="50" y1="165" x2="580" y2="165" stroke="#64748b" strokeWidth="2.5" />
                <circle cx="50" cy="45" r="5" fill="#38bdf8" />
                <circle cx="50" cy="165" r="5" fill="#64748b" />
                <text x="35" y="110" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                  {exp.circuitDiagramSvgType === 'series-rlc' ? 'V_s ∠0° (AC)' : '220V DC'}
                </text>
                <rect x="150" y="33" width="95" height="24" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <text x="165" y="49" fill="#fcd34d" fontSize="11" fontWeight="bold">
                  {exp.circuitDiagramSvgType === 'series-rlc' ? 'Resistor R' : 'Rheostat R_ext'}
                </text>
                <rect x="300" y="33" width="110" height="24" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                <text x="315" y="49" fill="#6ee7b7" fontSize="11" fontWeight="bold">
                  {exp.circuitDiagramSvgType === 'series-rlc' ? 'Inductor L (mH)' : 'Field R_f (Z-ZZ)'}
                </text>
                <line x1="500" y1="45" x2="500" y2="75" stroke="#38bdf8" strokeWidth="2.5" />
                <circle cx="500" cy="105" r="30" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
                <text x="488" y="110" fill="#ffffff" fontSize="14" fontWeight="bold">
                  {exp.circuitDiagramSvgType === 'series-rlc' ? 'C' : 'M'}
                </text>
                <line x1="500" y1="135" x2="500" y2="165" stroke="#64748b" strokeWidth="2.5" />
                <line x1="580" y1="45" x2="580" y2="85" stroke="#a855f7" strokeWidth="2" />
                <circle cx="580" cy="105" r="18" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                <text x="575" y="110" fill="#d8b4fe" fontSize="12" fontWeight="bold">V</text>
                <line x1="580" y1="125" x2="580" y2="165" stroke="#a855f7" strokeWidth="2" />
              </svg>
            </div>
            )}
          </Card>
          )}

          {exp.has3dModel && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Interactive 3D Engineering Assembly Viewer
                </h2>
                {exp.customGlbUrl && (
                  <Badge mono tone="teal">Custom GLB: {exp.customGlbUrl}</Badge>
                )}
              </div>
              {exp.model3dSource === 'custom_html' && exp.customModelHtml ? (
                <SandboxedHtmlLabViewer
                  htmlCode={exp.customModelHtml}
                  title={exp.title}
                  kind="3D Model"
                />
              ) : (
                <Engineering3DViewer
                  preset={exp.model3dPreset}
                  title={exp.title}
                  rpm={liveRpm}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION GROUP 3: VIRTUAL SIMULATION, PROCEDURE, OBSERVATIONS & CALCULATIONS */}
      {showSimulation && (
        <div className="space-y-6">
          {exp.hasSimulation && (
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-slate-900">
                Virtual Laboratory Simulator, Real-Time Graphs &amp; Observation Table
              </h2>
              {exp.simulationSource === 'custom_html' && exp.customSimulationHtml ? (
                <SandboxedHtmlLabViewer
                  htmlCode={exp.customSimulationHtml}
                  title={`${exp.title} — Virtual Lab`}
                  kind="Virtual Lab Simulation"
                />
              ) : (
                <VirtualLabSimulator
                  preset={exp.simulationPreset}
                  onRpmChange={(newRpm) => setLiveRpm(newRpm)}
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Step-by-Step Experimental Procedure
              </h2>
              <ol className="space-y-2.5">
                {exp.procedure.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700"
                  >
                    <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Calculations &amp; Engineering Results
              </h2>
              <div className="font-mono text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed">
                {exp.sampleCalculations}
              </div>
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
                <div className="text-xs font-bold uppercase text-teal-900">
                  Experimental Conclusion
                </div>
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line">
                  {exp.resultsTemplate}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SECTION GROUP 4: PRECAUTIONS, VIVA QUESTIONS, REFERENCES & DOWNLOADS */}
      {showVivaDownloads && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Safety &amp; Laboratory Precautions
              </h2>
              <ul className="space-y-2">
                {exp.precautions.map((p, i) => (
                  <li
                    key={i}
                    className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs sm:text-sm text-slate-800"
                  >
                    • {p}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-700" />
                Viva-Voce Questions &amp; Answers
              </h2>
              <div className="space-y-3">
                {exp.vivaQuestions.map((vq, i) => (
                  <div
                    key={vq.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                  >
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      Q{i + 1}. {vq.question}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{vq.answer}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5 p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                Standard References
              </h2>
              <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                {exp.references.map((ref, i) => (
                  <li key={i} className="leading-relaxed">{ref}</li>
                ))}
              </ul>
            </Card>

            <Card className="lg:col-span-7 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-5 h-5 text-teal-700" />
                  Downloadable PDFs, Presentations &amp; 3D Assets
                </h2>
                <Badge tone="teal">Authenticated as {role}</Badge>
              </div>

              {downloadNotice && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
                  {downloadNotice}
                </div>
              )}

              <div className="space-y-2.5">
                {exp.downloads.map((dl) => (
                  <div
                    key={dl.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                        {dl.title}
                        <Badge mono tone="slate">{dl.fileType} • {dl.fileSize}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {dl.requiresAuth
                          ? 'Protected Educational Resource (Unlocked for Registered Student / Instructor / Admin)'
                          : 'Publicly Accessible Handout'}
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownload(dl.title, dl.url)}
                      className="shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
