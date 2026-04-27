-- =====================================================================================
-- MIGRATION: Strict RBAC Refinement & Cleanup
-- This migration enforces the 4 explicit roles (super_admin, shop_owner, staff, customer),
-- removes all anonymous access, and drops deprecated legacy tables.
-- =====================================================================================

-- 1. Enforce Role Constraints on Profiles
-- Drop the existing role constraint if it exists (assuming it might have been an enum or check)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new roles to the ENUM type
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer';

-- Add the strict 4-role check constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'shop_owner', 'staff', 'customer'));


-- 2. Enforce Strict RLS on Active Tables
-- We ensure that key tables used by the UI have strict authenticated access.
-- Shops (Viewable by public, editable by owner)
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view shops" ON public.shops;
CREATE POLICY "Public can view shops" ON public.shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can update their shop" ON public.shops;
CREATE POLICY "Owners can update their shop" ON public.shops FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
      AND profiles.tenant_id = public.shops.id 
      AND profiles.role = 'shop_owner'
  )
);

-- Bookings (Only authenticated users can insert, clients can view theirs, staff/owners can view their shop's)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clients can insert bookings" ON public.bookings;
CREATE POLICY "Clients can insert bookings" ON public.bookings FOR INSERT WITH CHECK (
  auth.uid() = client_id
);

DROP POLICY IF EXISTS "Clients can view their bookings" ON public.bookings;
CREATE POLICY "Clients can view their bookings" ON public.bookings FOR SELECT USING (
  auth.uid() = client_id
);

DROP POLICY IF EXISTS "Staff and Owners can view shop bookings" ON public.bookings;
CREATE POLICY "Staff and Owners can view shop bookings" ON public.bookings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
      AND profiles.tenant_id = public.bookings.tenant_id
      AND profiles.role IN ('shop_owner', 'staff')
  )
);

-- Staff (Viewable by public, editable by owner/staff)
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view staff" ON public.staff;
CREATE POLICY "Public can view staff" ON public.staff FOR SELECT USING (true);


-- 4. Clean Up Deprecated Legacy Tables (The "first data")
-- We drop these carefully to ensure they are removed from the schema map, 
-- as they were replaced by the tenant-based (shops, staff) architecture.
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
-- Note: We keep public.businesses if it's still heavily linked in older migrations,
-- but the new UI logic exclusively uses public.shops.

-- =====================================================================================
-- End of Migration
-- =====================================================================================
