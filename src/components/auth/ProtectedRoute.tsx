import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading, isUnlocked, unlock } = useAuth();
  const location = useLocation();
  const [password, setPassword] = React.useState('');

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Handle secondary password check for non-customers
  if (role && role !== 'customer' && !isUnlocked) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        maxWidth: '400px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '20px', 
          backgroundColor: 'var(--color-primary-container)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <Loader2 size={32} color="var(--color-primary)" />
        </div>
        <h2 className="serif-italic" style={{ fontSize: '32px', marginBottom: '8px' }}>Security Gate</h2>
        <p style={{ color: 'var(--color-gray-500)', marginBottom: '32px' }}>
          Please enter the administrative password to access this restricted area.
        </p>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!unlock(password)) alert('Invalid administrative password.');
          }} 
          style={{ width: '100%' }}
        >
          <input 
            type="password" 
            placeholder="Admin Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              border: '1px solid var(--surface-container-high)',
              backgroundColor: 'var(--surface-container-low)',
              marginBottom: '16px',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--color-primary)', 
              color: 'white', 
              border: 'none', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Unlock Access
          </button>
        </form>
      </div>
    );
  }

  // If allowedRoles is provided, check if the user's role is permitted
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If user has a role but it's not allowed for this route, redirect to their default home
    if (role === 'super_admin') return <Navigate to="/platform" replace />;
    if (role === 'shop_owner') return <Navigate to="/admin" replace />;
    if (role === 'staff') return <Navigate to="/staff-portal" replace />;
    if (role === 'customer') return <Navigate to="/bookings" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
