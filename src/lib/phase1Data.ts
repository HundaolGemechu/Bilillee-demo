import { supabase } from './supabase';

type Row = Record<string, any>;

const tenantColumns = ['tenant_id', 'business_id'] as const;
const clientColumns = ['client_id', 'user_id'] as const;

async function fetchByTenant(table: string, tenantId: string, orderColumn = 'created_at') {
  for (const tenantColumn of tenantColumns) {
    const response = await supabase
      .from(table)
      .select('*')
      .eq(tenantColumn, tenantId)
      .order(orderColumn, { ascending: false });

    if (!response.error) {
      return response.data || [];
    }
  }

  return [];
}

async function fetchOrdersByTenant(tenantId: string) {
  for (const tenantColumn of tenantColumns) {
    const response = await supabase
      .from('orders')
      .select('*')
      .eq(tenantColumn, tenantId)
      .order('created_at', { ascending: false });

    if (!response.error) {
      return response.data || [];
    }
  }

  return [];
}

function parseCurrency(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDurationMinutes(row: Row) {
  if (typeof row.duration_minutes === 'number') return row.duration_minutes;
  if (typeof row.duration === 'string') {
    const minutes = parseInt(row.duration.replace(/[^\d]/g, ''), 10);
    return Number.isFinite(minutes) ? minutes : 0;
  }
  return 0;
}

function parseDateTime(row: Row) {
  const bookingDate = row.booking_date || row.date || row.created_at;
  const startTime = row.start_time || '09:00:00';
  const endTime = row.end_time || row.start_time || '09:30:00';

  const start = bookingDate && startTime
    ? new Date(`${bookingDate}T${String(startTime).slice(0, 8)}`)
    : new Date(row.created_at || Date.now());

  const end = bookingDate && endTime
    ? new Date(`${bookingDate}T${String(endTime).slice(0, 8)}`)
    : new Date(start.getTime() + 30 * 60 * 1000);

  return { start, end };
}

export async function fetchServicesPhase1(tenantId: string) {
  const rows = await fetchByTenant('services', tenantId);

  return rows.map((row) => {
    const durationMinutes = parseDurationMinutes(row);

    return {
      id: row.id,
      name: row.name || 'Untitled Service',
      description: row.description || 'No description yet.',
      category: row.category || row.segment || 'General',
      price: parseCurrency(row.price_etb ?? row.price),
      durationMinutes,
      durationLabel: durationMinutes ? `${durationMinutes} min` : 'Duration not set',
      imageUrl: row.image_url || null,
      isActive: row.is_active !== false,
      createdAt: row.created_at,
    };
  });
}

export async function createServicePhase1(tenantId: string, name: string) {
  const tenantPayloads = [
    {
      tenant_id: tenantId,
      name,
      description: 'Update this service description with the exact experience you offer.',
      price_etb: 250,
      duration_minutes: 45,
      category: 'General',
      is_active: true,
    },
    {
      business_id: tenantId,
      name,
      description: 'Update this service description with the exact experience you offer.',
      price: 250,
      duration: '45m',
      category: 'Other',
      is_active: true,
    },
  ];

  for (const payload of tenantPayloads) {
    const response = await supabase.from('services').insert([payload]).select().single();
    if (!response.error) return response.data;
  }

  return null;
}

export async function fetchBookingsPhase1(tenantId: string) {
  const rows = await fetchByTenant('bookings', tenantId, 'created_at');
  const services = await fetchByTenant('services', tenantId);

  const clientIds = Array.from(
    new Set(
      rows
        .map((row) => clientColumns.map((col) => row[col]).find(Boolean))
        .filter(Boolean)
    )
  );

  const staffIds = Array.from(
    new Set(rows.map((row) => row.stylist_id || row.staff_id).filter(Boolean))
  );

  const profileIds = Array.from(new Set([...clientIds, ...staffIds]));
  const profiles = profileIds.length > 0
    ? ((await supabase.from('profiles').select('*').in('id', profileIds)).data || [])
    : [];

  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const serviceMap = new Map(services.map((service) => [service.id, service]));

  return rows.map((row) => {
    const { start, end } = parseDateTime(row);
    const clientId = clientColumns.map((col) => row[col]).find(Boolean);
    const staffId = row.stylist_id || row.staff_id;
    const service = serviceMap.get(row.service_id);
    const clientProfile = clientId ? profileMap.get(clientId) : null;
    const staffProfile = staffId ? profileMap.get(staffId) : null;

    return {
      id: row.id,
      status: row.status || 'pending',
      start,
      end,
      bookingDate: row.booking_date || start.toISOString().slice(0, 10),
      startLabel: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endLabel: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      serviceName: service?.name || row.service_name || 'Service',
      servicePrice: parseCurrency(row.total_price_etb ?? row.total_amount ?? service?.price_etb ?? service?.price),
      clientName: clientProfile?.full_name || row.client_name || 'Guest',
      staffName: staffProfile?.full_name || row.staff_name || 'Auto-assigned',
      staffId,
      raw: row,
    };
  });
}

export async function fetchClientsPhase1(tenantId: string) {
  const bookings = await fetchBookingsPhase1(tenantId);
  const orders = await fetchOrdersByTenant(tenantId);
  const clientMap = new Map<string, ReturnType<typeof buildClientSeed>>();

  for (const booking of bookings) {
    const clientId = clientColumns.map((col) => booking.raw[col]).find(Boolean) || booking.id;

    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, buildClientSeed(clientId, booking));
    }

    const entry = clientMap.get(clientId)!;
    entry.lastVisitDate = new Date(Math.max(entry.lastVisitDate.getTime(), booking.start.getTime()));
    entry.firstVisitDate = new Date(Math.min(entry.firstVisitDate.getTime(), booking.start.getTime()));
    entry.visitCount += 1;
    entry.totalSpend += booking.servicePrice;
  }

  for (const order of orders) {
    const clientId = order.client_id || order.user_id;
    if (!clientId) continue;

    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        id: clientId,
        name: 'Customer',
        phone: 'N/A',
        avatarUrl: `https://ui-avatars.com/api/?name=Customer&background=random`,
        lastVisitDate: new Date(order.created_at || Date.now()),
        firstVisitDate: new Date(order.created_at || Date.now()),
        visitCount: 0,
        totalSpend: 0,
      });
    }

    clientMap.get(clientId)!.totalSpend += parseCurrency(order.total_amount);
  }

  return Array.from(clientMap.values())
    .sort((a, b) => b.lastVisitDate.getTime() - a.lastVisitDate.getTime())
    .map((client) => ({
      ...client,
      lastVisitLabel: formatRelativeTime(client.lastVisitDate),
      sinceLabel: client.firstVisitDate.toLocaleDateString([], { month: 'short', year: 'numeric' }),
      totalSpendLabel: `ETB ${client.totalSpend.toLocaleString()}`,
    }));
}

