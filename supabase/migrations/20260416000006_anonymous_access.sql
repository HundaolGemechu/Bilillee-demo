-- Relax RLS Policies to allow anonymous public access (FOR DEMO/PUBLIC SITE)

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Public can view all profiles" ON public.users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Clients can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Clients can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Businesses can view their own appointments" ON public.appointments;

CREATE POLICY "Public can view all appointments" ON public.appointments
  FOR SELECT USING (true);
CREATE POLICY "Public can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update appointments" ON public.appointments
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Clients can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Businesses can view their own transactions" ON public.transactions;

CREATE POLICY "Public can view all transactions" ON public.transactions
  FOR SELECT USING (true);
CREATE POLICY "Public can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only business owners can view their commissions" ON public.commissions;
CREATE POLICY "Public can view all commissions" ON public.commissions
  FOR SELECT USING (true);

-- Repeat for all other tables if necessary for the demo
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_redemptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
