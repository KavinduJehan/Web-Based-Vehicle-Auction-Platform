import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import AuctionListPage   from '../pages/AuctionListPage'
import AuctionDetailPage from '../pages/AuctionDetailPage'
import WinnerPage        from '../pages/WinnerPage'
import LoginPage         from '../pages/LoginPage'
import RegisterPage      from '../pages/RegisterPage'
import AdminPage         from '../pages/admin/AdminPage'
import VehicleFormPage   from '../pages/admin/VehicleFormPage'
import AuctionFormPage   from '../pages/admin/AuctionFormPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<Navigate to="/auctions" replace />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/auctions"       element={<AuctionListPage />} />
      <Route path="/auctions/:id"   element={<AuctionDetailPage />} />
      <Route path="/auctions/:id/winner" element={<WinnerPage />} />

      {/* Admin-only */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>
      } />
      <Route path="/admin/vehicles/new" element={
        <ProtectedRoute role="admin"><VehicleFormPage /></ProtectedRoute>
      } />
      <Route path="/admin/auctions/new" element={
        <ProtectedRoute role="admin"><AuctionFormPage /></ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/auctions" replace />} />
    </Routes>
  )
}
