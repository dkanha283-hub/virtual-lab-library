import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  FlaskConical,
  BookOpen,
  History,
  Bookmark,
  FileEdit,
  Plus,
  Search,
  ArrowRight,
  Edit3,
} from 'lucide-react'
import { useLabStore } from '../context/LabStoreContext'
import { Card, Badge, SectionHeader, EmptyState, Button } from '../components/ui/DesignSystem'
import { LabCard, ExperimentCard } from './HomePage'

/* 1. All Departments Directory */
export function AllDepartmentsPage() {
  const { departments, laboratories, experiments } = useLabStore()
  const [filter, setFilter] = useState('')

  const list = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(filter.toLowerCase()) ||
      d.code.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SectionHeader
        title="All Engineering Departments"
        subtitle="Complete academic catalog of engineering disciplines supported in Virtual Lab Library"
      />

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter departments by name or code..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((dept) => {
          const labCount = laboratories.filter((l) => l.departmentId === dept.id).length
          const expCount = experiments.filter((e) => e.departmentId === dept.id).length
          return (
            <Link key={dept.id} to={`/department/${dept.slug}`}>
              <Card className="p-5 h-full flex flex-col justify-between hover:border-teal-600/60 hover:shadow-md">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge mono tone="teal">{dept.code}</Badge>
                    <span className="text-xs text-slate-500">{labCount} Labs</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{dept.description}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{expCount} Experiments</span>
                  <span className="font-semibold text-teal-700 inline-flex items-center gap-1">
                    Open Department <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* 2. All Laboratories Directory */
export function AllLaboratoriesPage() {
  const { laboratories, departments } = useLabStore()
  const [deptId, setDeptId] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = laboratories.filter((lab) => {
    const matchesDept = deptId === 'all' || lab.departmentId === deptId
    const matchesSearch =
      lab.name.toLowerCase().includes(search.toLowerCase()) ||
      lab.code.toLowerCase().includes(search.toLowerCase())
    return matchesDept && matchesSearch
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SectionHeader
        title="Engineering Laboratories Directory"
        subtitle="Browse all physical and virtual laboratories across semesters"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search laboratory name or course code (e.g., EEPC-2201)..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-300 text-sm"
          />
        </div>
        <select
          value={deptId}
          onChange={(e) => setDeptId(e.target.value)}
          className="h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-800"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-6 h-6" />}
          title="No matching laboratories"
          description="Try clearing the department filter or creating a new laboratory."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      )}
    </div>
  )
}

/* 3. All Experiments Directory */
export function AllExperimentsPage() {
  const { experiments, departments, bookmarkedExperimentIds, toggleBookmarkExperiment } =
    useLabStore()
  const [deptId, setDeptId] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = experiments.filter((exp) => {
    const matchesDept = deptId === 'all' || exp.departmentId === deptId
    const matchesSearch =
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      exp.code.toLowerCase().includes(search.toLowerCase()) ||
      exp.experimentNumber.toLowerCase().includes(search.toLowerCase())
    return matchesDept && matchesSearch
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SectionHeader
        title="All Laboratory Experiments"
        subtitle="Complete catalog of interactive 3D and simulated experiments"
        action={
          <Link to="/create">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" /> Create New Experiment
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by experiment title, number (EXP-01), or code..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-300 text-sm"
          />
        </div>
        <select
          value={deptId}
          onChange={(e) => setDeptId(e.target.value)}
          className="h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-800"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6" />}
          title="No experiments match your filter"
          description="Try clearing your search query or create a new experiment."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((exp) => (
            <ExperimentCard
              key={exp.id}
              exp={exp}
              isBookmarked={bookmarkedExperimentIds.includes(exp.id)}
              onToggleBookmark={() => toggleBookmarkExperiment(exp.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* 4. Recently Visited Page */
export function RecentlyVisitedPage() {
  const {
    laboratories,
    experiments,
    recentLabIds,
    recentExperimentIds,
    bookmarkedExperimentIds,
    toggleBookmarkExperiment,
  } = useLabStore()

  const recentLabs = recentLabIds
    .map((id) => laboratories.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))

  const recentExps = recentExperimentIds
    .map((id) => experiments.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SectionHeader
        title="Recently Visited Laboratories & Experiments"
        subtitle="Automatically tracked from your active learning sessions"
      />

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Recently Visited Experiments ({recentExps.length})
        </h3>
        {recentExps.length === 0 ? (
          <EmptyState
            icon={<History className="w-6 h-6" />}
            title="No recently visited experiments"
            description="Open any experiment to automatically add it to your quick-access history."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentExps.map((exp) => (
              <ExperimentCard
                key={exp.id}
                exp={exp}
                isBookmarked={bookmarkedExperimentIds.includes(exp.id)}
                onToggleBookmark={() => toggleBookmarkExperiment(exp.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Recently Visited Laboratories ({recentLabs.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentLabs.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* 5. Favorites / Bookmarks Page */
export function BookmarksPage() {
  const { experiments, bookmarkedExperimentIds, toggleBookmarkExperiment } = useLabStore()

  const bookmarked = experiments.filter((e) => bookmarkedExperimentIds.includes(e.id))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SectionHeader
        title="Favorites & Bookmarked Experiments"
        subtitle="Saved experiments for quick exam revision and laboratory preparation"
      />

      {bookmarked.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-6 h-6" />}
          title="No bookmarked experiments yet"
          description="Tap the bookmark icon on any experiment card to save it here for instant access."
          action={
            <Link to="/experiments">
              <Button variant="primary" size="sm">Browse All Experiments</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarked.map((exp) => (
            <ExperimentCard
              key={exp.id}
              exp={exp}
              isBookmarked={true}
              onToggleBookmark={() => toggleBookmarkExperiment(exp.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* 6. My Contributions Page (Instructor / Admin) */
export function MyContributionsPage() {
  const { experiments } = useLabStore()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SectionHeader
        title="My Contributions & Drafts"
        subtitle="Manage experiments, 3D configurations, and lab manuals you have authored"
        action={
          <Link to="/create">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" /> Create New Experiment
            </Button>
          </Link>
        }
      />

      {experiments.length === 0 ? (
        <EmptyState
          icon={<FileEdit className="w-6 h-6" />}
          title="No authored experiments yet"
          description="Use the 5-step Create Experiment Workspace to build your first experiment."
        />
      ) : (
        <div className="space-y-3">
          {experiments.map((exp) => (
            <Card
              key={exp.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge mono tone="sky">{exp.code}</Badge>
                  <Badge mono tone="slate">{exp.experimentNumber}</Badge>
                  <Badge tone={exp.status === 'draft' ? 'amber' : 'teal'}>
                    {exp.status === 'draft' ? 'Draft' : 'Published'}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900">{exp.title}</h3>
                <p className="text-xs text-slate-500">
                  Author: {exp.authorName} • Last updated: {exp.updatedAt}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/edit/${exp.slug}`}>
                  <Button variant="outline" size="sm">
                    <Edit3 className="w-3.5 h-3.5" /> Edit in Workspace
                  </Button>
                </Link>
                <Link to={`/experiment/${exp.slug}`}>
                  <Button variant="primary" size="sm">
                    Open View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
