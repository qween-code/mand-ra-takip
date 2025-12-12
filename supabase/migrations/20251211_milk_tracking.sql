-- Milk Tank (Central Stock)
CREATE TABLE IF NOT EXISTS milk_tank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_amount NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize the tank with 0 if empty
INSERT INTO milk_tank (current_amount) SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM milk_tank);

-- Milk Transactions (Audit Log)
CREATE TYPE milk_transaction_type AS ENUM (
  'milking', 
  'collection', 
  'distribution', 
  'return', 
  'feeding', 
  'production', 
  'waste'
);

CREATE TYPE milk_source_type AS ENUM (
  'cow', 
  'farmer', 
  'sales_point', 
  'tank', 
  'production_batch'
);

CREATE TABLE IF NOT EXISTS milk_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type milk_transaction_type NOT NULL,
  amount NUMERIC NOT NULL, -- Positive = Inflow, Negative = Outflow
  source_type milk_source_type NOT NULL,
  source_id UUID, -- Can be null if generic
  related_record_id UUID, -- Link to milk_records, milk_collections, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster querying by date and type
CREATE INDEX IF NOT EXISTS idx_milk_transactions_date ON milk_transactions(date);
CREATE INDEX IF NOT EXISTS idx_milk_transactions_type ON milk_transactions(type);
