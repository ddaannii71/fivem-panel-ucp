// Componente raiz de la aplicacion
// Aqui defino las rutas (URLs) de la aplicacion
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import { PrivateRoute, AdminRoute } from './auth/Guards'

// Componente principal con las rutas
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas que cualquiera puede ver */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />

        {/* Ruta protegida: hace falta estar logueado */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Ruta solo para admins */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
