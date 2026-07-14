import { Route, Routes } from 'react-router-dom'
import RegionListPage from './pages/RegionListPage'
import LevelListPage from './pages/LevelListPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import GrimoirePage from './pages/GrimoirePage'
import ReviewPage from './pages/ReviewPage'
import SocketTestPage from './pages/SocketTestPage'

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
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/socket-test" element={<SocketTestPage />} />
    </Routes>
  )
}

export default App
