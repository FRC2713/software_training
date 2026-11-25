import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppSidebar } from './components/AppSidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ProgressProvider, useProgress } from '@/lib/progress'
import { LessonIndex } from './routes/LessonIndex'
import { LessonView } from './routes/LessonView'

function HeaderProgress() {
  const { user, completedCount, totalLessons, loading } = useProgress()
  if (loading || !user) return null
  return (
    <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
      <span className="tabular-nums font-medium text-foreground">
        {completedCount} / {totalLessons} completed
      </span>
      <span className="hidden sm:inline text-border">·</span>
      <span className="hidden sm:inline truncate max-w-[180px]" title={user.name}>
        {user.name}
      </span>
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <ProgressProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">
                FRC 2713 Software Training
              </span>
              <HeaderProgress />
            </header>
            <Routes>
              <Route path="/" element={<LessonIndex />} />
              <Route path="/lesson/:slug" element={<LessonView />} />
              <Route path="/lesson/:slug/:page" element={<LessonView />} />
            </Routes>
          </SidebarInset>
        </SidebarProvider>
      </ProgressProvider>
    </HashRouter>
  )
}

export default App
