import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen,
  Search,
  Zap,
  Cog,
  Building2,
  Radio,
  Terminal,
  Globe,
  FlaskConical,
  Gauge,
  Activity,
  HeartPulse,
  ArrowRight,
  Clock,
  Bookmark,
  Box,
  Sliders,
  History,
  Sparkles,
  X,
} from 'lucide-react'
import { useLabStore } from '../context/LabStoreContext'
import { Card, Badge, SectionHeader, EmptyState, Button } from '../components/ui/DesignSystem'
import { cn } from '../lib/utils'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Cog,
  Building2,
  Radio,
  Terminal,
  Globe,
  FlaskConical,
  Gauge,
  Activity,
  HeartPulse,
}

export function HomePage() {
  const {
    departments,
    laboratories,
    experiments,
    recentLabIds,
    recentExperimentIds,
    bookmarkedExperimentIds,
    toggleBookmarkExperiment,
    role,
  } = useLabStore()

  const [query, setQuery] = useState('')
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all')

  const visibleDepartments = departments.filter(
    (d) => d.published || role === 'admin' || role === 'instructor'
  )

  const visibleLabs = laboratories.filter(
    (l) => l.published || role === 'admin' || role === 'instructor'
  )

  const visibleExperiments = experiments.filter(
    (e) => (e.published && e.status === 'published') || role === 'admin' || role === 'instructor'
  )

  // Intelligent Multi-Entity Search (Labs, Experiment Titles, Numbers/Codes, Topics & Apparatus/Equipment)
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null

    const matchingLabs = visibleLabs.filter(
      (lab) =>
        lab.name.toLowerCase().includes(q) ||
        lab.code.toLowerCase().includes(q) ||
        lab.description.toLowerCase().includes(q) ||
        (lab.equipmentHighlights || []).some((eq) => eq.toLowerCase().includes(q))
    )

    const matchingExperiments = visibleExperiments.filter(
      (exp) =>
        exp.title.toLowerCase().includes(q) ||
        exp.code.toLowerCase().includes(q) ||
        exp.experimentNumber.toLowerCase().includes(q) ||
        exp.summary.toLowerCase().includes(q) ||
        (exp.topics || []).some((t) => t.toLowerCase().includes(q)) ||
        exp.apparatus.some(
          (ap) =>
            ap.name.toLowerCase().includes(q) ||
            ap.specification.toLowerCase().includes(q)
        )
    )

    return { matchingLabs, matchingExperiments }
  }, [query, visibleLabs, visibleExperiments])

  const featuredLabs = useMemo(
    () =>
      visibleLabs.filter((l) =>
        selectedDeptFilter === 'all' ? true : l.departmentId === selectedDeptFilter
      ),
    [visibleLabs, selectedDeptFilter]
  )

  const recentlyAddedExperiments = useMemo(
    () =>
      [...visibleExperiments]
        .filter((e) =>
          selectedDeptFilter === 'all' ? true : e.departmentId === selectedDeptFilter
        )
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [visibleExperiments, selectedDeptFilter]
  )

  const popularExperiments = useMemo(
    () =>
      [...visibleExperiments]
        .filter((e) =>
          selectedDeptFilter === 'all' ? true : e.departmentId === selectedDeptFilter
        )
        .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)),
    [visibleExperiments, selectedDeptFilter]
  )

  const recentLabs = recentLabIds
    .map((id) => visibleLabs.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))

  const recentExperiments = recentExperimentIds
    .map((id) => visibleExperiments.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. HERO DISCOVERY SECTION (Inspired directly by Wireframe Panel 1) */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xs text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          <span>Centralized Engineering Laboratory &amp; Simulation Library</span>
        </div>

        <div className="max-w-2xl mx-auto space-y-2.5">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Virtual Lab Library
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Discover, study, visualize in 3D, and simulate accredited engineering laboratory experiments across {visibleDepartments.length} departments.
          </p>
        </div>

        {/* Large Intelligent Pill Search Bar (Matches Wireframe Green-Bordered Search Bar) */}
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-teal-700 absolute left-5 pointer-events-none" />
            <input
              id="global-hero-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any labs, experiment names, numbers (EXP-01), topics, or equipment..."
              className="w-full h-14 pl-13 pr-12 rounded-full bg-teal-50/40 hover:bg-teal-50/70 focus:bg-white border-2 border-teal-600/80 focus:border-teal-700 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 shadow-xs focus:outline-none focus:ring-4 focus:ring-teal-600/15 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 p-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Search Suggestion Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-400 mr-1">Try searching:</span>
            {['DC Shunt Motor', 'EEPC-2201', 'Series RLC', 'Tachometer', 'Centrifugal Pump', 'EXP-01'].map(
              (term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* LIVE SEARCH RESULTS OVERLAY SECTION (When user types in the search bar) */}
      {searchResults && (
        <section className="space-y-6 bg-white border-2 border-teal-600/30 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Search Results for &ldquo;{query}&rdquo;
              </h2>
              <p className="text-xs text-slate-500">
                Found {searchResults.matchingLabs.length} laboratories and{' '}
                {searchResults.matchingExperiments.length} experiments matching your query
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setQuery('')}>
              Clear Search
            </Button>
          </div>

          {searchResults.matchingLabs.length === 0 &&
          searchResults.matchingExperiments.length === 0 ? (
            <EmptyState
              icon={<Search className="w-6 h-6" />}
              title="No matching laboratories or experiments found"
              description={`We couldn't find any lab, experiment code, topic, or apparatus matching "${query}". Try searching for "DC Motor", "RLC", "Pump", or "EEPC".`}
              action={
                <Button variant="primary" size="sm" onClick={() => setQuery('')}>
                  Reset Search Filter
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {searchResults.matchingExperiments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Matching Experiments ({searchResults.matchingExperiments.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.matchingExperiments.map((exp) => (
                      <ExperimentCard
                        key={exp.id}
                        exp={exp}
                        isBookmarked={bookmarkedExperimentIds.includes(exp.id)}
                        onToggleBookmark={() => toggleBookmarkExperiment(exp.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {searchResults.matchingLabs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Matching Laboratories ({searchResults.matchingLabs.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.matchingLabs.map((lab) => (
                      <LabCard key={lab.id} lab={lab} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* 2. BROWSE BY DEPARTMENT */}
      <section className="space-y-4">
        <SectionHeader
          title="Browse by Engineering Department"
          subtitle="Filter discovery below or open a dedicated department portal"
          action={
            <Link
              to="/departments"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
            >
              View All {visibleDepartments.length} Departments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {/* Quick Filter Bar + Department Cards */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedDeptFilter('all')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold border shrink-0 transition-all cursor-pointer',
              selectedDeptFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            )}
          >
            All Departments ({visibleDepartments.length})
          </button>
          {visibleDepartments.map((dept) => (
            <button
              key={dept.id}
              onClick={() =>
                setSelectedDeptFilter(selectedDeptFilter === dept.id ? 'all' : dept.id)
              }
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold border shrink-0 transition-all cursor-pointer',
                selectedDeptFilter === dept.id
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              {dept.shortName}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleDepartments.slice(0, 6).map((dept) => {
            const IconComp = ICON_MAP[dept.iconName] || Zap
            const labCount = visibleLabs.filter((l) => l.departmentId === dept.id).length
            const expCount = visibleExperiments.filter((e) => e.departmentId === dept.id).length

            return (
              <Link key={dept.id} to={`/department/${dept.slug}`}>
                <Card className="p-5 h-full flex flex-col justify-between hover:border-teal-600/60 hover:shadow-md group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-50 border border-slate-200 group-hover:border-teal-200 flex items-center justify-center text-slate-700 group-hover:text-teal-700 transition-colors">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <Badge mono tone="slate">{dept.code}</Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dept.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      <strong className="text-slate-800">{labCount}</strong> Labs •{' '}
                      <strong className="text-slate-800">{expCount}</strong> Experiments
                    </span>
                    <span className="font-semibold text-teal-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 3. FEATURED LABORATORIES */}
      <section className="space-y-4">
        <SectionHeader
          title="Featured Laboratories"
          subtitle="Accredited curricular laboratories equipped with virtual 3D benches and simulators"
          action={
            <Link
              to="/laboratories"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
            >
              All Laboratories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {featuredLabs.length === 0 ? (
          <EmptyState
            icon={<FlaskConical className="w-6 h-6" />}
            title="No laboratories in this department filter yet"
            description="Select 'All Departments' or create a new laboratory in the Admin Panel."
            action={
              <Button variant="outline" size="sm" onClick={() => setSelectedDeptFilter('all')}>
                Show All Departments
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredLabs.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        )}
      </section>

      {/* 4. RECENTLY ADDED & 5. POPULAR EXPERIMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Added Experiments */}
        <section className="space-y-4">
          <SectionHeader
            title="Recently Added Experiments"
            subtitle="Latest experiments published with 3D assemblies and manuals"
          />
          {recentlyAddedExperiments.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-5 h-5" />}
              title="No experiments found"
              description="Create a new experiment using the Create button in the header."
            />
          ) : (
            <div className="space-y-3">
              {recentlyAddedExperiments.map((exp) => (
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

        {/* Popular Experiments */}
        <section className="space-y-4">
          <SectionHeader
            title="Popular Experiments"
            subtitle="Most frequently practiced simulations by engineering students"
          />
          {popularExperiments.length === 0 ? (
            <EmptyState
              icon={<Activity className="w-5 h-5" />}
              title="No popular experiments in this filter"
              description="Switch back to All Departments to view top experiments."
            />
          ) : (
            <div className="space-y-3">
              {popularExperiments.map((exp) => (
                <ExperimentCard
                  key={exp.id}
                  exp={exp}
                  showViews
                  isBookmarked={bookmarkedExperimentIds.includes(exp.id)}
                  onToggleBookmark={() => toggleBookmarkExperiment(exp.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 6. RECENTLY VISITED LABORATORIES & EXPERIMENTS */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6">
        <SectionHeader
          title="Recently Visited Workspace History"
          subtitle="Pick up right where you left off in your recent laboratories and experiments"
          action={
            <Link
              to="/recent"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
            >
              Full History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recently Visited Laboratories */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-teal-700" />
              Recently Visited Laboratories
            </h3>
            {recentLabs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No laboratories visited yet.</p>
            ) : (
              <div className="space-y-2">
                {recentLabs.map((lab) => (
                  <Link
                    key={lab.id}
                    to={`/laboratory/${lab.slug}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200/80 transition-all"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <Badge mono tone="teal">{lab.code}</Badge>
                        <span className="text-xs text-slate-500">Semester {lab.semester}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate mt-1">
                        {lab.name}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recently Visited Experiments */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-sky-700" />
              Recently Visited Experiments
            </h3>
            {recentExperiments.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No experiments visited yet.</p>
            ) : (
              <div className="space-y-2">
                {recentExperiments.map((exp) => (
                  <Link
                    key={exp.id}
                    to={`/experiment/${exp.slug}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/80 transition-all"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <Badge mono tone="sky">{exp.code}</Badge>
                        <span className="text-xs text-slate-500">{exp.experimentNumber}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate mt-1">
                        {exp.title}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

/* Reusable Meaningful Laboratory Card */
export function LabCard({ lab }: { lab: any }) {
  const { departments, experiments } = useLabStore()
  const dept = departments.find((d) => d.id === lab.departmentId)
  const expCount = experiments.filter((e) => e.labId === lab.id).length

  return (
    <Link to={`/laboratory/${lab.slug}`}>
      <Card className="p-5 h-full flex flex-col justify-between hover:border-teal-600/60 hover:shadow-md group">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge mono tone="teal">{lab.code}</Badge>
              {dept && <Badge tone="slate">{dept.shortName}</Badge>}
            </div>
            <span className="text-xs font-medium text-slate-500">
              Semester {lab.semester}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
            {lab.name}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {lab.description}
          </p>

          {lab.equipmentHighlights && lab.equipmentHighlights.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1.5">
              {lab.equipmentHighlights.map((eq: string) => (
                <span
                  key={eq}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600"
                >
                  {eq}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            <strong className="text-slate-800">{expCount}</strong> Experiments • {lab.roomNumber}
          </span>
          <span className="font-semibold text-teal-700 inline-flex items-center gap-1">
            Open Lab <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  )
}

/* Reusable Meaningful Experiment Card */
export function ExperimentCard({
  exp,
  isBookmarked,
  onToggleBookmark,
  showViews,
}: {
  exp: any
  isBookmarked: boolean
  onToggleBookmark: () => void
  showViews?: boolean
}) {
  return (
    <Card className="p-5 hover:border-teal-600/60 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge mono tone="sky">{exp.code}</Badge>
          <Badge mono tone="slate">{exp.experimentNumber}</Badge>
          <Badge tone={exp.difficulty === 'Advanced' ? 'amber' : 'teal'}>
            {exp.difficulty}
          </Badge>
          {exp.status === 'draft' && <Badge tone="amber">Draft</Badge>}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleBookmark()
          }}
          className={cn(
            'p-2 rounded-xl border transition-colors cursor-pointer shrink-0',
            isBookmarked
              ? 'bg-amber-50 border-amber-200 text-amber-600'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
          )}
          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Experiment'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>
      </div>

      <Link to={`/experiment/${exp.slug}`} className="block mt-2.5 group">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 leading-snug transition-colors">
          {exp.title}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
          {exp.summary}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            {exp.has3dModel && (
              <span className="inline-flex items-center gap-1 font-medium text-teal-700">
                <Box className="w-3.5 h-3.5" /> 3D Model
              </span>
            )}
            {exp.hasSimulation && (
              <span className="inline-flex items-center gap-1 font-medium text-sky-700">
                <Sliders className="w-3.5 h-3.5" /> Simulator
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {exp.estimatedMinutes}m
            </span>
          </div>

          <span className="font-semibold text-teal-700 inline-flex items-center gap-1">
            {showViews ? `${exp.viewsCount || 120} views • Open` : 'Launch Lab'}{' '}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </Card>
  )
}
