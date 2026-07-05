import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppSidebar } from './components/AppSidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { LessonIndex } from './routes/LessonIndex'
import { LessonView } from './routes/LessonView'

function App() {
  return (
    <HashRouter>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <span className="text-sm font-medium text-muted-foreground">
              FRC 2713 Software Training
            </span>
          </header>
          <Routes>
            <Route path="/" element={<LessonIndex />} />
            <Route path="/lesson/:slug" element={<LessonView />} />
            <Route path="/lesson/:slug/:page" element={<LessonView />} />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </HashRouter>
  )
}

export default App
