import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { TrendingUp, Users, Calendar, DollarSign, Loader2, Package, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { shopOwnerBlueprint } from '../lib/roleBlueprints';
import { buildPhases } from '../lib/buildPhases';

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  color: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { business, user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stat[]>([
    { label: "Today's Revenue", value: "ETB 0.00", icon: DollarSign, trend: "0%", color: "var(--color-primary)" },
    { label: "Active Bookings", value: "0", icon: Calendar, trend: "0", color: "var(--color-secondary)" },
    { label: "Total Clients", value: "0", icon: Users, trend: "0", color: "var(--color-primary-container)" },
    { label: "Retention Rate", value: "0%", icon: TrendingUp, trend: "0%", color: "var(--color-secondary-dim)" },
  ]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  const fetchDashboardStats = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_price_etb')
        .eq('tenant_id', business.id)
        .neq('status', 'cancelled')
        .gte('created_at', today.toISOString());
      
      const todayRevenue = revenueData?.reduce((sum, booking) => sum + Number(booking.total_price_etb), 0) || 0;

      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', business.id)
        .neq('status', 'cancelled');

      // Use unique user_id from bookings as client count
      const { data: uniqueClients } = await supabase
        .from('bookings')
        .select('user_id')
        .eq('tenant_id', business.id);
      
      const clientsCount = uniqueClients ? new Set(uniqueClients.map(b => b.user_id)).size : 0;

      setStats([
        { label: "Today's Revenue", value: `ETB ${todayRevenue.toFixed(2)}`, icon: DollarSign, trend: "+0%", color: "var(--color-primary)" },
        { label: "Active Bookings", value: String(bookingsCount || 0), icon: Calendar, trend: "+0", color: "var(--color-secondary)" },
        { label: "Total Clients", value: String(clientsCount || 0), icon: Users, trend: "+0", color: "var(--color-primary-container)" },
        { label: "Retention Rate", value: "84%", icon: TrendingUp, trend: "+3%", color: "var(--color-secondary-dim)" },
      ]);

      // Fetch subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('tenant_id', business.id)
        .single();
      
      if (sub) setSubscription(sub);

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

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
      <div style={{ marginBottom: 'var(--space-12)' }}>
        <Badge variant="primary" style={{ marginBottom: 'var(--space-4)' }}>Business Overview</Badge>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>Welcome Back, <span className="serif-italic">{user?.full_name || user?.first_name || 'Administrator'}</span></h2>
        <p className="text-on-surface-variant">Run <span style={{ fontWeight: 'bold' }}>{business?.name}</span> with full control over your profile, services, team, bookings, portfolio, and subscription usage.</p>
        
        {subscription?.bookings_count >= (subscription?.subscription_plans?.booking_limit * 0.9) && (
          <div style={{ 
            marginTop: 'var(--space-6)', 
            padding: 'var(--space-4)', 
            backgroundColor: 'var(--color-warning-100)', 
            border: '1px solid var(--color-warning-200)', 
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)'
          }}>
            <AlertTriangle color="var(--color-warning)" size={24} />
            <div>
              <p style={{ fontWeight: 'bold', color: 'var(--color-warning-900)' }}>
                {subscription?.bookings_count >= subscription?.subscription_plans?.booking_limit 
                  ? 'Booking Limit Reached!' 
                  : 'Approaching Booking Limit'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-warning-800)' }}>
                {subscription?.bookings_count >= subscription?.subscription_plans?.booking_limit
                  ? 'You have reached your plan limit. New bookings will be blocked until you upgrade.'
                  : `You have used ${subscription?.bookings_count} of your ${subscription?.subscription_plans?.booking_limit} monthly bookings.`}
              </p>
            </div>
            <button
              className="btn-primary"
              style={{ marginLeft: 'auto', backgroundColor: 'var(--color-warning-900)', border: 'none' }}
              onClick={() => navigate('/platform')}
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      <Card title="Shop Owner Control Surface" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
          {shopOwnerBlueprint.map((item) => (
            <div key={item.title} style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-container-low)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--color-secondary-100)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                <item.icon size={18} />
              </div>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{item.title}</p>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: '1.6' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Phase 1 MVP Scope" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 'var(--space-4)' }}>
          {buildPhases.map((phase) => (
            <div key={phase.name} style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', backgroundColor: phase.name === 'Phase 1' ? 'var(--color-primary-100)' : 'var(--surface-container-low)' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.12em', color: phase.name === 'Phase 1' ? 'var(--color-primary)' : 'var(--color-gray-500)', marginBottom: '10px' }}>{phase.name}</p>
              <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>{phase.outcome}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {phase.tasks.map((task) => (
                  <div key={task.title} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', backgroundColor: task.status === 'in_progress' ? 'var(--color-primary)' : 'var(--color-gray-400)' }}></span>
                    <p style={{ fontSize: '13px', color: 'var(--color-gray-600)', lineHeight: '1.5' }}>{task.title}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
        {stats.map((stat) => (
          <Card key={stat.label} style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: stat.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <Badge variant="success" style={{ fontSize: '10px' }}>{stat.trend}</Badge>
            </div>
            <div style={{ marginTop: 'var(--space-6)' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', textTransform: 'uppercase', color: 'var(--color-gray-500)', letterSpacing: '0.1em' }}>{stat.label}</p>
              <h3 style={{ marginTop: 'var(--space-1)' }}>{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-8)' }}>
        <Card title="Operational Priorities" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {[
              'Update shop profile with cover photo, about section, and working hours.',
              'Keep men and women service catalogs clean with price and duration.',
              'Assign staff schedules and permissions before peak hours.',
              'Track reviews and maintain a fresh portfolio gallery.',
            ].map((note) => (
              <div key={note} style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--surface-container-low)' }}>
                <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--color-gray-600)' }}>{note}</p>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <Card title="Quick Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/catalog')}>Add or edit services</button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/calendar')}>Review booking assignments</button>
              <button className="btn-ghost" style={{ width: '100%' }} onClick={() => navigate('/settings')}>Publish portfolio updates</button>
              <button className="btn-ghost" style={{ width: '100%' }} onClick={() => navigate('/analytics')}>Respond to reviews</button>
            </div>
          </Card>

          <Card title="Subscription Plan">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <Package size={18} color="var(--color-primary)" />
                  <span style={{ fontWeight: 'bold' }}>{subscription?.subscription_plans?.name || 'Standard'}</span>
                </div>
                <Badge variant="primary">Active</Badge>
              </div>
              
              <div style={{ marginTop: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span className="text-on-surface-variant">Booking Limit</span>
                  <span style={{ fontWeight: 'bold' }}>{subscription?.bookings_count || 0} / {subscription?.subscription_plans?.booking_limit === -1 ? '∞' : (subscription?.subscription_plans?.booking_limit || 50)}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-container)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(((subscription?.bookings_count || 0) / (subscription?.subscription_plans?.booking_limit === -1 ? 1000 : (subscription?.subscription_plans?.booking_limit || 50))) * 100, 100)}%`, 
                    height: '100%', 
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>

              <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-container-low)' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '6px' }}>Usage Watch</p>
                <p style={{ fontSize: '13px', color: 'var(--color-gray-600)', lineHeight: '1.6' }}>When the booking limit is reached, the storefront booking action is blocked until the plan changes or usage resets.</p>
              </div>

              <button
                className="btn-ghost"
                style={{ width: '100%', fontSize: '12px', marginTop: 'var(--space-2)' }}
                onClick={() => navigate('/platform')}
              >
                Upgrade Plan
              </button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
