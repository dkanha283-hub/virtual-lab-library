import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Home,
  Building2,
  FlaskConical,
  BookOpen,
  History,
  Bookmark,
  FileEdit,
  ShieldCheck,
  Plus,
  Search,
  Cpu,
  Lock,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  GraduationCap,
} from 'lucide-react'
import { useLabStore } from '../../context/LabStoreContext'
import { cn } from '../../lib/utils'
import { Button, Badge } from '../ui/DesignSystem'

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    isAdminAuthenticated,
    logoutAdmin,
    userEmail,
    laboratories,
    experiments,
    recentLabIds,
    recentExperimentIds,
    bookmarkedExperimentIds,
    cloudSyncStatus,
    cloudSyncMessage,
    syncAllToCloud,
  } = useLabStore()

  const location = useLocation()
  const navigate = useNavigate()

  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const recentLabs = recentLabIds
    .map((id) => laboratories.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .slice(0, 4)

  const recentExps = recentExperimentIds
    .map((id) => experiments.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .slice(0, 4)

  const primaryNav = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/departments', label: 'All Departments', icon: Building2 },
    { to: '/laboratories', label: 'Laboratories', icon: FlaskConical },
    { to: '/experiments', label: 'All Experiments', icon: BookOpen },
    { to: '/recent', label: 'Recently Visited', icon: History },
    {
      to: '/bookmarks',
      label: 'Favorites / Bookmarks',
      icon: Bookmark,
      badge: bookmarkedExperimentIds.length,
    },
    ...(isAdminAuthenticated
      ? [
          { to: '/contributions', label: 'My Contributions', icon: FileEdit },
          { to: '/admin', label: 'Admin Panel', icon: ShieldCheck },
        ]
      : [
          { to: '/student-login', label: 'Student Login', icon: GraduationCap },
          { to: '/login', label: 'Admin Login', icon: Lock },
        ]),
  ]

  const renderSidebarContent = (onItemClick?: () => void) => (
    <div className="flex flex-col h-full justify-between py-4 px-3.5 space-y-6 overflow-y-auto">
      <div className="space-y-6">
        <nav className="space-y-1">
          <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {primaryNav.map((item) => {
            const Icon = item.icon
            const active =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onItemClick}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all',
                  active
                    ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      active ? 'text-teal-700' : 'text-slate-400'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Recent Visited Labs */}
        <div className="bg-slate-100/90 border border-slate-200/90 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 px-1">
            <History className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span>Recent Visited Labs</span>
          </div>
          {recentLabs.length === 0 ? (
            <p className="text-[11px] text-slate-500 px-1 py-1">
              No laboratories visited yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {recentLabs.map((lab) => (
                <Link
                  key={lab.id}
                  to={`/laboratory/${lab.slug}`}
                  onClick={onItemClick}
                  className="block px-2.5 py-2 rounded-xl bg-white hover:bg-teal-50/60 border border-slate-200/80 transition-all group"
                >
                  <div className="text-[11px] font-mono font-bold text-teal-700">
                    {lab.code}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-teal-900 truncate">
                    {lab.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Visited Experiments */}
        <div className="bg-slate-100/90 border border-slate-200/90 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 px-1">
            <History className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span>Recent Visited Experiments</span>
          </div>
          {recentExps.length === 0 ? (
            <p className="text-[11px] text-slate-500 px-1 py-1">
              No experiments opened yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {recentExps.map((exp) => (
                <Link
                  key={exp.id}
                  to={`/experiment/${exp.slug}`}
                  onClick={onItemClick}
                  className="block px-2.5 py-2 rounded-xl bg-white hover:bg-sky-50/60 border border-slate-200/80 transition-all group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-sky-700">
                    <span>{exp.code}</span>
                    <span>{exp.experimentNumber}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-sky-900 truncate">
                    {exp.title}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auth Status Footer in Sidebar */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        {isAdminAuthenticated ? (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge tone="teal">Admin Authenticated</Badge>
            </div>
            <div className="text-[11px] font-medium text-slate-700 truncate">
              {userEmail}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={async () => {
                await logoutAdmin()
                if (onItemClick) onItemClick()
                navigate('/')
              }}
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        ) : (
          <Link to="/login" onClick={onItemClick} className="block">
            <Button variant="outline" size="sm" className="w-full">
              <Lock className="w-3.5 h-3.5 text-teal-700" />
              Admin Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
            className="hidden lg:inline-flex p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200 cursor-pointer"
            title={desktopSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {desktopSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                Virtual Lab Library
              </span>
              <span className="hidden md:inline-block ml-2.5 text-xs font-medium text-slate-500">
                Engineering Education Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Right Header Actions: Create (Protected) + Search + Admin Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to={isAdminAuthenticated ? '/create' : '/login?redirect=/create'}>
            <Button
              variant="primary"
              size="md"
              className="rounded-full px-4 sm:px-5 bg-teal-700 hover:bg-teal-800"
            >
              {isAdminAuthenticated ? (
                <Plus className="w-4 h-4" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>Create</span>
            </Button>
          </Link>

          {isAdminAuthenticated && (
            <button
              onClick={syncAllToCloud}
              disabled={cloudSyncStatus === 'syncing'}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors",
                cloudSyncStatus === 'offline'
                  ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200"
              )}
              title={cloudSyncMessage || "Sync all local changes to Supabase Cloud"}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", cloudSyncStatus === 'syncing' && "animate-spin")} />
              <span className="hidden sm:inline">
                {cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
              </span>
            </button>
          )}

          <button
            onClick={() => {
              if (location.pathname !== '/') {
                navigate('/?focusSearch=1')
              } else {
                const el = document.getElementById('global-hero-search')
                if (el) el.focus()
              }
            }}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200 cursor-pointer"
            title="Search Laboratories & Experiments"
          >
            <Search className="w-4 h-4" />
          </button>

          {isAdminAuthenticated ? (
            <button
              onClick={async () => {
                await logoutAdmin()
                navigate('/')
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold cursor-pointer"
              title={`Signed in as ${userEmail}. Tap to sign out.`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
              <LogOut className="w-3.5 h-3.5 ml-1 text-slate-500" />
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold"
            >
              <Lock className="w-3.5 h-3.5 text-teal-700" />
              <span>Admin Login</span>
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1 flex">
        <aside
          className={cn(
            'hidden lg:block bg-white border-r border-slate-200 shrink-0 transition-all duration-200',
            desktopSidebarCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-72'
          )}
        >
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            {renderSidebarContent()}
          </div>
        </aside>

        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10">
              <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Menu className="w-4 h-4 text-teal-700" />
                  Menu &amp; History
                </span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderSidebarContent(() => setMobileDrawerOpen(false))}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex-1">{children}</div>

          <footer className="bg-white border-t border-slate-200 mt-16 py-6 px-4 sm:px-8 text-xs text-slate-500">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <strong className="text-slate-800">Virtual Lab Library</strong> — Password-Protected Engineering Lab &amp; HTML 3D Platform
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/departments" className="hover:text-teal-700">Departments</Link>
                <Link to="/laboratories" className="hover:text-teal-700">Laboratories</Link>
                <Link to="/experiments" className="hover:text-teal-700">Experiments</Link>
                <Link to={isAdminAuthenticated ? '/admin' : '/login'} className="text-teal-700 font-semibold inline-flex items-center gap-0.5">
                  {isAdminAuthenticated ? 'Admin Panel' : 'Admin Login'} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
