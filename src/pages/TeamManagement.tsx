import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  UserPlus, 
  MoreHorizontal, 
  Star, 
  ShieldCheck, 
  UserCircle2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  specialties: string[];
  image: string;
  bio?: string;
  experience_years?: number;
}

interface StaffResponse {
  id: string;
  role: string;
  specializations: string[];
  bio?: string;
  experience_years?: number;
  profile: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export default function TeamManagement() {
  const navigate = useNavigate();
  const { business, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const fetchTeam = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select(`
          id,
          role,
          specializations,
          bio,
          experience_years,
          profile:profiles!user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('tenant_id', business.id);

      if (error) throw error;

      if (data) {
        const formattedTeam = (data as unknown as StaffResponse[]).map((item) => ({
          id: item.id,
          name: item.profile?.full_name || 'No Name',
          email: 'N/A',
          role: item.role,
          specialties: item.specializations || ["Generalist"],
          image: item.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.profile?.full_name || 'U')}&background=random`,
          bio: item.bio || "Specializing in precision techniques and contemporary aesthetics.",
          experience_years: item.experience_years || 5
        }));
        setTeam(formattedTeam);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const getRoleDisplay = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin': return 'Super Admin';
      case 'shop_owner':
      case 'salon': return 'Owner';
      case 'stylist':
      case 'barber': return 'Barber/Hairdresser';
      case 'client': return 'User';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole === 'shop_owner' || lowerRole === 'salon' || lowerRole === 'super_admin') return Star;
    if (lowerRole === 'manager') return ShieldCheck;
    return UserCircle2;
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 className="serif-italic" style={{ fontSize: 'var(--text-5xl)' }}>Team Management</h2>
            <p style={{ color: 'var(--color-gray-600)', marginTop: 'var(--space-2)', maxWidth: '600px' }}>
              Manage your barbers and stylists. Set roles, update specialties, and keep your team organized.
            </p>
          </div>
          <Button
            variant="primary"
            icon={UserPlus}
            iconPosition="left"
            onClick={() => setNotice('Staff invitation flow is the next refinement step. For now, this screen helps review your current team structure and visibility.')}
          >
            Add Staff Member
          </Button>
        </div>
        {notice ? (
          <div style={{ marginTop: '-16px', padding: '14px 16px', borderRadius: '16px', backgroundColor: 'var(--surface-container-low)', color: 'var(--color-gray-700)', fontSize: '13px' }}>
            {notice}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--space-8)' }}>
          <div style={{ gridColumn: 'span 8' }}>
             <Card style={{ padding: 'var(--space-8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                   <h3 className="serif-italic" style={{ fontSize: 'var(--text-2xl)' }}>Active Staff</h3>
                   <Badge variant="primary">{team.length} Members</Badge>
                </div>
                {team.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)' }}>
                    No team members found for this business.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--surface-container-low)' }}>
                          <th style={{ paddingBottom: '16px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', letterSpacing: '0.15em' }}>Member</th>
                          <th style={{ paddingBottom: '16px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', letterSpacing: '0.15em' }}>Role</th>
                          <th style={{ paddingBottom: '16px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-gray-400)', letterSpacing: '0.15em' }}>Specialties</th>
                          <th style={{ paddingBottom: '16px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.map((m) => (
                          <tr key={m.id} style={{ borderBottom: '1px solid rgba(243, 244, 245, 0.5)', transition: 'background-color 0.2s' }} className="hover-tonal">
                            <td style={{ padding: '20px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', overflow: 'hidden' }}>
                                      <img src={m.image} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                  <div>
                                      <p style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>{m.name}</p>
                                      <p style={{ fontSize: '11px', color: 'var(--color-gray-500)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.bio}</p>
                                  </div>
                                </div>
                            </td>
                            <td style={{ padding: '20px 0' }}>
                                <Badge variant={(m.role?.toLowerCase() === 'owner' || m.role?.toLowerCase() === 'shop_owner') ? 'primary' : 'outline'}>
                                  {getRoleDisplay(m.role)}
                                </Badge>
                            </td>
                            <td style={{ padding: '20px 0' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {m.specialties.map((s, i) => (
                                    <React.Fragment key={s}>
                                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>{s}</span>
                                        {i < m.specialties.length - 1 && <span style={{ fontSize: '10px', color: 'var(--color-gray-300)' }}>•</span>}
                                    </React.Fragment>
                                  ))}
                                </div>
                            </td>
                            <td style={{ padding: '20px 0', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                  <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => navigate('/staff-portal')}>Portfolio</button>
                                  <button
                                    style={{ background: 'none', border: 'none', color: 'var(--color-gray-400)', cursor: 'pointer' }}
                                    onClick={() => setNotice(`Detailed editing for ${m.name} is queued next. Use Services, Bookings, and Staff Portal for the current Phase 1 workflow.`)}
                                  >
                                    <MoreHorizontal size={18} />
                                  </button>
                                </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
             </Card>
          </div>

          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
             <Card style={{ padding: 'var(--space-8)' }}>
                <h3 className="serif-italic" style={{ fontSize: 'var(--text-xl)', marginBottom: '24px' }}>Permissions Overview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                   <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '20px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                         <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Owner</span>
                         <Star size={14} color="var(--color-primary)" fill="var(--color-primary)" />
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--color-gray-600)', lineHeight: '1.6' }}>Full system access, financial reporting, and store settings.</p>
                   </div>
                   <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '20px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                         <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Barber/Hairdresser</span>
                         <UserCircle2 size={14} color="var(--color-secondary)" />
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--color-gray-600)', lineHeight: '1.6' }}>Access to personal calendar, client list, and service performance.</p>
                   </div>
                </div>
             </Card>

             <Card style={{ padding: 'var(--space-8)' }}>
                <h3 className="serif-italic" style={{ fontSize: 'var(--text-xl)', marginBottom: '24px' }}>Today's Presence</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   {team.slice(0, 3).map(m => {
                     const Icon = getRoleIcon(m.role);
                     return (
                       <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-container)' }}>
                              <Icon size={16} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 'var(--font-medium)' }}>{m.name}</span>
                         </div>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                       </div>
                     );
                   })}
                </div>
             </Card>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
