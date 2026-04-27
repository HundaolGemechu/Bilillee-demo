import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Calendar,
  CheckCircle2,
  Star,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Scissors,
  BellRing,
  Clock3,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchStaffPortalPhase1 } from '../lib/phase1Data';
import { staffBlueprint } from '../lib/roleBlueprints';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, business } = useAuth();
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (user?.id && business?.id) {
      void loadPortal();
    }
  }, [user?.id, business?.id]);

  async function loadPortal() {
    if (!user?.id || !business?.id) return;
    setLoading(true);
    const result = await fetchStaffPortalPhase1(user.id, business.id);
    setPortalData(result);
    setLoading(false);
  }

  function sendReminder(type: '30min' | 'gonow') {
    setNotice(type === '30min' ? '30-minute reminder prepared for the next client touchpoint.' : 'Go-now alert prepared for the next client touchpoint.');
  }

  const staff = portalData?.staff;
  const todayBookings = portalData?.todayBookings || [];
  const availability = portalData?.availability || [];

  const completionChecks = useMemo(() => {
    if (!staff) return [];
    return [
      { label: 'Profile photo and name visible to customers', done: Boolean(staff.avatarUrl && staff.name) },
      { label: 'Short staff bio written for the public team page', done: Boolean(staff.bio && staff.bio !== 'Public profile not filled in yet.') },
      { label: 'At least one specialization listed', done: Array.isArray(staff.specializations) && staff.specializations.length > 0 },
      { label: 'Availability schedule prepared', done: availability.length > 0 },
    ];
  }, [staff, availability]);

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
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
          <div>
            <Badge variant="primary" style={{ marginBottom: 'var(--space-4)' }}>Phase 1 Staff Essentials</Badge>
            <h2 className="serif-italic" style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-2)' }}>
              Hello, {staff?.name?.split(' ')[0] || 'Staff'}
            </h2>
            <p className="text-on-surface-variant">
              See your next appointments, maintain the public profile customers use to choose you, and stay ready for reminders at <span style={{ fontWeight: 'bold' }}>{business?.name}</span>.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Button variant="secondary" icon={Scissors} onClick={() => navigate('/catalog')}>My Services</Button>
            <Button variant="primary" icon={Calendar} onClick={() => navigate('/calendar')}>Availability</Button>
          </div>
        </div>

        <Card title="Staff Role Blueprint" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            {staffBlueprint.map((item) => (
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)' }}>
          <Card style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Rating</p>
            <h3>{staff?.avgRating?.toFixed?.(1) || staff?.avgRating || '5.0'}</h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '13px' }}>{staff?.totalReviews || 0} reviews</p>
          </Card>
          <Card style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Today</p>
            <h3>{todayBookings.length}</h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '13px' }}>assigned bookings</p>
          </Card>
          <Card style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Specialties</p>
            <h3>{staff?.specializations?.length || 0}</h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '13px' }}>{(staff?.specializations || []).join(', ') || 'General'}</p>
          </Card>
          <Card style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Experience</p>
            <h3>{staff?.experienceYears || 0}</h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '13px' }}>years shared publicly</p>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--space-8)' }}>
          <Card title="Today’s Assigned Bookings" style={{ padding: 'var(--space-8)' }}>
            {todayBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-gray-400)' }}>
                <Calendar size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                <p>No bookings assigned today yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {todayBookings.map((booking: any) => (
                  <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-5)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-container-low)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                      <div style={{ minWidth: '78px', textAlign: 'center' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{booking.startLabel}</p>
                        <p style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>{booking.endLabel}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <p style={{ fontWeight: 'bold' }}>{booking.serviceName}</p>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-gray-600)', fontSize: '13px' }}>
                          <UserRound size={14} />
                          <span>{booking.clientName}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'completed' ? 'primary' : 'secondary'}>
                        {booking.status}
                      </Badge>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Button variant="ghost" size="sm" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => sendReminder('30min')}>
                          <BellRing size={13} /> 30 min
                        </Button>
                        <Button variant="secondary" size="sm" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => sendReminder('gonow')}>
                          Go Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {notice ? (
              <div style={{ marginTop: 'var(--space-5)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-secondary-100)', color: 'var(--color-secondary-700)', fontSize: '13px' }}>
                {notice}
              </div>
            ) : null}
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <Card title="Public Staff Profile" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', overflow: 'hidden', backgroundColor: 'var(--surface-container-low)' }}>
                  <img src={staff?.avatarUrl} alt={staff?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{staff?.name}</h3>
                  <p style={{ color: 'var(--color-gray-500)', fontSize: '13px' }}>{staff?.role}</p>
                </div>
              </div>
              <p style={{ color: 'var(--color-gray-600)', lineHeight: '1.7', marginBottom: 'var(--space-4)' }}>{staff?.bio}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(staff?.specializations || ['General']).map((item: string) => (
                  <Badge key={item} variant="outline">{item}</Badge>
                ))}
              </div>
            </Card>

            <Card title="Availability Snapshot" style={{ padding: 'var(--space-6)' }}>
              {availability.length === 0 ? (
                <p style={{ color: 'var(--color-gray-500)', lineHeight: '1.6' }}>No weekly availability added yet. Phase 1 expects a simple weekly schedule so customers can choose you confidently.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {availability.map((slot: any) => (
                    <div key={`${slot.dayOfWeek}-${slot.startTime}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '14px', backgroundColor: 'var(--surface-container-low)' }}>
                      <span style={{ fontWeight: 'bold' }}>{dayLabels[slot.dayOfWeek] || `Day ${slot.dayOfWeek}`}</span>
                      <span style={{ color: 'var(--color-gray-600)', fontSize: '13px' }}>{slot.startTime} - {slot.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Profile Checklist" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {completionChecks.map((item) => (
                  <div key={item.label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    {item.done ? (
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '2px' }} />
                    ) : (
                      <Clock3 size={16} color="var(--color-gray-400)" style={{ marginTop: '2px' }} />
                    )}
                    <p style={{ fontSize: '13px', color: 'var(--color-gray-600)', lineHeight: '1.6' }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Portfolio & Reviews" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                {staff?.portfolio?.length > 0 ? (
                  staff.portfolio.slice(0, 4).map((image: string, index: number) => (
                    <div key={index} style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <img src={image} alt="Portfolio work" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))
                ) : (
                  [1, 2, 3, 4].map((index) => (
                    <div key={index} style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={22} color="var(--color-gray-300)" />
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Star size={14} fill="var(--color-primary)" color="var(--color-primary)" />
                  <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{staff?.avgRating?.toFixed?.(1) || staff?.avgRating || '5.0'}</span>
                  <span style={{ color: 'var(--color-gray-500)', fontSize: '12px' }}>from {staff?.totalReviews || 0} reviews</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}><MessageSquare size={14} /> Reviews</Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
