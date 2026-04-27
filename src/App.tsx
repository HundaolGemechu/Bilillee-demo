import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ServiceCatalog from './pages/ServiceCatalog';
import AppointmentCalendar from './pages/AppointmentCalendar';
import ClientDirectory from './pages/ClientDirectory';
import TeamManagement from './pages/TeamManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import StorefrontSettings from './pages/StorefrontSettings';
import Home from './pages/Home';
import ClientBookings from './pages/ClientBookings';
import PublicShop from './pages/PublicShop';
import PlatformAdmin from './pages/PlatformAdmin';
import StaffDashboard from './pages/StaffDashboard';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop/:slug" element={<PublicShop />} />
        
        {/* Client Routes */}
        <Route path="/bookings" element={<ClientBookings />} />

        {/* Admin/Owner Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['shop_owner', 'super_admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/platform" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <PlatformAdmin />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={['super_admin', 'shop_owner']}>
            <ReportsAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['super_admin', 'shop_owner']}>
            <StorefrontSettings />
          </ProtectedRoute>
        } />
        <Route path="/staff-portal" element={
          <ProtectedRoute allowedRoles={['staff', 'super_admin']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        {/* Specialist/Staff Routes */}
        <Route path="/catalog" element={
          <ProtectedRoute allowedRoles={['super_admin', 'shop_owner', 'staff']}>
            <ServiceCatalog />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute allowedRoles={['super_admin', 'shop_owner', 'staff']}>
            <AppointmentCalendar />
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute allowedRoles={['super_admin', 'shop_owner', 'staff']}>
            <ClientDirectory />
          </ProtectedRoute>
        } />
        <Route path="/team" element={
          <ProtectedRoute allowedRoles={['super_admin', 'shop_owner']}>
            <TeamManagement />
          </ProtectedRoute>
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
