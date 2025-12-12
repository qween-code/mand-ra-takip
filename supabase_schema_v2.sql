-- ═══════════════════════════════════════════════════════════════════════════
-- MANDRA SÜT TAKİP SİSTEMİ v2.0 - DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

create type public.animal_gender as enum ('female', 'male');
create type public.animal_status as enum ('active', 'sold', 'deceased', 'sick', 'quarantine');
create type public.lactation_status as enum ('lactating', 'dry');
create type public.health_status as enum ('healthy', 'sick', 'treatment', 'observation');
create type public.vaccination_status as enum ('pending', 'completed', 'missed');
create type public.quality_status as enum ('good', 'acceptable', 'rejected');
create type public.shipment_status as enum ('preparing', 'shipped', 'delivered', 'cancelled');
create type public.return_status as enum ('pending', 'approved', 'rejected', 'processed');
create type public.return_reason as enum ('expired', 'damaged', 'quality_issue', 'unsold', 'other');
create type public.return_action as enum ('restock', 'discount_sell', 'disposal');
create type public.transaction_type as enum ('income', 'expense');
create type public.notification_type as enum ('info', 'warning', 'alert', 'success');
create type public.notification_module as enum ('animal', 'milk', 'production', 'inventory', 'sales', 'system');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ANIMAL MANAGEMENT
-- ─────────────────────────────────────────────────────────────────────────────

-- Cattle (İnekler)
create table public.cattle (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tag_number text not null unique,
  name text,
  breed text,
  date_of_birth date,
  gender animal_gender default 'female',
  status animal_status default 'active',
  lactation_status lactation_status default 'lactating',
  weight numeric,
  notes text,
  image_url text
);

-- Calves (Buzağılar)
create table public.calves (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tag_number text not null unique,
  name text,
  breed text,
  date_of_birth date,
  gender animal_gender,
  mother_id uuid references public.cattle(id),
  father_tag text,
  birth_weight numeric,
  status animal_status default 'active',
  weaning_date date, -- Sütten kesilme tarihi
  notes text,
  image_url text
);

-- Health Records (Ortak yapı kullanılabilir veya ayrılabilir, PRD ayrı istemiş ama tek tablo daha yönetilebilir. PRD'ye sadık kalalım)
-- Cattle Health Records
create table public.cattle_health_records (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  cattle_id uuid references public.cattle(id) not null,
  record_date date default current_date,
  diagnosis text,
  treatment text,
  veterinarian text,
  cost numeric default 0,
  status health_status default 'treatment',
  notes text
);

-- Calf Health Records
create table public.calf_health_records (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  calf_id uuid references public.calves(id) not null,
  record_date date default current_date,
  diagnosis text,
  treatment text,
  veterinarian text,
  cost numeric default 0,
  status health_status default 'treatment',
  notes text
);

-- Vaccinations (Aşılar)
create table public.vaccinations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  animal_type text check (animal_type in ('cattle', 'calf')),
  animal_id uuid not null, -- cattle_id veya calf_id (uygulama tarafında yönetilecek)
  vaccine_name text not null,
  scheduled_date date not null,
  administered_date date,
  status vaccination_status default 'pending',
  performer text,
  batch_number text,
  notes text
);

-- Veterinary Visits
create table public.veterinary_visits (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  visit_date date default current_date,
  veterinarian_name text,
  reason text,
  total_cost numeric default 0,
  notes text
);

