-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- 1. Users Table Policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 2. Businesses Table Policies
CREATE POLICY "Public can view business listings" ON public.businesses
  FOR SELECT USING (true);

CREATE POLICY "Owners can update their own business" ON public.businesses
  FOR UPDATE USING (auth.uid() = owner_id);

-- 3. Appointments Table Policies
CREATE POLICY "Clients can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create their own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Businesses can view their own appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND business_id = public.appointments.business_id
    ) OR 
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE owner_id = auth.uid() AND id = public.appointments.business_id
    )
  );

-- 4. Transactions Table Policies
CREATE POLICY "Clients can view their own transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE id = appointment_id AND client_id = auth.uid()
    )
  );

CREATE POLICY "Businesses can view their own transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND business_id = public.transactions.business_id
    ) OR 
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE owner_id = auth.uid() AND id = public.transactions.business_id
    )
  );

-- 5. Marketplace Listings Policies
CREATE POLICY "Public can view marketplace listings" ON public.marketplace_listings
  FOR SELECT USING (true);

-- 6. Reviews Policies
CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews for their appointments" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = client_id AND 
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE business_id = public.reviews.business_id AND client_id = auth.uid() AND status = 'confirmed'
    )
  );

-- 7. Commissions Policies
CREATE POLICY "Only business owners can view their commissions" ON public.commissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE owner_id = auth.uid() AND id = business_id
    )
  );
