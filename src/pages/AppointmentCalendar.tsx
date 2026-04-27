import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { fetchBookingsPhase1 } from '../lib/phase1Data';
import { addDays, eachDayOfInterval, format, isSameDay, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays, Loader2, UserRound, Clock3 } from 'lucide-react';

export default function AppointmentCalendar() {
  const { business, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(
    () =>
      eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) }).map((date) => ({
        date,
        label: format(date, 'EEE'),
        number: format(date, 'd'),
      })),
    [weekStart]
  );

  useEffect(() => {
    if (business?.id) void loadBookings();
  }, [business?.id, weekStart]);

  async function loadBookings() {
    if (!business?.id) return;
    setLoading(true);
    const allBookings = await fetchBookingsPhase1(business.id);
    const filtered = allBookings.filter((booking) => {
      const date = booking.start;
      return date >= weekStart && date < addDays(weekStart, 7);
    });
    setBookings(filtered);
    setLoading(false);
  }

  const todayCount = bookings.filter((booking) => isSameDay(booking.start, new Date())).length;
  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length;

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
            <Badge variant="primary" style={{ marginBottom: 'var(--space-4)' }}>Phase 1 Booking Operations</Badge>
            <h2 className="serif-italic" style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-3)' }}>Weekly bookings</h2>
            <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-lg)' }}>
              This MVP view helps owners review what is booked this week, who is assigned, and what still needs attention.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', backgroundColor: 'var(--surface-container-low)', padding: '6px', borderRadius: 'var(--radius-lg)' }}>
            <Button variant="ghost" style={{ minWidth: 0, padding: '8px 12px' }} onClick={() => setCurrentDate(addDays(currentDate, -7))}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="ghost" onClick={() => setCurrentDate(new Date())}>This Week</Button>
            <Button variant="ghost" style={{ minWidth: 0, padding: '8px 12px' }} onClick={() => setCurrentDate(addDays(currentDate, 7))}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">This Week</p>
            <h3>{bookings.length}</h3>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Today</p>
            <h3>{todayCount}</h3>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="eyebrow">Confirmed</p>
            <h3>{confirmedCount}</h3>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-5)' }}>
          {weekDays.map((day) => {
            const dayBookings = bookings.filter((booking) => isSameDay(booking.start, day.date));

            return (
              <div key={day.label + day.number} className="card" style={{ padding: 'var(--space-5)', minHeight: '340px' }}>
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <p className="eyebrow" style={{ marginBottom: '6px' }}>{day.label}</p>
                  <h3 className="serif-italic" style={{ fontSize: 'var(--text-2xl)' }}>{day.number}</h3>
                </div>

                {dayBookings.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '12px', minHeight: '220px', color: 'var(--color-gray-400)' }}>
                    <CalendarDays size={28} />
                    <p style={{ fontSize: '13px' }}>No bookings scheduled.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {dayBookings.map((booking) => (
                      <div key={booking.id} style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: booking.status === 'confirmed' ? 'var(--color-secondary-100)' : 'var(--color-primary-100)', borderLeft: `4px solid ${booking.status === 'confirmed' ? 'var(--color-secondary)' : 'var(--color-primary)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                          <p style={{ fontWeight: 'bold', fontSize: '13px' }}>{booking.serviceName}</p>
                          <Badge variant={booking.status === 'confirmed' ? 'success' : 'secondary'}>{booking.status}</Badge>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-gray-700)' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Clock3 size={14} />
                            <span>{booking.startLabel} - {booking.endLabel}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <UserRound size={14} />
                            <span>{booking.clientName}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>Assigned to {booking.staffName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </DashboardLayout>
  );
}