-- Feed Records (Yem Kayıtları)
create table public.feed_records (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date,
  feed_type text not null,
  quantity_kg numeric not null,
  target_group text check (target_group in ('all_cattle', 'lactating_cows', 'dry_cows', 'calves', 'specific_animal')),
  specific_animal_id uuid, -- Opsiyonel
  unit_cost numeric default 0,
  total_cost numeric generated always as (quantity_kg * unit_cost) stored,
  notes text
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. MILK MANAGEMENT
-- ─────────────────────────────────────────────────────────────────────────────

-- Daily Milk Production (Günlük Süt Üretimi)
create table public.daily_milk_production (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date,
  shift text check (shift in ('morning', 'evening')) not null,
  animal_id uuid references public.cattle(id), -- Opsiyonel (toplu giriş için null olabilir)
  quantity_liters numeric not null,
  fat_rate numeric,
  protein_rate numeric,
  lactose_rate numeric,
  somatic_cell_count integer,
  note text
);

-- Milk Inventory (Merkezi Süt Deposu)
create table public.milk_inventory (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date unique not null,
  opening_balance numeric default 0, -- Güne başlarken tanktaki süt
  total_production numeric default 0, -- Günlük üretim toplamı (+)
  total_collected numeric default 0, -- Dışarıdan toplanan (+)
  total_sales numeric default 0, -- Çiğ süt satışı (-)
  total_used_production numeric default 0, -- Üretime giden (-)
  total_fed_calves numeric default 0, -- Buzağılara içirilen (-)
  total_waste numeric default 0, -- Zayi (-)
  total_shipped_factory numeric default 0, -- Fabrikaya giden (-)
  closing_balance numeric generated always as (opening_balance + total_production + total_collected - total_sales - total_used_production - total_fed_calves - total_waste - total_shipped_factory) stored,
  notes text
);

-- Milk Quality Tests
create table public.milk_quality_tests (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date,
  sample_source text not null, -- 'tank', 'specific_cow', 'supplier'
  source_id uuid, -- cattle_id veya supplier_id
  ph_level numeric,
  fat_rate numeric,
  antibiotic_test boolean default false,
  result quality_status default 'good',
  tester_name text,
  notes text
);

-- Calf Milk Consumption
create table public.calf_milk_consumption (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date,
  calf_id uuid references public.calves(id),
  quantity_liters numeric not null,
  feeding_time text check (feeding_time in ('morning', 'evening', 'noon')),
  source_cow_id uuid references public.cattle(id), -- Hangi inekten (opsiyonel)
  notes text
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. SUPPLY & COLLECTION
-- ─────────────────────────────────────────────────────────────────────────────

-- Suppliers (Tedarikçiler)
create table public.suppliers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text,
  village text,
  price_per_liter numeric default 0,
  is_active boolean default true,
  total_collected numeric default 0,
  total_paid numeric default 0
);

-- Milk Collection (Süt Toplama)
create table public.milk_collections (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date,
  supplier_id uuid references public.suppliers(id),
  quantity_liters numeric not null,
  temperature numeric,
  quality_status quality_status default 'good',
  unit_price numeric not null,
  total_amount numeric generated always as (quantity_liters * unit_price) stored,
  collector_name text,
  notes text
);

-- Factories (Fabrikalar)
create table public.factories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  contact_person text,
  phone text,
  address text,
  contract_price numeric
);

-- Factory Shipments (Fabrika Sevkiyatları)
create table public.factory_shipments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date,
  factory_id uuid references public.factories(id),
  quantity_liters numeric not null,
  fat_rate numeric,
  ph_level numeric,
  plate_number text,
  driver_name text,
  status shipment_status default 'shipped',
  notes text
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. PRODUCTION MANAGEMENT
-- ─────────────────────────────────────────────────────────────────────────────

-- Products (Ürün Tanımları)
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  type text not null, -- 'yogurt', 'cheese', 'butter', 'ayran'
  unit text not null, -- 'kg', 'piece', 'liter'
  unit_price numeric default 0,
  shelf_life_days integer default 10,
  min_stock_level integer default 10,
  image_url text,
  is_active boolean default true
);

-- Production Batches (Üretim Partileri)
create table public.production_batches (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  batch_number text not null unique, -- YGT-20231212-01
  product_id uuid references public.products(id),
  start_date timestamp with time zone default now(),
  end_date timestamp with time zone,
  milk_used_liters numeric not null,
  quantity_produced numeric,
  expiration_date date,
  status text check (status in ('planned', 'in_progress', 'maturing', 'completed', 'failed')) default 'planned',
  notes text
);

-- Production Milk Sources (İzlenebilirlik)
create table public.production_milk_sources (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  batch_id uuid references public.production_batches(id),
  source_type text check (source_type in ('farm_tank', 'collection', 'specific_cow')),
  source_date date, -- Hangi günün sütü
  quantity_used numeric not null,
  notes text
);

-- Product Stock (Stok)
create table public.product_stock (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references public.products(id),
  batch_id uuid references public.production_batches(id),
  quantity numeric not null default 0,
  location text default 'main_warehouse'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. DISTRIBUTION & SALES
-- ─────────────────────────────────────────────────────────────────────────────

-- Regions (Bölgeler)
create table public.regions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  city text,
  description text
);

-- Distribution Points (Dağıtım Noktaları / Depolar)
create table public.distribution_points (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  region_id uuid references public.regions(id),
  type text check (type in ('warehouse', 'vehicle')),
  capacity numeric
);

