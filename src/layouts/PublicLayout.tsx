import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ArrowRight,
  Trash2,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

interface PublicLayoutProps {
  children: React.ReactNode;
  businessName?: string;
  onServicesClick?: () => void;
  onShopClick?: () => void;
  onAboutClick?: () => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  businessName = 'Bilillee',
  onServicesClick,
  onShopClick,
  onAboutClick,
}) => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { items: cartItems, removeItem, total } = useCart();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const canAccessBackOffice = ['super_admin', 'shop_owner', 'staff'].includes(role || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    setIsMenuOpen(false);
    navigate(`/?q=${encodeURIComponent(searchQuery)}`);
  };

  const navItems = [
    { label: 'Explore', action: () => (onShopClick ? onShopClick() : navigate('/')) },
    { label: 'Services', action: () => (onServicesClick ? onServicesClick() : navigate('/')) },
    { label: 'About', action: () => (onAboutClick ? onAboutClick() : navigate('/')) },
    { label: 'My Bookings', action: () => navigate('/bookings') },
  ];

  return (
    <div className="public-shell">
      <nav className="public-nav">
        <div className="public-nav-inner">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="brand-lockup"
          >
            <div className="brand-mark">B</div>
            <div className="brand-wordmark">
              <span className="serif-italic">{businessName}</span>
              <span className="brand-tag">Explore</span>
            </div>
          </button>

          <div className={`public-nav-links ${isMenuOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="public-nav-link"
              >
                {item.label}
              </button>
            ))}
            {canAccessBackOffice && (
              <button
                type="button"
                onClick={() => navigate(role === 'staff' ? '/staff-portal' : '/admin')}
                className="public-nav-link accent"
              >
                Back Office
              </button>
            )}
          </div>

          <div className="public-nav-actions">
            <button type="button" className="icon-button" onClick={() => setIsSearchOpen(true)} aria-label="Open search">
              <Search size={18} />
            </button>
            <button type="button" className="icon-button cart-button" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <ShoppingBag size={18} />
              {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
            </button>
            <button type="button" className="icon-button" onClick={() => navigate('/bookings')} aria-label="Open account">
              <User size={18} />
            </button>
            <button
              type="button"
              className="icon-button nav-toggle"
              onClick={() => setIsMenuOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {isSearchOpen && (
        <div className="surface-overlay">
          <div className="surface-dialog search-dialog">
            <div className="surface-dialog-header">
              <div>
                <p className="eyebrow">Search</p>
                <h2 className="serif-italic">Find your next appointment</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSearch} className="search-form">
              <Input
                autoFocus
                placeholder="Search barbers, salons, services, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="primary">Search</Button>
            </form>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="surface-overlay" onClick={() => setIsCartOpen(false)}>
          <aside className="surface-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="surface-dialog-header">
              <div>
                <p className="eyebrow">Cart</p>
                <h2 className="serif-italic">Your selections</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <Card key={item.id} style={{ padding: '20px', border: '1px solid var(--surface-container-low)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="eyebrow" style={{ marginBottom: 0 }}>{item.shopName}</span>
                      <button type="button" className="icon-button subtle" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.name}</h4>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{item.price}</span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="empty-state">
                  <ShoppingBag size={42} />
                  <p>Your booking cart is empty.</p>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="drawer-footer">
                <div className="drawer-total">
                  <span>Subtotal</span>
                  <strong>ETB {total}</strong>
                </div>
                <Button variant="primary" icon={ArrowRight}>Complete Booking</Button>
              </div>
            )}
          </aside>
        </div>
      )}

      <main className="public-main">{children}</main>

      <footer className="public-footer">
        <div className="public-footer-grid">
          <div>
            <h2 className="serif-italic" style={{ fontSize: '24px', marginBottom: '14px' }}>Bilillee</h2>
            <p>
              The booking platform built for barbers, salons, and beauty professionals across Ethiopia.
            </p>
          </div>
          <div>
            <p className="eyebrow">Platform</p>
            <div className="footer-links">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Explore Shops</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Subscriptions</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Owner Stories</a>
            </div>
          </div>
          <div>
            <p className="eyebrow">Support</p>
            <div className="footer-links">
              <a href="#" onClick={(e) => e.preventDefault()}>Booking Help</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Safety Standards</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            </div>
          </div>
          <div>
            <p className="eyebrow">{user ? 'Back Office' : 'Get Started'}</p>
            <div className="footer-links">
              {user ? (
                <>
                  {role === 'super_admin' && (
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/platform'); }}>
                      <LayoutDashboard size={14} />
                      Platform Admin
                    </a>
                  )}
                  {(role === 'shop_owner' || role === 'super_admin') && (
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>
                      <LayoutDashboard size={14} />
                      Shop Dashboard
                    </a>
                  )}
                  {role === 'staff' && (
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/staff-portal'); }}>
                      <LayoutDashboard size={14} />
                      Staff Portal
                    </a>
                  )}
                  {role === 'customer' && (
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/bookings'); }}>
                      <LayoutDashboard size={14} />
                      My Bookings
                    </a>
                  )}
                </>
              ) : (
                <>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/bookings'); }}>
                    <LayoutDashboard size={14} />
                    My Bookings
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                    <LayoutDashboard size={14} />
                    Explore Shops
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="public-footer-bottom">© 2026 Bilillee. Built for fast, trusted beauty booking.</div>
      </footer>
    </div>
  );
};
