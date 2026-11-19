import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FlaskConical, Plus, Building2 } from 'lucide-react'
import { useLabStore } from '../context/LabStoreContext'
import { Card, Badge, SectionHeader, EmptyState, Button } from '../components/ui/DesignSystem'
import { LabCard, ExperimentCard } from './HomePage'

export function DepartmentPage() {
  const { deptSlug } = useParams()
  const {
    departments,
    laboratories,
    experiments,
    bookmarkedExperimentIds,
    toggleBookmarkExperiment,
    role,
  } = useLabStore()

  const dept = departments.find((d) => d.slug === deptSlug) || departments[0]
  const deptLabs = laboratories.filter((l) => l.departmentId === dept.id)
  const deptExps = experiments.filter(
    (e) =>
      e.departmentId === dept.id &&
      ((e.published && e.status === 'published') || role !== 'student')
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="flex items-center justify-between">
        <Link
          to="/departments"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="w-4 h-4" />
          All Engineering Departments
        </Link>
        {(role === 'instructor' || role === 'admin') && (
          <Link to="/create">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" /> Add Experiment to {dept.code}
            </Button>
          </Link>
        )}
      </div>

      {/* Department Hero Header */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge mono tone="teal">Department Code: {dept.code}</Badge>
          <Badge tone="slate">{deptLabs.length} Accredited Laboratories</Badge>
          <Badge tone="sky">{deptExps.length} Experiments</Badge>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {dept.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {dept.description}
        </p>
      </Card>

      {/* Department Laboratories */}
      <section className="space-y-4">
        <SectionHeader
          title={`Laboratories in ${dept.shortName} (${deptLabs.length})`}
          subtitle="Select a laboratory to view its syllabus and experiments"
        />

        {deptLabs.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-6 h-6" />}
            title={`No laboratories configured for ${dept.name} yet`}
            description="Instructors and Administrators can create a new laboratory right from the Create Experiment Workspace or Admin Panel."
            action={
              <Link to="/create">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4" /> Create Lab &amp; Experiment
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deptLabs.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        )}
      </section>

      {/* Department Experiments */}
      {deptExps.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            title={`Experiments in ${dept.shortName} (${deptExps.length})`}
            subtitle="Direct access to interactive 3D models and virtual simulations"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deptExps.map((exp) => (
              <ExperimentCard
                key={exp.id}
                exp={exp}
                isBookmarked={bookmarkedExperimentIds.includes(exp.id)}
                onToggleBookmark={() => toggleBookmarkExperiment(exp.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
