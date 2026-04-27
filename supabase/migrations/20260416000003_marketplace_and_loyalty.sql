CREATE TABLE public.marketplace_listings (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  is_featured boolean DEFAULT false,
  featured_until timestamptz,
  search_score float DEFAULT 0,
  category_ids text[]
);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.client_sources (
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  source text,
  first_booking_at timestamptz,
  PRIMARY KEY (client_id, business_id)
);

CREATE TABLE public.loyalty_points (
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  points_balance int DEFAULT 0,
  lifetime_earned int DEFAULT 0,
  PRIMARY KEY (client_id, business_id)
);

CREATE TABLE public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.users(id),
  business_id uuid REFERENCES public.businesses(id),
  points int NOT NULL,
  type text NOT NULL,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  benefits jsonb,
  monthly_price numeric
);

CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  services_included text[],
  total_sessions int NOT NULL,
  price numeric NOT NULL
);

CREATE TABLE public.package_redemptions (
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  sessions_used int DEFAULT 0,
  sessions_remaining int NOT NULL,
  PRIMARY KEY (package_id, client_id)
);
