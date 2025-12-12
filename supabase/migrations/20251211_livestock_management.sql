-- Create locations table
CREATE TYPE location_type AS ENUM ('barn', 'pasture', 'milking_parlor');

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    capacity INTEGER,
    type location_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update animals table
CREATE TYPE animal_origin AS ENUM ('born_on_farm', 'purchased');

ALTER TABLE animals 
ADD COLUMN sire_id UUID REFERENCES animals(id),
ADD COLUMN dam_id UUID REFERENCES animals(id),
ADD COLUMN breed TEXT,
ADD COLUMN origin animal_origin DEFAULT 'born_on_farm',
ADD COLUMN purchase_date DATE,
ADD COLUMN purchase_price NUMERIC,
ADD COLUMN current_weight NUMERIC,
ADD COLUMN photo_url TEXT,
ADD COLUMN barn_id UUID REFERENCES locations(id);

-- Create breeding_records table
CREATE TYPE breeding_event_type AS ENUM ('insemination', 'pregnancy_check', 'dry_off', 'calving', 'abortion');

CREATE TABLE breeding_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id) NOT NULL,
    type breeding_event_type NOT NULL,
    date DATE NOT NULL,
    details JSONB, -- For storing semen_code, result, calf_id etc.
    technician TEXT,
    cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update health_records table
ALTER TABLE health_records
ADD COLUMN vet_name TEXT,
ADD COLUMN diagnosis TEXT,
ADD COLUMN medication TEXT,
ADD COLUMN withdrawal_period_days INTEGER DEFAULT 0,
ADD COLUMN cost NUMERIC DEFAULT 0,
ADD COLUMN next_check_date DATE;
