CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.users(id),
  service_id uuid,
  staff_id uuid REFERENCES public.users(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week int NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true
);

CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  capacity int DEFAULT 1
);

CREATE TABLE public.resource_bookings (
  resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  PRIMARY KEY (resource_id, appointment_id)
);
