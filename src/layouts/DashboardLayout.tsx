import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Tag, 
  BarChart3, 
  Layout, 
  Settings,
  Plus,
  Bell,
  Search,
  User as UserIcon,
  ExternalLink,
  Shield,
  Briefcase
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { roleDisplayNames } from '../lib/roleBlueprints';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  const allMenuItems = [
    { name: 'Platform Admin', icon: Shield, path: '/platform', roles: ['super_admin'] },
    { name: 'Owner Dashboard', icon: Home, path: '/admin', roles: ['shop_owner', 'super_admin'] },
    { name: 'Staff Portal', icon: Briefcase, path: '/staff-portal', roles: ['staff', 'super_admin'] },
    { name: 'Services', icon: Tag, path: '/catalog', roles: ['shop_owner', 'super_admin', 'staff'] },
    { name: 'Bookings', icon: Calendar, path: '/calendar', roles: ['shop_owner', 'super_admin', 'staff'] },
    { name: 'Customers', icon: Users, path: '/clients', roles: ['shop_owner', 'super_admin', 'staff'] },
    { name: 'Team', icon: Layout, path: '/team', roles: ['shop_owner', 'super_admin'] },
    { name: 'Reports', icon: BarChart3, path: '/analytics', roles: ['shop_owner', 'super_admin'] },
    { name: 'Shop Profile', icon: Settings, path: '/settings', roles: ['shop_owner', 'super_admin'] },
  ];

  const menuItems = allMenuItems.filter(item => 
    !item.roles || (role && item.roles.includes(role))
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div style={{ marginBottom: 'var(--space-12)', paddingLeft: 'var(--space-4)' }}>
          <h1 className="serif-italic" style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-primary)' }}>
            Bilillee
          </h1>
          <p style={{ fontSize: '10px', fontWeight: 'var(--font-bold)', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-gray-500)', marginTop: 'var(--space-1)' }}>
            Management Portal
          </p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `btn-ghost ${isActive ? 'active' : ''}`
              }
              style={{ justifyContent: 'flex-start', width: '100%', gap: 'var(--space-3)' }}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
          <a
            href="/"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-3)', 
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: 'bold',
              marginTop: 'var(--space-4)',
              border: '1px solid var(--color-primary-200)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <ExternalLink size={16} />
            <span>View Storefront</span>
          </a>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)' }}>
          <Button variant="primary" style={{ width: '100%', gap: 'var(--space-2)' }} onClick={() => navigate('/calendar')}>
            <Plus size={16} />
            <span>New Booking</span>
          </Button>
          
          <div style={{ 
            marginTop: 'var(--space-8)', 
            paddingTop: 'var(--space-6)', 
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            borderTop: '1px solid var(--surface-container)'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: 'var(--radius-full)', 
              backgroundColor: 'var(--color-primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <UserIcon size={20} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)', textTransform: 'uppercase' }}>
                {user?.full_name || user?.email?.split('@')[0] || 'Account'}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--color-gray-500)' }}>
                {role ? roleDisplayNames[role] || 'Account' : 'Account'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-500)', backgroundColor: 'var(--surface-container-low)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', width: '300px' }}>
                <Search size={16} />
                <span style={{ fontSize: 'var(--text-sm)' }}>Search anything...</span>
             </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Button variant="ghost" style={{ padding: 'var(--space-2)', minWidth: '0' }} onClick={() => navigate('/calendar')}><Bell size={20} /></Button>
            <Button variant="ghost" style={{ padding: 'var(--space-2)', minWidth: '0' }} onClick={() => navigate('/settings')}><Settings size={20} /></Button>
          </div>
        </header>
        
        <div className="page-canvas">
          {children}
        </div>
      </main>
    </div>
  );
}
