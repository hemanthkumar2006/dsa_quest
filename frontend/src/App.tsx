import { Route, Routes } from 'react-router-dom'
import RegionListPage from './pages/RegionListPage'
import LevelListPage from './pages/LevelListPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import GrimoirePage from './pages/GrimoirePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegionListPage />} />
      <Route path="/region/:regionId" element={<LevelListPage />} />
      <Route
        path="/region/:regionId/problem/:problemId"
        element={<ProblemDetailPage />}
      />
      <Route path="/grimoire" element={<GrimoirePage />} />
    </Routes>
  )
}

export default App
