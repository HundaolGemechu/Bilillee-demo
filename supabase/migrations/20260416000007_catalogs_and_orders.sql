-- Migration to add Services, Products, and Orders

-- Services Table
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  duration text NOT NULL, -- e.g., '60m'
  category text NOT NULL CHECK (category IN ('Hair', 'Skin', 'Nails', 'Massage', 'Barbering', 'Wellness', 'Other')),
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Products Table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  stock_quantity int DEFAULT 0,
  category text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Orders Table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.users(id),
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled')),
  payment_ref text, -- Mobile banking reference code
  payment_screenshot_url text,
  created_at timestamptz DEFAULT now()
);

-- Order Items Table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  quantity int NOT NULL DEFAULT 1,
  price_at_time numeric NOT NULL
);

-- RLS Policies for Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Businesses can manage their own services" ON public.services ALL USING (auth.uid() IN (SELECT user_id FROM public.business_team WHERE business_id = services.business_id));

-- RLS Policies for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Businesses can manage their own products" ON public.products ALL USING (auth.uid() IN (SELECT user_id FROM public.business_team WHERE business_id = products.business_id));

-- RLS Policies for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Businesses can view their own orders" ON public.orders FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.business_team WHERE business_id = orders.business_id));
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Functions & Triggers
-- Decrement stock on order creation
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_stock
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.decrement_stock_on_order();
