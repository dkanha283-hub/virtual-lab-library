import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import {
  AllDepartmentsPage,
  AllLaboratoriesPage,
  AllExperimentsPage,
  RecentlyVisitedPage,
  BookmarksPage,
  MyContributionsPage,
} from './pages/CatalogPages'
import { CreateExperimentPage } from './pages/CreateExperimentPage'
import { DepartmentPage } from './pages/DepartmentPage'
import { LaboratoryPage } from './pages/LaboratoryPage'
import { ExperimentPage } from './pages/ExperimentPage'
import { AdminPage } from './pages/AdminPage'
import { AdminLoginPage } from './pages/AdminLoginPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/departments" element={<AllDepartmentsPage />} />
        <Route path="/laboratories" element={<AllLaboratoriesPage />} />
        <Route path="/experiments" element={<AllExperimentsPage />} />
        <Route path="/recent" element={<RecentlyVisitedPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/contributions" element={<MyContributionsPage />} />
        <Route path="/create" element={<CreateExperimentPage />} />
        <Route path="/edit/:expSlug" element={<CreateExperimentPage />} />
        <Route path="/department/:deptSlug" element={<DepartmentPage />} />
        <Route path="/laboratory/:labSlug" element={<LaboratoryPage />} />
        <Route path="/experiment/:expSlug" element={<ExperimentPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AppShell>
  )
}