export async function fetchStaffPortalPhase1(userId: string, tenantId: string) {
  let staffRow: Row | null = null;

  for (const tenantColumn of tenantColumns) {
    const response = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', userId)
      .eq(tenantColumn, tenantId)
      .single();

    if (!response.error && response.data) {
      staffRow = response.data;
      break;
    }
  }

  if (!staffRow) {
    const fallback = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!fallback.error && fallback.data) {
      staffRow = fallback.data;
    }
  }

  const profileResponse = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const profile = profileResponse.data || null;
  const allBookings = await fetchBookingsPhase1(tenantId);
  const assignedBookings = allBookings
    .filter((booking) => {
      const rawStaffId = booking.raw.staff_id || booking.raw.stylist_id;
      return rawStaffId === userId || rawStaffId === staffRow?.id;
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const availabilityRows = (
    await supabase
      .from('availability')
      .select('*')
      .eq('staff_id', userId)
      .order('day_of_week', { ascending: true })
  ).data || [];

  const today = new Date();
  const todayBookings = assignedBookings.filter((booking) => isSameCalendarDay(booking.start, today));
  const nextBooking = assignedBookings.find((booking) => booking.start >= today) || null;

  return {
    staff: {
      id: staffRow?.id || userId,
      name: profile?.full_name || 'Staff Member',
      avatarUrl: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'S')}&background=random`,
      role: staffRow?.role || 'Staff',
      bio: staffRow?.bio || 'Public profile not filled in yet.',
      specializations: staffRow?.specializations || ['General'],
      experienceYears: staffRow?.experience_years || 0,
      avgRating: Number(staffRow?.avg_rating || 5),
      totalReviews: Number(staffRow?.total_reviews || 0),
      portfolio: Array.isArray(staffRow?.portfolio) ? staffRow.portfolio : [],
    },
    todayBookings,
    assignedBookings,
    availability: availabilityRows.map((row) => ({
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      isAvailable: row.is_available !== false,
    })),
    nextBooking,
  };
}

function buildClientSeed(id: string, booking: Awaited<ReturnType<typeof fetchBookingsPhase1>>[number]) {
  return {
    id,
    name: booking.clientName,
    phone: booking.raw.client_phone || 'N/A',
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.clientName)}&background=random`,
    lastVisitDate: booking.start,
    firstVisitDate: booking.start,
    visitCount: 0,
    totalSpend: 0,
  };
}

function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  return `${diffMonths} months ago`;
}

function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
