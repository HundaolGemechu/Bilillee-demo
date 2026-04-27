import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { customerJourneyBlueprint } from '../lib/roleBlueprints';
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
  Scissors,
  Zap,
  Brush,
  ChevronRight,
  Bell,
  ShieldCheck,
  Users,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [filteredShops, setFilteredShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    filterShops();
  }, [searchQuery, selectedCategory, shops]);

  async function fetchShops() {
    setLoading(true);
    const { data } = await supabase
      .from('shops')
      .select('*')
      .eq('status', 'active');

    if (data) {
      setShops(data);
      setFilteredShops(data);
    }
    setLoading(false);
  }

  function filterShops() {
    let filtered = [...shops];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((shop) =>
        shop.name.toLowerCase().includes(q) ||
        shop.description?.toLowerCase().includes(q) ||
        shop.city?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      const categoryMatchers: Record<string, string[]> = {
        haircut: ['cut', 'fade', 'barber', 'trim'],
        beard: ['beard', 'shave'],
        color: ['color', 'balayage', 'highlight'],
        nails: ['nail', 'manicure', 'pedicure'],
      };

      const matchers = categoryMatchers[selectedCategory] || [];
      filtered = filtered.filter((shop) => {
        const haystack = `${shop.name} ${shop.description || ''}`.toLowerCase();
        return matchers.some((term) => haystack.includes(term));
      });
    }

    setFilteredShops(filtered);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterShops();
  };

  const categories = [
    { id: 'haircut', name: 'Haircuts', icon: Scissors, color: 'var(--color-primary)' },
    { id: 'beard', name: 'Beard & Shave', icon: Zap, color: 'var(--color-secondary)' },
    { id: 'color', name: 'Hair Color', icon: Sparkles, color: 'var(--color-primary-container)' },
    { id: 'nails', name: 'Nails', icon: Brush, color: 'var(--color-secondary-dim)' },
  ];

  const heroStats = [
    { value: '4 roles', label: 'clear platform access' },
    { value: '30 min', label: 'smart reminder support' },
    { value: '1 flow', label: 'fast booking to payment' },
  ];

  const trustSignals = [
    { icon: ShieldCheck, title: 'Verified shops', body: 'Shops can be approved and monitored before they appear live.' },
    { icon: Users, title: 'Visible staff profiles', body: 'Customers can compare barbers and stylists before they choose.' },
    { icon: Bell, title: 'Reminder-first UX', body: 'Confirmation, day reminder, 30-minute, and go-now notifications.' },
  ];

  return (
    <PublicLayout
      onServicesClick={() => {
        document.getElementById('home-services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
      onShopClick={() => {
        document.getElementById('home-shops')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
      onAboutClick={() => {
        document.getElementById('home-cta')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
    >
      <div className="page-stack">
        <section className="hero-grid">
          <div className="hero-copy">
            <Badge variant="primary" style={{ marginBottom: '18px' }}>Fast booking for beauty businesses</Badge>
            <h1 className="hero-title">
              Find trusted shops, compare real teams, and <span>book in seconds.</span>
            </h1>
            <p className="hero-subtitle">
              Bilillee helps customers discover barber shops and salons through visible staff profiles,
              service clarity, portfolio trust, and reminder-driven booking.
            </p>
            <form onSubmit={handleSearch} className="hero-search">
              <div className="hero-search-input">
                <Search size={18} />
                <Input
                  placeholder="Search shops, services, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary">Explore</Button>
            </form>
            <div className="hero-stats">
              {heroStats.map((item) => (
                <div key={item.label} className="hero-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-card">
              <p className="eyebrow">Customer Flow</p>
              <h3 className="serif-italic">One storefront, all trust signals</h3>
              <div className="flow-list">
                <div>
                  <span>01</span>
                  <p>Browse shops by rating, photo, and location.</p>
                </div>
                <div>
                  <span>02</span>
                  <p>Open the shop page and inspect staff, services, and portfolio.</p>
                </div>
                <div>
                  <span>03</span>
                  <p>Book, pay by cash or transfer, and receive reminder notifications.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="home-services" className="content-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Browse</p>
              <h2 className="serif-italic">Shop by service</h2>
            </div>
            <Button variant="ghost" onClick={() => {
              setSelectedCategory(null);
              document.getElementById('home-shops')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}>
              View All Services <ArrowRight size={16} />
            </Button>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                onClick={() => {
                  const next = selectedCategory === cat.id ? null : cat.id;
                  setSelectedCategory(next);
                  window.setTimeout(() => {
                    document.getElementById('home-shops')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 0);
                }}
                className={`interactive-card ${selectedCategory === cat.id ? 'selected' : ''}`}
                style={{ padding: '32px' }}
              >
                <div className="feature-icon" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                  <cat.icon size={26} />
                </div>
                <h3 className="serif-italic" style={{ fontSize: '24px', marginBottom: '10px' }}>{cat.name}</h3>
                <p>Fast discovery for the most-booked service categories across the marketplace.</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="home-about" className="content-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Refined Experience</p>
              <h2 className="serif-italic">Customer journey</h2>
            </div>
          </div>
          <div className="journey-grid">
            {customerJourneyBlueprint.map((item) => (
              <Card key={item.title} style={{ padding: '26px' }}>
                <div className="feature-icon">
                  <item.icon size={20} />
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{item.title}</h3>
                <p>{item.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="home-shops" className="content-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Why it feels better</p>
              <h2 className="serif-italic">Trust comes first</h2>
            </div>
          </div>
          <div className="trust-grid">
            {trustSignals.map((item) => (
              <Card key={item.title} style={{ padding: '26px' }}>
                <div className="feature-icon">
                  <item.icon size={20} />
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{item.title}</h3>
                <p>{item.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Marketplace</p>
              <h2 className="serif-italic">Top-rated shops</h2>
            </div>
          </div>

          <div className="shop-grid">
            {loading ? (
              [1, 2, 3].map((i) => (
                <Card key={i} style={{ height: '380px', backgroundColor: 'var(--surface-container-low)' }}>
                  <div />
                </Card>
              ))
            ) : filteredShops.length > 0 ? (
              filteredShops.map((shop) => (
                <Card
                  key={shop.id}
                  className="shop-card"
                  style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => navigate(`/shop/${shop.slug}`)}
                >
                  <div className="shop-card-media">
                    <img
                      src={shop.logo_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=900'}
                      alt={shop.name}
                    />
                    <div className="shop-card-rating">
                      <Star size={12} fill="var(--color-primary)" color="var(--color-primary)" />
                      <span>{shop.avg_rating || '5.0'}</span>
                    </div>
                  </div>
                  <div className="shop-card-body">
                    <div className="shop-card-header">
                      <div>
                        <p className="eyebrow" style={{ marginBottom: '6px' }}>{shop.city || 'Addis Ababa'}</p>
                        <h3 className="serif-italic" style={{ fontSize: '26px' }}>{shop.name}</h3>
                      </div>
                    </div>
                    <p className="shop-card-description">
                      {shop.description || 'Fast booking, visible staff profiles, trusted reviews, and strong portfolio storytelling.'}
                    </p>
                    <div className="shop-card-footer">
                      <div className="meta-inline">
                        <MapPin size={14} />
                        <span>{shop.address?.split(',')[0] || 'Downtown'}</span>
                      </div>
                      <button type="button" className="link-button" onClick={() => navigate(`/shop/${shop.slug}`)}>
                        Open Shop <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="empty-panel">
                <p>No shops match your criteria right now.</p>
                <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>Clear Filters</Button>
              </Card>
            )}
          </div>
        </section>

        <section id="home-cta" className="cta-panel">
          <div>
            <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>For businesses</p>
            <h2 className="serif-italic">Run your shop with subscriptions, staff transparency, and fast booking.</h2>
          </div>
          <Button
            variant="ghost"
            style={{ backgroundColor: 'white', color: 'var(--color-primary)', border: 'none' }}
            onClick={() => navigate('/admin')}
          >
            Explore Back Office
          </Button>
        </section>
      </div>
    </PublicLayout>
  );
}
