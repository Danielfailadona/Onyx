-- Run this in your Supabase SQL Editor to set up the full database
-- This script is idempotent - safe to run multiple times

-----------------------------------------
-- 1. PROFILES TABLE
-----------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns if missing (for existing databases)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (to avoid conflicts)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
END $$;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup (safe to run multiple times)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger before recreating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-----------------------------------------
-- 2. COMPANIES TABLE
-----------------------------------------

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  email TEXT NOT NULL,
  cuisines TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  rating DECIMAL(3,1) DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
    DROP POLICY IF EXISTS "Users can insert own company" ON public.companies;
    DROP POLICY IF EXISTS "Users can update own company" ON public.companies;
    DROP POLICY IF EXISTS "Users can delete own company" ON public.companies;
END $$;

CREATE POLICY "Anyone can view companies"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own company"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own company"
  ON public.companies FOR DELETE
  USING (auth.uid() = user_id);

-----------------------------------------
-- 3. MENU ITEMS TABLE
-----------------------------------------

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'Mains',
  emoji TEXT DEFAULT '🍽',
  image_url TEXT,
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  rating DECIMAL(3,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns if missing (for existing databases)
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
    DROP POLICY IF EXISTS "Users can insert items for own company" ON public.menu_items;
    DROP POLICY IF EXISTS "Users can update items for own company" ON public.menu_items;
    DROP POLICY IF EXISTS "Users can delete items for own company" ON public.menu_items;
END $$;

CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert items for own company"
  ON public.menu_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items for own company"
  ON public.menu_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items for own company"
  ON public.menu_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_id
      AND companies.user_id = auth.uid()
    )
  );

-----------------------------------------
-- 4. CART ITEMS TABLE
-----------------------------------------

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
    DROP POLICY IF EXISTS "Users can insert to own cart" ON public.cart_items;
    DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
    DROP POLICY IF EXISTS "Users can delete from own cart" ON public.cart_items;
END $$;

CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-----------------------------------------
-- 5. ORDERS TABLE
-----------------------------------------

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  order_group_id TEXT NOT NULL DEFAULT '',
  item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  item_price DECIMAL(10,2) NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  user_name TEXT NOT NULL DEFAULT '',
  user_phone TEXT NOT NULL DEFAULT '',
  user_address TEXT NOT NULL DEFAULT '',
  user_latitude DECIMAL(10,7),
  user_longitude DECIMAL(10,7),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns if missing (for existing databases)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_group_id TEXT NOT NULL DEFAULT '';

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
    DROP POLICY IF EXISTS "Company owners can view orders for their company" ON public.orders;
    DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
END $$;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Company owners can view orders for their company"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-----------------------------------------
-- 6. SEED DATA (Demo companies & items)
-- Uses fixed UUIDs so the app can identify them
-- ON CONFLICT DO NOTHING prevents duplicate errors
-----------------------------------------

INSERT INTO public.companies (id, user_id, name, owner, email, cuisines, description, rating, item_count) VALUES
  ('a0000000-0000-0000-0000-000000000001', NULL, 'Noir & Ember',     'Marco Reyes',  'marco@noir.com',    ARRAY['Steakhouse'],             'Premium steakhouse and fine dining. Where every cut tells a story of craftsmanship and passion.', 4.8, 4),
  ('a0000000-0000-0000-0000-000000000002', NULL, 'Sakura Omakase',   'Yuki Tanaka',   'yuki@sakura.com',   ARRAY['Japanese'],               'Authentic Japanese omakase experience. Traditional flavors reimagined with modern precision.', 4.9, 2),
  ('a0000000-0000-0000-0000-000000000003', NULL, 'Verde Kitchen',    'Ana Santos',    'ana@verde.com',     ARRAY['Healthy'],                'Fresh and vibrant healthy bowls. Nourishing meals crafted from the finest local produce.', 4.6, 2),
  ('a0000000-0000-0000-0000-000000000004', NULL, 'La Dolce Vita',    'Luca Ferraro',  'luca@dolce.com',    ARRAY['Italian'],                'Authentic Italian pasta and desserts. A taste of tradition in every bite.', 4.7, 2),
  ('a0000000-0000-0000-0000-000000000005', NULL, 'Bistro 88',        'Paolo Cruz',    'paolo@bistro88.com', ARRAY['Fast Food', 'Desserts'], 'Modern bistro with comfort classics. Where familiar flavors meet contemporary flair.', 4.5, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_items (id, company_id, name, price, category, emoji, description, tags, rating) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Wagyu Beef Tenderloin',       2850, 'Mains',    '🥩', 'Prime 8oz wagyu, truffle mash, seasonal vegetables, red wine jus.',       ARRAY['popular'], 4.9),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Grand Seafood Platter',       3200, 'Seafood',  '🦐', 'Fresh oysters, lobster tail, prawns, crab claws, dipping sauces.',        ARRAY['new'],     4.7),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Burrata & Heirloom Tomato',    620, 'Starters', '🧀', 'Creamy burrata, heirloom tomatoes, basil, aged balsamic.',                ARRAY[]::TEXT[],  4.5),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Chocolate Lava Cake',          420, 'Desserts', '🍫', 'Warm dark chocolate cake, vanilla bean ice cream, gold leaf.',             ARRAY['popular'], 4.8),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Signature Omakase Roll',      1100, 'Starters', '🍣', 'Premium tuna, salmon, yellowtail, avocado, chef special sauce.',          ARRAY['popular', 'new'], 5.0),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Miso-Glazed Sea Bass',        1850, 'Mains',    '🐟', 'Miso-marinated sea bass, bok choy, sesame rice, yuzu dressing.',          ARRAY['new'],     4.8),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'Beetroot & Goat Cheese',       580, 'Starters', '🥗', 'Roasted beetroot, goat cheese mousse, candied walnuts, herb oil.',        ARRAY['veg'],     4.5),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'Mango Panna Cotta',            360, 'Desserts', '🥭', 'Silky panna cotta, fresh mango coulis, coconut tuile.',                   ARRAY['new', 'veg'], 4.6),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', 'Truffle Wild Mushroom Pasta',  980, 'Pasta',    '🍝', 'Handmade fettuccine, wild mushrooms, truffle cream, parmesan.',           ARRAY['veg'],     4.7),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000004', 'Lobster Mac & Cheese',        1200, 'Pasta',    '🦞', 'Lobster, three-cheese blend, cavatappi, herb breadcrumb.',                ARRAY['popular'], 4.8),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000005', 'Wagyu Beef Sliders',           680, 'Starters', '🍔', 'Mini wagyu patties, caramelized onions, aged cheddar, brioche buns.',     ARRAY['popular'], 4.6),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000005', 'Noir Signature Cocktail',      480, 'Drinks',   '🍸', 'Vodka, blackberry liqueur, fresh lime, mint, soda.',                      ARRAY[]::TEXT[],  4.4)
ON CONFLICT (id) DO NOTHING;