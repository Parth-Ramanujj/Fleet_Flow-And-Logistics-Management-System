import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './layouts/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Dispatcher from './pages/Dispatcher'
import Vehicles from './pages/Vehicles'
import Analytics from './pages/Analytics'
import Drivers from './pages/Drivers'
import Maintenance from './pages/Maintenance'
import Fuel from './pages/Fuel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes wrapped in Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* All roles can see the dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Managers + Dispatchers */}
              <Route element={<ProtectedRoute allowedRoles={['manager', 'dispatcher']} />}>
                <Route path="/trips" element={<Dispatcher />} />
              </Route>

              {/* Managers + Safety Officers */}
              <Route element={<ProtectedRoute allowedRoles={['manager', 'safety']} />}>
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/drivers" element={<Drivers />} />
              </Route>

              {/* Managers + Financial Analysts */}
              <Route element={<ProtectedRoute allowedRoles={['manager', 'finance']} />}>
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/fuel" element={<Fuel />} />
                <Route path="/analytics" element={<Analytics />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
