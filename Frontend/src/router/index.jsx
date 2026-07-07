import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import LandingPage       from '../pages/LandingPage'
import AboutPage         from '../pages/AboutPage'
import AuctionListPage   from '../pages/AuctionListPage'
import AuctionDetailPage from '../pages/AuctionDetailPage'
import WinnerPage        from '../pages/WinnerPage'
import LoginPage         from '../pages/LoginPage'
import RegisterPage      from '../pages/RegisterPage'
import AdminPage         from '../pages/admin/AdminPage'
import VehicleFormPage   from '../pages/admin/VehicleFormPage'
import AuctionFormPage   from '../pages/admin/AuctionFormPage'
import ReportsPage       from '../pages/admin/ReportsPage'
import ProfilePage       from '../pages/ProfilePage'
import VehicleListPage   from '../pages/VehicleListPage'
import VehicleDetailPage from '../pages/VehicleDetailPage'
import ChangePasswordPage from '../pages/ChangePasswordPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<LandingPage />} />
      <Route path="/about"          element={<AboutPage />} />
      <Route path="/contact"         element={<Navigate to="/about" replace />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/auctions"       element={<AuctionListPage />} />
      <Route path="/auctions/:id"   element={<AuctionDetailPage />} />
      <Route path="/auctions/:id/winner" element={<WinnerPage />} />
      <Route path="/vehicles"            element={<VehicleListPage />} />
      <Route path="/vehicles/:id"        element={<VehicleDetailPage />} />

      {/* Admin-only */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>
      } />
      <Route path="/admin/vehicles/new" element={
        <ProtectedRoute role="admin"><VehicleFormPage /></ProtectedRoute>
      } />
      <Route path="/admin/vehicles/:id/edit" element={
        <ProtectedRoute role="admin"><VehicleFormPage /></ProtectedRoute>
      } />
      <Route path="/admin/auctions/new" element={
        <ProtectedRoute role="admin"><AuctionFormPage /></ProtectedRoute>
      } />
      <Route path="/admin/auctions/:id/edit" element={
        <ProtectedRoute role="admin"><AuctionFormPage /></ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute role="admin"><ReportsPage /></ProtectedRoute>
      } />

      {/* Buyer */}
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />

      {/* Force password change — no role guard, just auth */}
      <Route path="/change-password" element={
        <ProtectedRoute skipPasswordCheck><ChangePasswordPage /></ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
