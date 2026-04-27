import { supabase } from './supabase';

export interface SalonNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'reminder';
  is_read: boolean;
  created_at: string;
}

export async function sendAppointmentReminder(bookingId: string) {
  // Logic to send 30-min reminder
  console.log(`Sending 30-min reminder for booking ${bookingId}`);
}

export async function sendGoNowAlert(bookingId: string) {
  // Logic to send "Go Now" alert
  console.log(`Sending "Go Now" alert for booking ${bookingId}`);
}

export async function checkBookingLimits(tenantId: string) {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(*)')
    .eq('tenant_id', tenantId)
    .single();
  
  if (!sub) return { limitReached: false };

  const limit = sub.subscription_plans.booking_limit;
  if (limit === -1) return { limitReached: false };

  const count = sub.bookings_count;
  return { 
    limitReached: count >= limit,
    usage: count,
    limit: limit,
    warning: count >= limit * 0.9 // Warn at 90%
  };
}
