import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { createServicePhase1, fetchServicesPhase1 } from '../lib/phase1Data';
import { Plus, Clock3, DollarSign, Loader2, Scissors, Sparkles, Brush, Zap } from 'lucide-react';

export default function ServiceCatalog() {
  const { business, loading: authLoading } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (business?.id) void loadServices();
  }, [business?.id]);

  async function loadServices() {
    if (!business?.id) return;
    setLoading(true);
    const result = await fetchServicesPhase1(business.id);
    setServices(result);
    setLoading(false);
  }

  async function handleCreateService() {
    if (!business?.id) return;
    setCreating(true);
    await createServicePhase1(business.id, `New Service ${services.length + 1}`);
    await loadServices();
    setCreating(false);
  }

  const categories = useMemo(() => {
    const values = Array.from(new Set(services.map((service) => service.category).filter(Boolean)));
    return ['All', ...values];
  }, [services]);

  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter((service) => service.category === activeCategory);

  const averagePrice = services.length > 0
    ? Math.round(services.reduce((sum, service) => sum + service.price, 0) / services.length)
    : 0;

  const getIcon = (category: string) => {
    const value = category.toLowerCase();
    if (value.includes('hair')) return Scissors;
    if (value.includes('color')) return Sparkles;
    if (value.includes('nail')) return Brush;
    return Zap;
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: '720px' }}>
            <Badge variant="primary" style={{ marginBottom: 'var(--space-4)' }}>Phase 1 Service Management</Badge>
            <h2 style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-3)' }}>
              Build a clean <span className="serif-italic">service catalog</span>
            </h2>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-600)' }}>
              Keep services simple, clear, and bookable. Phase 1 focuses on visible offerings, price clarity, duration clarity, and quick setup.
            </p>
          </div>
          <Button variant="secondary" onClick={handleCreateService} isLoading={creating} icon={Plus}>
            Add Starter Service
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Active Services</p>
            <h3>{services.length}</h3>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Average Price</p>
            <h3>ETB {averagePrice}</h3>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Categories</p>
            <h3>{Math.max(categories.length - 1, 0)}</h3>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={activeCategory === category ? 'badge badge-primary' : 'badge badge-outline'}
              style={{
                padding: 'var(--space-3) var(--space-5)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeCategory === category ? 'var(--color-primary-100)' : 'var(--surface-container-low)',
                color: activeCategory === category ? 'var(--color-primary)' : 'var(--color-gray-600)',
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredServices.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '90px 40px' }}>
            <Sparkles size={48} color="var(--color-gray-300)" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ marginBottom: '10px' }}>No services in this view yet</h3>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: '24px' }}>
              Add your first MVP service so customers can start booking.
            </p>
            <Button variant="primary" onClick={handleCreateService} isLoading={creating}>Create First Service</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
            {filteredServices.map((service) => {
              const Icon = getIcon(service.category);
              return (
                <div key={service.id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} />
                    </div>
                    <Badge variant={service.isActive ? 'success' : 'outline'}>{service.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-2xl)', marginBottom: '8px' }}>{service.name}</h3>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: '1.6' }}>{service.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <Badge variant="outline">{service.category}</Badge>
                    <Badge variant="ghost">
                      <Clock3 size={12} style={{ marginRight: '4px' }} />
                      {service.durationLabel}
                    </Badge>
                    <Badge variant="secondary">
                      <DollarSign size={12} style={{ marginRight: '4px' }} />
                      ETB {service.price}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
