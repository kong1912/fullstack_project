import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
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
import BuildCreate  from './pages/BuildCreate'
import BuildStep1   from './pages/BuildStep1'
import BuildStep2   from './pages/BuildStep2'
import BuildStep3   from './pages/BuildStep3'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-mhw-dark transition-colors duration-300">
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
              <Route path="/login"         element={<Login />} />
              <Route path="/register"      element={<Register />} />
              {/* Protected — logged-in users */}
              <Route element={<ProtectedRoute />}>
                <Route path="/builds"      element={<Builds />} />
                <Route path="/builds/:id" element={<BuildDetail />} />
                {/* Fn 2.4 C1: Nested routes — <Outlet /> in BuildCreate, layout never re-mounts */}
                <Route path="/builds/create" element={<BuildCreate />}>
                  <Route index element={<Navigate to="step1" replace />} />
                  <Route path="step1" element={<BuildStep1 />} />
                  <Route path="step2" element={<BuildStep2 />} />
                  <Route path="step3" element={<BuildStep3 />} />
                </Route>
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
    </ThemeProvider>
  )
}

export default App