-- Retailers (Satıcılar / Marketler)
create table public.retailers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  region_id uuid references public.regions(id),
  contact_person text,
  phone text,
  address text,
  current_balance numeric default 0,
  status text default 'active'
);

-- Shipments (Sevkiyatlar)
create table public.shipments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  shipment_number text unique,
  date date default current_date,
  driver_name text,
  vehicle_plate text,
  route_id uuid references public.regions(id),
  status shipment_status default 'preparing',
  notes text
);

-- Shipment Items
create table public.shipment_items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  shipment_id uuid references public.shipments(id),
  product_id uuid references public.products(id),
  batch_id uuid references public.production_batches(id),
  quantity numeric not null,
  unit_price numeric -- O anki fiyat
);

-- Sales (Satışlar)
create table public.sales (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date,
  retailer_id uuid references public.retailers(id),
  total_amount numeric not null,
  payment_status text check (payment_status in ('pending', 'partial', 'paid')) default 'pending',
  payment_method text,
  invoice_number text,
  notes text
);

-- Sale Items
create table public.sale_items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sale_id uuid references public.sales(id),
  product_id uuid references public.products(id),
  quantity numeric not null,
  unit_price numeric not null,
  total_price numeric generated always as (quantity * unit_price) stored
);

-- Returns (İadeler)
create table public.returns (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date,
  retailer_id uuid references public.retailers(id),
  status return_status default 'pending',
  total_refund_amount numeric default 0,
  processed_by text,
  notes text
);

-- Return Items
create table public.return_items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  return_id uuid references public.returns(id),
  product_id uuid references public.products(id),
  batch_id uuid references public.production_batches(id), -- İzlenebilirlik için kritik
  quantity numeric not null,
  reason return_reason not null,
  action_taken return_action,
  notes text
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FINANCE & LOGS
-- ─────────────────────────────────────────────────────────────────────────────

-- Financial Transactions
create table public.financial_transactions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date,
  type transaction_type not null,
  category text not null,
  amount numeric not null,
  description text,
  related_entity_type text, -- 'sale', 'purchase', 'salary'
  related_entity_id uuid
);

-- Notifications
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  title text not null,
  message text not null,
  type notification_type default 'info',
  module notification_module,
  is_read boolean default false,
  link text
);

-- Notification Settings
create table public.notification_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  module notification_module not null,
  email_enabled boolean default true,
  push_enabled boolean default true,
  in_app_enabled boolean default true,
  unique(user_id, module)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. TRIGGERS & FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_cattle_updated_at before update on public.cattle for each row execute function update_updated_at_column();
create trigger update_calves_updated_at before update on public.calves for each row execute function update_updated_at_column();
create trigger update_milk_inventory_updated_at before update on public.milk_inventory for each row execute function update_updated_at_column();
create trigger update_product_stock_updated_at before update on public.product_stock for each row execute function update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. RLS POLICIES (Simplified for MVP)
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.cattle enable row level security;
alter table public.calves enable row level security;
alter table public.daily_milk_production enable row level security;
alter table public.milk_inventory enable row level security;
alter table public.suppliers enable row level security;
alter table public.milk_collections enable row level security;
alter table public.products enable row level security;
alter table public.production_batches enable row level security;
alter table public.sales enable row level security;
alter table public.returns enable row level security;

-- Allow all access for authenticated users for now
create policy "Enable all for authenticated users" on public.cattle for all to authenticated using (true) with check (true);
create policy "Enable all for authenticated users" on public.calves for all to authenticated using (true) with check (true);
create policy "Enable all for authenticated users" on public.daily_milk_production for all to authenticated using (true) with check (true);
create policy "Enable all for authenticated users" on public.milk_inventory for all to authenticated using (true) with check (true);
create policy "Enable all for authenticated users" on public.suppliers for all to authenticated using (true) with check (true);
create policy "Enable all for authenticated users" on public.milk_collections for all to authenticated using (true) with check (true);
create policy "Enable all for authenticated users" on public.products for all to authenticated using (true) with check (true);
create policy "Enable all for authenticated users" on public.production_batches for all to authenticated using (true) with check (true);
create policy "Enable all for authenticated users" on public.sales for all to authenticated using (true) with check (true);
create policy "Enable all for authenticated users" on public.returns for all to authenticated using (true) with check (true);

