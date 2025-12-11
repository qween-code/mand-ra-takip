-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Milk Records Table (Süt Giriş)
create table public.milk_records (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null default current_date,
  shift text check (shift in ('morning', 'evening')) not null,
  quantity_liters numeric not null,
  fat_rate numeric, -- Yağ oranı
  ph_level numeric, -- pH değeri
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

-- Sales (Satış)
create table public.sales (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text,
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

-- Enable Row Level Security (RLS)
alter table public.milk_records enable row level security;
alter table public.production_batches enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.returns enable row level security;

-- Create Policies (Allow all for now for simplicity, can be restricted later)
create policy "Enable read access for all users" on public.milk_records for select using (true);
create policy "Enable insert access for all users" on public.milk_records for insert with check (true);
create policy "Enable delete access for all users" on public.milk_records for delete using (true);

create policy "Enable read access for all users" on public.production_batches for select using (true);
create policy "Enable insert access for all users" on public.production_batches for insert with check (true);
create policy "Enable update access for all users" on public.production_batches for update using (true);

create policy "Enable read access for all users" on public.products for select using (true);
create policy "Enable insert access for all users" on public.products for insert with check (true);
create policy "Enable update access for all users" on public.products for update using (true);

create policy "Enable read access for all users" on public.sales for select using (true);
create policy "Enable insert access for all users" on public.sales for insert with check (true);

create policy "Enable read access for all users" on public.returns for select using (true);
create policy "Enable insert access for all users" on public.returns for insert with check (true);
