import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'

import Home         from './pages/Home'
import Monsters     from './pages/Monsters'
import MonsterDetail from './pages/MonsterDetail'
import Weapons      from './pages/Weapons'
import WeaponDetail from './pages/WeaponDetail'
import Builds       from './pages/Builds'
import BuildDetail  from './pages/BuildDetail'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Admin        from './pages/Admin'
import Profile      from './pages/Profile'
import NotFound     from './pages/NotFound'
import Guides       from './pages/Guides'
import GuideDetail  from './pages/GuideDetail'
import Orchestrator from './pages/Orchestrator'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-mhw-dark">
          <Navbar />
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/"              element={<Home />} />
              <Route path="/monsters"      element={<Monsters />} />
              <Route path="/monsters/:id" element={<MonsterDetail />} />
              <Route path="/weapons"       element={<Weapons />} />
              <Route path="/weapons/:id"  element={<WeaponDetail />} />
              <Route path="/guides"       element={<Guides />} />
              <Route path="/guides/:id"   element={<GuideDetail />} />
              <Route path="/orchestrator" element={<Orchestrator />} />
              <Route path="/login"         element={<Login />} />
              <Route path="/register"      element={<Register />} />
              {/* Protected — logged-in users */}
              <Route element={<ProtectedRoute />}>
                <Route path="/builds"      element={<Builds />} />
                <Route path="/builds/:id" element={<BuildDetail />} />
                <Route path="/profile"     element={<Profile />} />
              </Route>
              {/* Admin only */}
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
