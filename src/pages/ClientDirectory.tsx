import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { fetchClientsPhase1 } from '../lib/phase1Data';
import { Loader2, Search, Users, TrendingUp, Phone } from 'lucide-react';

export default function ClientDirectory() {
  const { business, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (business?.id) void loadClients();
  }, [business?.id]);

  async function loadClients() {
    if (!business?.id) return;
    setLoading(true);
    const result = await fetchClientsPhase1(business.id);
    setClients(result);
    setLoading(false);
  }

  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [clients, searchQuery]
  );

  const totalSpend = clients.reduce((sum, client) => sum + client.totalSpend, 0);

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
          <div>
            <Badge variant="primary" style={{ marginBottom: 'var(--space-4)' }}>Phase 1 Client View</Badge>
            <h2 className="serif-italic" style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-3)' }}>Client directory</h2>
            <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-lg)' }}>
              A simple owner-facing directory of customers who already booked with the shop.
            </p>
          </div>
          <div style={{ position: 'relative', minWidth: '320px', flex: '0 0 360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone"
              style={{ width: '100%', padding: '16px 18px 16px 46px', borderRadius: 'var(--radius-lg)', border: 'none', backgroundColor: 'var(--surface-container-lowest)', boxShadow: 'var(--shadow-sm)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Clients</p>
            <h3>{clients.length}</h3>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Directory Spend</p>
            <h3>ETB {totalSpend.toLocaleString()}</h3>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Returning Signals</p>
            <h3>{clients.filter((client) => client.visitCount > 1).length}</h3>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '90px 40px' }}>
            <Users size={48} color="var(--color-gray-300)" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ marginBottom: '10px' }}>No clients found</h3>
            <p style={{ color: 'var(--color-gray-500)' }}>Once bookings come in, clients will appear here with visit timing and spend context.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-6)' }}>
            {filteredClients.map((client) => (
              <div key={client.id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', overflow: 'hidden', backgroundColor: 'var(--surface-container-low)' }}>
                  <img src={client.avatarUrl} alt={client.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-2xl)', marginBottom: '4px' }}>{client.name}</h3>
                      <p style={{ color: 'var(--color-gray-500)', fontSize: '13px' }}>Member since {client.sinceLabel}</p>
                    </div>
                    <Badge variant={client.visitCount > 1 ? 'success' : 'outline'}>
                      {client.visitCount > 1 ? 'Returning' : 'Newer'}
                    </Badge>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-container-low)' }}>
                      <p className="eyebrow" style={{ marginBottom: '6px' }}>Last Visit</p>
                      <p style={{ fontWeight: 'bold' }}>{client.lastVisitLabel}</p>
                    </div>
                    <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-container-low)' }}>
                      <p className="eyebrow" style={{ marginBottom: '6px' }}>Total Spend</p>
                      <p style={{ fontWeight: 'bold' }}>{client.totalSpendLabel}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--color-gray-600)', fontSize: '14px' }}>
                    <Phone size={14} />
                    <span>{client.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <TrendingUp size={18} color="var(--color-secondary)" />
              <p className="eyebrow" style={{ marginBottom: 0 }}>Retention Insight</p>
            </div>
            <p style={{ color: 'var(--color-gray-600)', lineHeight: '1.7' }}>
              Phase 1 keeps retention simple: see who came back, who spent the most, and who the team should follow up with after successful bookings.
            </p>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Next Phase</p>
            <p style={{ color: 'var(--color-gray-600)', lineHeight: '1.7', marginBottom: 'var(--space-4)' }}>
              In Phase 2 we can add segmentation, loyalty tiers, client notes, and targeted review or reminder workflows.
            </p>
            <Button variant="ghost">Keep refining directory</Button>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
