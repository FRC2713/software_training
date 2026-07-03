import { HashRouter, Route, Routes } from 'react-router-dom'
import { LessonIndex } from './routes/LessonIndex'
import { LessonView } from './routes/LessonView'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LessonIndex />} />
        <Route path="/lesson/:slug" element={<LessonView />} />
        <Route path="/lesson/:slug/:page" element={<LessonView />} />
      </Routes>
    </HashRouter>
  )
}

export default App
