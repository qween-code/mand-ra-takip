-- Add target_consumption to animals for calves
ALTER TABLE animals ADD COLUMN IF NOT EXISTS target_consumption NUMERIC DEFAULT 4;

-- Farmers Table
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milk Collections (from Farmers)
CREATE TABLE IF NOT EXISTS milk_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC DEFAULT 0,
  temperature NUMERIC,
  quality_ok BOOLEAN DEFAULT TRUE,
  collected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(farmer_id, date)
);

-- Daily Distributions (to Sales Points)
CREATE TABLE IF NOT EXISTS daily_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_point_id UUID REFERENCES sales_points(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  distributed_amount NUMERIC DEFAULT 0,
  returned_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sales_point_id, date)
);

-- Seed Data for Farmers
INSERT INTO farmers (name) VALUES 
('Ahmet Usta'), 
('Ayşe Teyze'), 
('Mehmet Bey')
ON CONFLICT DO NOTHING;

-- Seed Data for Sales Points (if not exists, just to ensure Logistics page works)
-- Assuming regions and sales_points might already exist or need seeding.
-- We will rely on existing data or user adding them via UI.
