-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Regions (Bölgeler)
create table public.regions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text
);

-- Sales Points (Satış Noktaları)
create table public.sales_points (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  region_id uuid references public.regions(id),
  name text not null,
  contact_info text,
  type text check (type in ('market', 'restaurant', 'individual', 'other')) default 'other'
);

-- Animals (İnekler ve Buzağılar)
create table public.animals (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tag_number text not null unique,
  name text,
  type text check (type in ('cow', 'calf', 'bull')) not null,
  birth_date date,
  mother_id uuid references public.animals(id),
  gender text check (gender in ('female', 'male')),
  status text check (status in ('active', 'sold', 'deceased', 'sick')) default 'active',
  notes text
);

-- Health Records (Sağlık/Veteriner Kayıtları)
create table public.health_records (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  animal_id uuid references public.animals(id) not null,
  record_type text check (record_type in ('vaccination', 'treatment', 'checkup', 'birth', 'other')) not null,
  date date not null default current_date,
  description text,
  cost numeric default 0,
  performed_by text,
  next_checkup_date date
);

-- Feed Logs (Yem Tüketimi)
create table public.feed_logs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  animal_id uuid references public.animals(id), -- Null ise toplu yemleme
  feed_type text not null,
  quantity_kg numeric not null,
  unit_cost numeric not null, -- Birim fiyatı (maliyet hesabı için)
  total_cost numeric generated always as (quantity_kg * unit_cost) stored,
  date date not null default current_date,
  notes text
);

-- Milk Records Table (Süt Giriş) - Updated
create table public.milk_records (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null default current_date,
  shift text check (shift in ('morning', 'evening')) not null,
  animal_id uuid references public.animals(id), -- Hangi inekten (opsiyonel, toplu da olabilir)
  quantity_liters numeric not null,
  fat_rate numeric, -- Yağ oranı
  ph_level numeric, -- pH değeri
  notes text
);

-- Milk Usage (Süt Kullanımı - İzlenebilirlik)
create table public.milk_usage (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null default current_date,
  usage_type text check (usage_type in ('production', 'calf_feeding', 'waste', 'sales')) not null,
  quantity_liters numeric not null,
  related_batch_id uuid, -- production_batches tablosuna referans (manuel eklenecek)
  related_calf_id uuid references public.animals(id), -- Buzağı besleme ise
  notes text
);

-- Production Batches (Üretim)
create table public.production_batches (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  batch_number text not null,
  product_type text not null, -- Yoğurt, Peynir, vb.
  milk_used_liters numeric not null,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  status text check (status in ('planned', 'in_progress', 'completed', 'failed')) default 'planned',
  output_quantity numeric, -- Üretilen miktar
  output_unit text -- Adet, Kg, Teneke
);

-- Products (Ürünler)
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  sku text unique,
  unit_price numeric not null,
  stock_quantity numeric default 0,
  category text
);

-- Product Transfers (Lojistik/Dağıtım)
create table public.product_transfers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null default current_date,
  source_type text check (source_type in ('center', 'region')) not null,
  source_region_id uuid references public.regions(id), -- Null ise Merkez
  target_type text check (target_type in ('region', 'sales_point')) not null,
  target_region_id uuid references public.regions(id),
  target_sales_point_id uuid references public.sales_points(id),
  product_id uuid references public.products(id) not null,
  quantity numeric not null,
  status text check (status in ('pending', 'in_transit', 'delivered', 'cancelled')) default 'pending',
  driver_name text,
  vehicle_plate text
);

-- Sales (Satış)
create table public.sales (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sales_point_id uuid references public.sales_points(id), -- Hangi noktaya/müşteriye satıldı
  customer_name text, -- Eğer sales_point değilse (eski yapı uyumluluğu)
  total_amount numeric not null,
  payment_status text check (payment_status in ('pending', 'paid', 'partial')) default 'pending',
  items jsonb -- Satılan ürünlerin detayları
);

-- Returns (İadeler)
create table public.returns (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sale_id uuid references public.sales(id),
  product_id uuid references public.products(id),
  quantity numeric not null,
  reason text, -- SKT, Hasar, vb.
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending'
);

-- Expenses (Giderler)
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null default current_date,
  category text not null, -- Yem, Veteriner, Yakıt, Personel, Bakım
  amount numeric not null,
  description text,
  related_id uuid -- Opsiyonel: health_records.id, feed_logs.id vb.
);

-- Enable Row Level Security (RLS)
alter table public.regions enable row level security;
alter table public.sales_points enable row level security;
alter table public.animals enable row level security;
alter table public.health_records enable row level security;
alter table public.feed_logs enable row level security;
alter table public.milk_records enable row level security;
alter table public.milk_usage enable row level security;
alter table public.production_batches enable row level security;
alter table public.products enable row level security;
alter table public.product_transfers enable row level security;
alter table public.sales enable row level security;
alter table public.returns enable row level security;
alter table public.expenses enable row level security;

-- Create Policies (Allow all for now)
create policy "Enable all for regions" on public.regions for all using (true) with check (true);
create policy "Enable all for sales_points" on public.sales_points for all using (true) with check (true);
create policy "Enable all for animals" on public.animals for all using (true) with check (true);
create policy "Enable all for health_records" on public.health_records for all using (true) with check (true);
create policy "Enable all for feed_logs" on public.feed_logs for all using (true) with check (true);
create policy "Enable all for milk_records" on public.milk_records for all using (true) with check (true);
create policy "Enable all for milk_usage" on public.milk_usage for all using (true) with check (true);
create policy "Enable all for production_batches" on public.production_batches for all using (true) with check (true);
create policy "Enable all for products" on public.products for all using (true) with check (true);
create policy "Enable all for product_transfers" on public.product_transfers for all using (true) with check (true);
create policy "Enable all for sales" on public.sales for all using (true) with check (true);
create policy "Enable all for returns" on public.returns for all using (true) with check (true);
create policy "Enable all for expenses" on public.expenses for all using (true) with check (true);
