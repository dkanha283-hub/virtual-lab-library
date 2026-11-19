import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FlaskConical, Plus, UserCheck, MapPin } from 'lucide-react'
import { useLabStore } from '../context/LabStoreContext'
import { Card, Badge, SectionHeader, EmptyState, Button } from '../components/ui/DesignSystem'
import { ExperimentCard } from './HomePage'

export function LaboratoryPage() {
  const { labSlug } = useParams()
  const {
    laboratories,
    departments,
    experiments,
    recordLabVisit,
    bookmarkedExperimentIds,
    toggleBookmarkExperiment,
    role,
  } = useLabStore()

  const lab = laboratories.find((l) => l.slug === labSlug) || laboratories[0]
  const dept = departments.find((d) => d.id === lab?.departmentId)
  const labExps = experiments.filter(
    (e) =>
      e.labId === lab?.id &&
      ((e.published && e.status === 'published') || role !== 'student')
  )

  useEffect(() => {
    if (lab?.id) {
      recordLabVisit(lab.id)
    }
  }, [lab?.id, recordLabVisit])

  if (!lab) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb + Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-teal-700 font-medium">Home</Link>
          <span>/</span>
          {dept && (
            <>
              <Link to={`/department/${dept.slug}`} className="hover:text-teal-700 font-medium">
                {dept.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="font-mono font-bold text-slate-900">{lab.code}</span>
        </div>

        {(role === 'instructor' || role === 'admin') && (
          <Link to="/create">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" /> Add Experiment to Lab
            </Button>
          </Link>
        )}
      </div>

      {/* Laboratory Header Card */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge mono tone="teal">{lab.code}</Badge>
          <Badge tone="slate">Semester {lab.semester}</Badge>
          {dept && <Badge tone="sky">{dept.shortName}</Badge>}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {lab.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {lab.description}
        </p>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-teal-700" />
            <strong>In-Charge:</strong> {lab.incharge}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-sky-700" />
            <strong>Location:</strong> {lab.roomNumber}
          </span>
        </div>
      </Card>

      {/* Experiments List */}
      <section className="space-y-4">
        <SectionHeader
          title={`Laboratory Experiments (${labExps.length})`}
          subtitle="Open any experiment to launch its interactive 3D assembly, schematic, and simulator"
        />

        {labExps.length === 0 ? (
          <EmptyState
            icon={<FlaskConical className="w-6 h-6" />}
            title="No experiments added to this laboratory yet"
            description="Use the Create Experiment Workspace to publish the first experiment for this laboratory."
            action={
              <Link to="/create">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4" /> Create First Experiment
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labExps.map((exp) => (
              <ExperimentCard
                key={exp.id}
                exp={exp}
                isBookmarked={bookmarkedExperimentIds.includes(exp.id)}
                onToggleBookmark={() => toggleBookmarkExperiment(exp.id)}
              />
            ))}
          </div>
        )}
      </section>

      <Link
        to={dept ? `/department/${dept.slug}` : '/laboratories'}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {dept ? dept.name : 'All Laboratories'}
      </Link>
    </div>
  )
}
