CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  commission_amount numeric DEFAULT 0,
  commission_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.wallets (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  last_payout_at timestamptz
);

CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id),
  client_id uuid REFERENCES public.users(id),
  appointment_id uuid REFERENCES public.appointments(id),
  amount numeric NOT NULL,
  is_first_booking boolean DEFAULT true,
  calculated_at timestamptz DEFAULT now()
);
