import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Shield, 
  Store, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Package,
  Loader2,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { superAdminBlueprint } from '../lib/roleBlueprints';
import { buildPhases } from '../lib/buildPhases';

export default function PlatformAdmin() {
  const navigate = useNavigate();
  const [shops, setShops] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalShops: 0,
    activeShops: 0,
    pendingShops: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    price_monthly_etb: 0,
    booking_limit: 0
  });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: shopsData } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all completed transactions for total platform revenue
      const { data: txData } = await supabase
        .from('transactions')
        .select('amount_etb')
        .eq('status', 'completed');

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      let calculatedRevenue = 0;
      if (txData) {
        calculatedRevenue = txData.reduce((sum, tx) => sum + Number(tx.amount_etb || 0), 0);
      }

      if (shopsData) {
        setShops(shopsData);
        setStats({
          totalShops: shopsData.length,
          activeShops: shopsData.filter(s => s.status === 'active').length,
          pendingShops: shopsData.filter(s => s.status === 'pending_verification').length,
          totalRevenue: calculatedRevenue,
          totalUsers: usersCount || 0,
        });
      }

      // Fetch Plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly_etb', { ascending: true });
      
      if (plansData) setPlans(plansData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateShopStatus(id: string, status: string) {
    const { error } = await supabase
      .from('shops')
      .update({ status })
      .eq('id', id);
    
    if (!error) fetchData();
  }

  function handleEditPlan(plan: any) {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      price_monthly_etb: plan.price_monthly_etb,
      booking_limit: plan.booking_limit
    });
    setIsPlanModalOpen(true);
  }

  async function savePlan() {
    const { error } = await supabase
      .from('subscription_plans')
      .update(planForm)
      .eq('id', selectedPlan.id);
    
    if (!error) {
      fetchData();
      setIsPlanModalOpen(false);
    }
  }


  if (loading) {
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
        <Badge variant="primary" style={{ marginBottom: 'var(--space-4)' }}>Platform Management</Badge>
        <h2 className="serif-italic" style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-2)' }}>Super Admin Control</h2>
        <p className="text-on-surface-variant">Approve shops, manage plans, monitor payments, and keep the whole marketplace healthy.</p>
      </div>
      {notice ? (
        <div style={{ marginBottom: 'var(--space-8)', padding: '14px 16px', borderRadius: '16px', backgroundColor: 'var(--surface-container-low)', color: 'var(--color-gray-700)', fontSize: '13px' }}>
          {notice}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
        {[
          { label: 'Total Shops', value: stats.totalShops, icon: Store, color: 'var(--color-primary)' },
          { label: 'Active', value: stats.activeShops, icon: CheckCircle2, color: 'var(--color-success)' },
          { label: 'Pending', value: stats.pendingShops, icon: AlertCircle, color: 'var(--color-warning)' },
          { label: 'Revenue', value: `${stats.totalRevenue.toLocaleString()} ETB`, icon: TrendingUp, color: 'var(--color-secondary)' },
          { label: 'Active Users', value: stats.totalUsers, icon: Users, color: 'var(--color-primary-container)' },
        ].map((stat, i) => (
          <Card key={i} style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: stat.color + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                <stat.icon size={20} />
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-6)' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>{stat.label}</p>
              <h3 style={{ marginTop: 'var(--space-1)' }}>{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Platform Role Blueprint" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-4)' }}>
          {superAdminBlueprint.map((item) => (
            <div key={item.title} style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-container-low)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                <item.icon size={18} />
              </div>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{item.title}</p>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: '1.6' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Delivery Phases" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-8)' }}>
        <Card title="Shop Approval Queue" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {shops.map((shop) => (
              <div key={shop.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-gray-100)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={20} color="var(--color-primary)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>{shop.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{shop.city} • Joined {new Date(shop.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <Badge variant={shop.status === 'active' ? 'success' : shop.status === 'pending_verification' ? 'warning' : 'error'}>
                    {shop.status.replace('_', ' ')}
                  </Badge>
                  {shop.status === 'pending_verification' && (
                    <>
                      <Button variant="primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => updateShopStatus(shop.id, 'active')}>Approve</Button>
                      <Button variant="ghost" style={{ padding: '8px 16px', fontSize: '12px', color: 'var(--color-danger)' }} onClick={() => updateShopStatus(shop.id, 'suspended')}>Reject</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <Card title="Subscription Tiers" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {plans.map((plan) => (
                <div key={plan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <Package size={14} color="var(--color-primary)" />
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{plan.name}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--color-gray-500)' }}>{plan.booking_limit === -1 ? 'Unlimited' : plan.booking_limit} bookings/mo</span>
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{plan.price_monthly_etb} ETB</span>
                  <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>Edit</Button>
                </div>
              ))}
              <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-primary-200)' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-500)', marginBottom: '8px' }}>Recommended Plan Ladder</p>
                <p style={{ fontSize: '13px', color: 'var(--color-gray-600)', lineHeight: '1.6' }}>Bronze 50 bookings, Silver 100, Gold 500, Platinum unlimited. Super Admin can change prices and caps anytime.</p>
              </div>
              <Button variant="secondary" style={{ width: '100%', marginTop: 'var(--space-2)' }} onClick={() => navigate('/analytics')}>View Global Billing</Button>
            </div>
          </Card>

          <Card title="Payments & Security" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <button
                className="btn-ghost"
                style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 'var(--space-3)', alignItems: 'center', color: 'var(--color-danger)' }}
                onClick={() => setNotice('Flagged-account review is next on the admin refinement list. This panel will centralize blocked users and suspended shops.')}
              >
                <Shield size={16} />
                <span>View flagged or blocked accounts</span>
              </button>
              <button
                className="btn-ghost"
                style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}
                onClick={() => navigate('/analytics')}
              >
                <CreditCard size={16} />
                <span>Review transactions and disputes</span>
              </button>
              <button
                className="btn-ghost"
                style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}
                onClick={() => setNotice('Subscription-usage monitoring is active at the plan and shop level. A dedicated global usage board is queued for the next refinement pass.')}
              >
                <TrendingUp size={16} />
                <span>Monitor subscription usage across shops</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={isPlanModalOpen} 
        onClose={() => setIsPlanModalOpen(false)} 
        title="Edit Subscription Plan"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Plan Name</label>
            <Input 
              value={planForm.name} 
              onChange={(e) => setPlanForm({...planForm, name: e.target.value})} 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Monthly Price (ETB)</label>
              <Input 
                type="number"
                value={planForm.price_monthly_etb} 
                onChange={(e) => setPlanForm({...planForm, price_monthly_etb: parseInt(e.target.value)})} 
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Booking Limit (-1 = ∞)</label>
              <Input 
                type="number"
                value={planForm.booking_limit} 
                onChange={(e) => setPlanForm({...planForm, booking_limit: parseInt(e.target.value)})} 
              />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
            <Button variant="primary" style={{ flex: 1 }} onClick={savePlan}>Save Changes</Button>
            <Button variant="ghost" onClick={() => setIsPlanModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
