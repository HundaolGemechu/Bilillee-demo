import { useState, useEffect } from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  MessageSquare,
  History,
  XCircle,
  Loader2,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ClientBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'upcoming' | 'history'>('upcoming');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchBookings() {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, shops(*), services(*)')
      .eq('client_id', user.id)
      .order('booking_date', { ascending: false });

    if (data) setBookings(data);
    setLoading(false);
  }

  async function handleCancelBooking(bookingId: string) {
    setNotice('Cancelling booking...');
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      setNotice('Unable to cancel this booking right now.');
      return;
    }

    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
      )
    );
    setViewMode('history');
    setNotice('Booking cancelled. It has been moved to your history.');
  }

  const visibleBookings = bookings.filter((booking) =>
    viewMode === 'history'
      ? ['completed', 'cancelled'].includes(booking.status)
      : !['completed', 'cancelled'].includes(booking.status)
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'primary';
      default:
        return 'outline';
    }
  };

  return (
    <PublicLayout>
      <div className="page-stack">
        <section className="content-section" style={{ paddingTop: '12px' }}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Customer Area</p>
              <h1 className="serif-italic" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginBottom: '12px' }}>My bookings</h1>
              <p>Track upcoming appointments, review history, and stay ahead of reminders.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button variant={viewMode === 'history' ? 'primary' : 'ghost'} onClick={() => setViewMode(viewMode === 'history' ? 'upcoming' : 'history')}>
                <History size={16} /> {viewMode === 'history' ? 'Show Upcoming' : 'History'}
              </Button>
              <Button variant="secondary" onClick={() => setNotice('Smart reminders are enabled for confirmation, day-before, and 30-minute alerts.')}>
                <Bell size={16} /> Reminder Settings
              </Button>
            </div>
          </div>
          {notice ? (
            <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '16px', backgroundColor: 'var(--surface-container-low)', color: 'var(--color-gray-700)', fontSize: '13px' }}>
              {notice}
            </div>
          ) : null}

          {loading ? (
            <div className="loading-panel">
              <Loader2 className="animate-spin" size={42} color="var(--color-primary)" />
            </div>
          ) : visibleBookings.length === 0 ? (
            <Card className="empty-panel">
              <Calendar size={58} color="var(--color-gray-300)" style={{ marginBottom: '20px' }} />
              <h3 className="serif-italic" style={{ fontSize: '28px', marginBottom: '12px' }}>
                {viewMode === 'history' ? 'No booking history yet' : 'No upcoming bookings'}
              </h3>
              <p style={{ marginBottom: '24px' }}>
                {viewMode === 'history'
                  ? 'Completed and cancelled appointments will appear here once you start booking.'
                  : 'You have not booked any upcoming services yet. Start with a shop that shows strong staff profiles, reviews, and portfolio work.'}
              </p>
              <Button variant="primary" onClick={() => navigate('/')}>Find a Shop</Button>
            </Card>
          ) : (
            <div className="booking-list">
              {visibleBookings.map((booking) => (
                <Card key={booking.id} className="booking-card">
                  <div className="booking-card-media">
                    {booking.shops?.logo_url ? (
                      <img src={booking.shops.logo_url} alt={booking.shops.name} />
                    ) : (
                      <Calendar size={36} color="var(--color-primary)" />
                    )}
                  </div>

                  <div className="booking-card-content">
                    <div className="booking-card-head">
                      <div>
                        <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>{booking.services?.name || 'Service'}</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <Badge variant={getStatusVariant(booking.status) as any}>{booking.status}</Badge>
                          <Badge variant="outline">{booking.shops?.name || 'Shop'}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="booking-meta-grid">
                      <div className="meta-inline">
                        <Calendar size={14} />
                        <span>{new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="meta-inline">
                        <Clock size={14} />
                        <span>{booking.start_time}</span>
                      </div>
                      <div className="meta-inline">
                        <MapPin size={14} />
                        <span>{booking.shops?.address || booking.shops?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-actions">
                    <Button variant="ghost" title="Message shop" onClick={() => setNotice(`Use the shop page for ${booking.shops?.name || 'this shop'} to contact the team directly.`)}><MessageSquare size={18} /></Button>
                    <Button variant="ghost" title="Open shop" onClick={() => navigate(`/shop/${booking.shops?.slug}`)}><ExternalLink size={18} /></Button>
                    <Button
                      variant="ghost"
                      title="Cancel booking"
                      style={{ color: 'var(--color-error)' }}
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                    >
                      <XCircle size={18} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
