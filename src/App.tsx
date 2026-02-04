import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { LandingPage } from '@/pages/landing'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardHome } from '@/pages/dashboard'
import { TasksPage } from '@/pages/tasks'
import { HabitsPage } from '@/pages/habits'
import { FinancePage } from '@/pages/finance'
import { FitnessPage } from '@/pages/fitness'
import { NotesPage } from '@/pages/notes'
import { Spinner } from '@/components/ui/spinner'

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingPage />
  }

  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/fitness" element={<FitnessPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </Router>
  )
}

export default App
