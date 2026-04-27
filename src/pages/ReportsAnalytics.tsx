import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { 
  TrendingUp, 
  Smile, 
  Sparkles, 
  Scissors,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface ChartData {
  month: string;
  height: string;
  value: string;
  active: boolean;
}

interface StaffMetric {
  name: string;
  role: string;
  retention: string;
  revenue: string;
  color: string;
  status: string;
  image: string;
}

interface StaffEntry {
  id: string;
  role: string;
  user_id: string;
  profile: {
    full_name: string;
  } | null;
}

export default function ReportsAnalytics() {
  const { business, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueStats, setRevenueStats] = useState({ total: 0, conversion: 0 });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [staffMetrics, setStaffMetrics] = useState<StaffMetric[]>([]);

  const fetchAnalyticsData = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const months = Array.from({ length: 6 }).map((_, i) => subMonths(new Date(), 5 - i));
      
      const chartPromises = months.map(async (month, i) => {
        const start = startOfMonth(month).toISOString();
        const end = endOfMonth(month).toISOString();
        
        const { data } = await supabase
          .from('transactions')
          .select('amount')
          .eq('shop_id', business.id)
          .eq('status', 'confirmed')
          .gte('created_at', start)
          .lte('created_at', end);
        
        const total = data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        return {
          month: format(month, 'MMM'),
          height: `${Math.min(100, (total / 1000) * 10 || 10)}%`,
          value: `ETB ${(total / 1000).toFixed(1)}k`,
          active: i === 5
        };
      });

      const resolvedChartData = await Promise.all(chartPromises);
      setChartData(resolvedChartData);

      const { data: staffData } = await supabase
        .from('staff')
        .select(`
          id,
          role,
          user_id,
          profile:profiles!user_id (full_name)
        `)
        .eq('tenant_id', business.id);

      if (staffData) {
        const metricsPromises = (staffData as unknown as StaffEntry[]).map(async (item) => {
          const { data: apts } = await supabase
            .from('bookings')
            .select('id, status')
            .eq('staff_id', item.user_id);
          
          const { data: txns } = await supabase
            .from('transactions')
            .select('amount')
            .eq('shop_id', business.id)
            .limit(10);
          
          const revenue = txns?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
          const confirmedCount = apts?.filter(a => a.status === 'confirmed').length || 0;
          const totalCount = apts?.length || 1;
          const retention = Math.round((confirmedCount / totalCount) * 100);

          return {
            name: item.profile?.full_name || 'Staff Member',
            role: item.role || 'Staff',
            retention: `${retention}%`,
            revenue: `ETB ${revenue.toLocaleString()}`,
            color: retention > 80 ? "var(--color-secondary)" : "var(--color-primary)",
            status: retention > 80 ? "Top Performer" : "Steady Growth",
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.profile?.full_name || 'U')}&background=random`
          };
        });
        const resolvedMetrics = await Promise.all(metricsPromises);
        setStaffMetrics(resolvedMetrics);
      }

      const { data: totalRev } = await supabase
        .from('transactions')
        .select('amount')
        .eq('shop_id', business.id)
        .eq('status', 'confirmed');
      
      const total = totalRev?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      setRevenueStats({ total, conversion: 32.8 });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--space-8)', alignItems: 'end' }}>
          <div style={{ gridColumn: 'span 5' }}>
            <p className="serif-italic" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-lg)', marginBottom: '8px' }}>Quarterly Review</p>
            <h3 style={{ fontSize: 'var(--text-5xl)', marginBottom: '24px' }}>Powering growth for <span style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>barbers &amp; salons.</span></h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', flex: 1 }}>
                <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Gross Revenue</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-medium)' }}>ETB ${(revenueStats.total / 1000).toFixed(1)}k</span>
                  <span style={{ color: 'var(--color-secondary)', fontSize: '10px', fontWeight: 'bold' }}>+12%</span>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', flex: 1 }}>
                <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Conversion</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-medium)' }}>{revenueStats.conversion}%</span>
                  <span style={{ color: 'var(--color-primary)', fontSize: '10px', fontWeight: 'bold' }}>+4%</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: 'span 7', backgroundColor: 'var(--surface-container-low)', padding: '32px', borderRadius: '24px', position: 'relative', overflow: 'hidden', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '48px', position: 'relative', zIndex: 1 }}>
              <div>
                <h4 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>Revenue Trends</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>Monthly bookings across all service types</p>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '16px', padding: '0 16px', position: 'relative', zIndex: 1 }}>
              {chartData.map((d) => (
                <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ 
                    height: d.height, 
                    backgroundColor: d.active ? 'var(--color-primary)' : 'rgba(174, 47, 52, 0.1)', 
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.3s',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '100%', 
                      left: '50%', 
                      transform: 'translateX(-50%) translateY(-8px)', 
                      backgroundColor: 'var(--color-gray-900)', 
                      color: '#fff', 
                      fontSize: '9px', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      opacity: d.active ? 1 : 0
                    }}>{d.value}</div>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', textAlign: 'center', color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--space-8)' }}>
          <div style={{ gridColumn: 'span 8', backgroundColor: 'var(--surface-container-low)', padding: '4px', borderRadius: '32px' }}>
            <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '32px', borderRadius: '28px', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                 <h4 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>Excellence Metrics</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                 {staffMetrics.map((m) => (
                   <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden' }}>
                         <img src={m.image} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <p style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-lg)' }}>{m.name}</p>
                            <span style={{ color: m.color, fontSize: '10px', fontWeight: 'bold' }}>{m.status}</span>
                         </div>
                         <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--surface-container-low)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: m.retention, height: '100%', backgroundColor: m.color }}></div>
                         </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>{m.retention} Retention</span>
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>{m.revenue} Rev.</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
             <div style={{ backgroundColor: 'var(--color-secondary-container)', padding: '32px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <h4 style={{ color: 'var(--color-secondary-800)', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px' }}>Booking Conversion</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                   <span className="serif-italic" style={{ fontSize: '48px', color: 'var(--color-secondary-800)' }}>42%</span>
                   <TrendingUp size={24} color="var(--color-secondary-800)" />
                </div>
             </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-8)' }}>
          <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', borderLeft: '3px solid var(--color-secondary)' }}>
             <Smile size={24} color="var(--color-secondary)" style={{ marginBottom: '16px' }} />
             <h5 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Haircuts</h5>
             <p style={{ fontSize: '11px', color: 'var(--color-gray-500)', lineHeight: '1.6', marginBottom: '16px' }}>Top revenue driver this month with strong repeat-client rates.</p>
          </div>
          <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', borderLeft: '3px solid var(--color-primary)' }}>
             <Sparkles size={24} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
             <h5 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Beard &amp; Shave</h5>
             <p style={{ fontSize: '11px', color: 'var(--color-gray-500)', lineHeight: '1.6', marginBottom: '16px' }}>Steady demand, especially for traditional wet shaves and beard trims.</p>
          </div>
          <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', borderLeft: '3px solid var(--color-gray-800)' }}>
             <Scissors size={24} color="var(--color-gray-800)" style={{ marginBottom: '16px' }} />
             <h5 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Hair Color</h5>
             <p style={{ fontSize: '11px', color: 'var(--color-gray-500)', lineHeight: '1.6', marginBottom: '16px' }}>Growing demand for balayage and highlights — consider adding specialist capacity.</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
