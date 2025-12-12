-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE animal_gender AS ENUM ('male', 'female');
CREATE TYPE animal_status AS ENUM ('active', 'sold', 'deceased', 'culled');
CREATE TYPE health_status AS ENUM ('healthy', 'sick', 'recovering', 'critical');
CREATE TYPE lactation_status AS ENUM ('lactating', 'dry', 'pregnant', 'not_applicable');
CREATE TYPE milking_method AS ENUM ('manual', 'machine');
CREATE TYPE feeding_session AS ENUM ('morning', 'noon', 'evening');
CREATE TYPE milk_type AS ENUM ('raw', 'colostrum', 'replacer');
CREATE TYPE quality_status AS ENUM ('excellent', 'good', 'acceptable', 'poor', 'rejected');
CREATE TYPE product_category AS ENUM ('yogurt', 'cheese', 'butter', 'icecream', 'milk', 'other');
CREATE TYPE distribution_point_type AS ENUM ('warehouse', 'retail');
CREATE TYPE retailer_type AS ENUM ('market', 'grocery', 'individual');
CREATE TYPE shipment_status AS ENUM ('preparing', 'in_transit', 'delivered', 'cancelled', 'partial');
CREATE TYPE sale_type AS ENUM ('regular', 'discount', 'wholesale');
CREATE TYPE payment_method AS ENUM ('cash', 'credit', 'transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid');
CREATE TYPE return_status AS ENUM ('pending', 'approved', 'rejected', 'processed');
CREATE TYPE return_reason AS ENUM ('expired', 'unsold', 'damaged', 'quality_issue', 'customer_complaint', 'other');
CREATE TYPE return_action AS ENUM ('restock', 'discount_sale', 'reprocess', 'destroy', 'pending');
CREATE TYPE return_condition AS ENUM ('good', 'damaged', 'spoiled');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- 2.1 LIVESTOCK
CREATE TABLE IF NOT EXISTS cattle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ear_tag TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    birth_date TIMESTAMPTZ,
    breed TEXT,
    color TEXT,
    gender animal_gender DEFAULT 'female',
    mother_id UUID REFERENCES cattle(id),
    father_id UUID REFERENCES cattle(id),
    status animal_status DEFAULT 'active',
    health_status health_status DEFAULT 'healthy',
    lactation_status lactation_status DEFAULT 'lactating',
    weight NUMERIC,
    last_weight_date TIMESTAMPTZ,
    first_calving_date TIMESTAMPTZ,
    last_calving_date TIMESTAMPTZ,
    total_calvings INTEGER DEFAULT 0,
    purchase_date TIMESTAMPTZ,
    purchase_price NUMERIC,
    purchase_source TEXT,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ear_tag TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    birth_date TIMESTAMPTZ NOT NULL,
    birth_weight NUMERIC,
    gender animal_gender,
    mother_id UUID REFERENCES cattle(id),
    father_id UUID,
    status animal_status DEFAULT 'active',
    health_status health_status DEFAULT 'healthy',
    current_weight NUMERIC,
    last_weight_date TIMESTAMPTZ,
    weaning_date TIMESTAMPTZ,
    weaning_weight NUMERIC,
    is_weaned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 HEALTH
CREATE TABLE IF NOT EXISTS health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cattle_id UUID REFERENCES cattle(id),
    calf_id UUID REFERENCES calves(id),
    record_date TIMESTAMPTZ NOT NULL,
    health_status health_status,
    diagnosis TEXT,
    symptoms TEXT,
    treatment TEXT,
    medication TEXT,
    dosage TEXT,
    veterinarian TEXT,
    vet_notes TEXT,
    follow_up_date TIMESTAMPTZ,
    follow_up_notes TEXT,
    treatment_cost NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cattle_id UUID REFERENCES cattle(id),
    calf_id UUID REFERENCES calves(id),
    vaccine_name TEXT NOT NULL,
    vaccine_type TEXT,
    batch_number TEXT,
    scheduled_date TIMESTAMPTZ,
    administered_date TIMESTAMPTZ,
    next_due_date TIMESTAMPTZ,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'overdue', 'cancelled')),
    administered_by TEXT,
    dosage TEXT,
    administration_route TEXT,
    cost NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 MILK OPERATIONS
CREATE TABLE IF NOT EXISTS daily_milk_production (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cattle_id UUID REFERENCES cattle(id) NOT NULL,
    production_date DATE NOT NULL,
    morning_amount NUMERIC DEFAULT 0,
    evening_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC GENERATED ALWAYS AS (morning_amount + evening_amount) STORED,
    quality_status quality_status DEFAULT 'good',
    fat_percentage NUMERIC,
    protein_percentage NUMERIC,
    milking_start_time TIME,
    milking_end_time TIME,
    milking_method milking_method DEFAULT 'machine',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milk_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_date DATE UNIQUE NOT NULL,
    opening_balance NUMERIC DEFAULT 0,
    total_produced NUMERIC DEFAULT 0,
    total_collected NUMERIC DEFAULT 0,
    total_returned NUMERIC DEFAULT 0,
    total_calf_consumed NUMERIC DEFAULT 0,
    total_to_factory NUMERIC DEFAULT 0,
    total_production_used NUMERIC DEFAULT 0,
    total_sold NUMERIC DEFAULT 0,
    total_loss NUMERIC DEFAULT 0,
    closing_balance NUMERIC DEFAULT 0,
    avg_fat_percentage NUMERIC,
    avg_protein_percentage NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calf_milk_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calf_id UUID REFERENCES calves(id) NOT NULL,
    consumption_date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    source_cattle_id UUID REFERENCES cattle(id),
    feeding_time TIME,
    feeding_session feeding_session,
    milk_type milk_type DEFAULT 'raw',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milk_collection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID,
    collection_date DATE NOT NULL,
    collection_time TIME,
    amount NUMERIC NOT NULL,
    temperature NUMERIC,
    quality_status quality_status,
    fat_percentage NUMERIC,
    collected_by TEXT,
    vehicle_plate TEXT,
    price_per_liter NUMERIC,
    total_price NUMERIC,
    is_paid BOOLEAN DEFAULT FALSE,
    payment_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS factory_shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID,
    shipment_date DATE NOT NULL,
    shipment_time TIME,
    amount_sent NUMERIC NOT NULL,
    amount_received NUMERIC,
    fat_percentage NUMERIC,
    protein_percentage NUMERIC,
    quality_status quality_status,
    driver_name TEXT,
    vehicle_plate TEXT,
    departure_temp NUMERIC,
    arrival_temp NUMERIC,
    price_per_liter NUMERIC,
    total_price NUMERIC,
    status shipment_status DEFAULT 'preparing',
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 PRODUCTION
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    category product_category,
    milk_ratio NUMERIC,
    default_shelf_life INTEGER,
    unit TEXT,
    package_size NUMERIC,
    package_unit TEXT,
    production_cost NUMERIC,
    selling_price NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number TEXT UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id),
    production_date DATE NOT NULL,
    production_time TIME,
    expiry_date DATE,
    milk_used NUMERIC NOT NULL,
    quantity_produced NUMERIC NOT NULL,
    unit TEXT,
    expected_quantity NUMERIC,
    yield_percentage NUMERIC,
    loss_amount NUMERIC,
    quality_status quality_status,
    quality_notes TEXT,
    milk_cost NUMERIC,
    labor_cost NUMERIC,
    other_costs NUMERIC,
    total_cost NUMERIC,
    quantity_in_stock NUMERIC,
    quantity_sold NUMERIC DEFAULT 0,
    quantity_returned NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 DISTRIBUTION
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT,
    city TEXT,
    district TEXT,
    delivery_days TEXT,
    delivery_route_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT,
    region_id UUID REFERENCES regions(id),
    point_type distribution_point_type,
    address TEXT,
    phone TEXT,
    contact_person TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    storage_capacity NUMERIC,
    current_stock NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS retailers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT,
    retailer_type retailer_type,
    region_id UUID REFERENCES regions(id),
    distribution_point_id UUID REFERENCES distribution_points(id),
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    payment_terms TEXT,
    credit_limit NUMERIC,
    current_balance NUMERIC DEFAULT 0,
    delivery_days TEXT,
    delivery_time_preference TEXT,
    delivery_route_order INTEGER,
    total_orders INTEGER DEFAULT 0,
    total_returns INTEGER DEFAULT 0,
    return_rate NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_number TEXT UNIQUE NOT NULL,
    retailer_id UUID REFERENCES retailers(id),
    distribution_point_id UUID REFERENCES distribution_points(id),
    region_id UUID REFERENCES regions(id),
    shipment_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    driver_name TEXT,
    vehicle_plate TEXT,
    departure_time TIME,
    arrival_time TIME,
    status shipment_status DEFAULT 'preparing',
    total_items INTEGER DEFAULT 0,
    total_quantity NUMERIC DEFAULT 0,
    total_value NUMERIC DEFAULT 0,
    delivery_signature TEXT,
    delivery_photo_url TEXT,
    delivery_notes TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id),
    item_type TEXT CHECK (item_type IN ('milk', 'product')),
    product_id UUID REFERENCES products(id),
    batch_id UUID REFERENCES production_batches(id),
    quantity NUMERIC NOT NULL,
    unit TEXT,
    unit_price NUMERIC,
    total_price NUMERIC,
    milk_amount NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_number TEXT UNIQUE NOT NULL,
    retailer_id UUID REFERENCES retailers(id),
    customer_name TEXT,
    customer_phone TEXT,
    sale_date DATE NOT NULL,
    sale_time TIME,
    sale_type sale_type DEFAULT 'regular',
    subtotal NUMERIC,
    discount_amount NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC,
    payment_method payment_method DEFAULT 'cash',
    payment_status payment_status DEFAULT 'paid',
    paid_amount NUMERIC DEFAULT 0,
    shipment_id UUID REFERENCES shipments(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id),
    item_type TEXT CHECK (item_type IN ('milk', 'product')),
    product_id UUID REFERENCES products(id),
    batch_id UUID REFERENCES production_batches(id),
    quantity NUMERIC NOT NULL,
    unit TEXT,
    unit_price NUMERIC,
    discount_rate NUMERIC DEFAULT 0,
    total_price NUMERIC,
    milk_amount NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_number TEXT UNIQUE NOT NULL,
    retailer_id UUID REFERENCES retailers(id),
    sale_id UUID REFERENCES sales(id),
    shipment_id UUID REFERENCES shipments(id),
    return_date DATE NOT NULL,
    return_time TIME,
    received_date DATE,
    status return_status DEFAULT 'pending',
    total_items INTEGER DEFAULT 0,
    total_quantity NUMERIC DEFAULT 0,
    total_value NUMERIC DEFAULT 0,
    inspection_date DATE,
    inspected_by TEXT,
    inspection_notes TEXT,
    financial_impact NUMERIC DEFAULT 0,
    refund_amount NUMERIC DEFAULT 0,
    primary_reason return_reason,
    action_taken return_action,
    notes TEXT,
    photos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID REFERENCES returns(id),
    item_type TEXT CHECK (item_type IN ('milk', 'product')),
    product_id UUID REFERENCES products(id),
    batch_id UUID REFERENCES production_batches(id),
    quantity NUMERIC NOT NULL,
    unit TEXT,
    unit_price NUMERIC,
    total_value NUMERIC,
    milk_amount NUMERIC,
    milk_quality quality_status,
    reason return_reason,
    condition return_condition,
    action_taken return_action,
    inspection_result TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 SYSTEM & FINANCE
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_date TIMESTAMPTZ NOT NULL,
    transaction_type transaction_type,
    category TEXT,
    subcategory TEXT,
    amount NUMERIC NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    party_type TEXT,
    party_id UUID,
    party_name TEXT,
    description TEXT,
    payment_method TEXT,
    payment_status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    module TEXT,
    notification_type notification_type,
    title TEXT NOT NULL,
    message TEXT,
    reference_type TEXT,
    reference_id UUID,
    action_url TEXT,
    action_label TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. FUNCTIONS & STORED PROCEDURES
-- ==========================================

-- 3.1 Generate Batch Number (YGT-20250115-001)
CREATE OR REPLACE FUNCTION generate_batch_number(p_product_code TEXT, p_date DATE)
RETURNS TEXT AS $$
DECLARE
    date_str TEXT;
    seq INTEGER;
BEGIN
    date_str := to_char(p_date, 'YYYYMMDD');
    SELECT COUNT(*) + 1 INTO seq
    FROM production_batches
    WHERE production_date = p_date AND product_id IN (SELECT id FROM products WHERE code = p_product_code);

    RETURN p_product_code || '-' || date_str || '-' || lpad(seq::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- 3.2 Update Milk Inventory Logic
CREATE OR REPLACE FUNCTION update_milk_inventory()
RETURNS TRIGGER AS $$
DECLARE
    target_date DATE;
    rec RECORD;
BEGIN
    -- Determine the date based on the operation table
    IF TG_TABLE_NAME = 'daily_milk_production' THEN
        target_date := NEW.production_date;
    ELSIF TG_TABLE_NAME = 'calf_milk_consumption' THEN
        target_date := NEW.consumption_date;
    ELSIF TG_TABLE_NAME = 'milk_collection' THEN
        target_date := NEW.collection_date;
    ELSIF TG_TABLE_NAME = 'factory_shipments' THEN
        target_date := NEW.shipment_date;
    ELSIF TG_TABLE_NAME = 'production_batches' THEN
        target_date := NEW.production_date;
    END IF;

    IF target_date IS NULL THEN
        RETURN NULL;
    END IF;

    -- Ensure inventory record exists
    INSERT INTO milk_inventory (inventory_date)
    VALUES (target_date)
    ON CONFLICT (inventory_date) DO NOTHING;

    -- Update totals based on aggregations
    -- This is a simplified approach; in production, you might optimize this to avoid full table scans
    -- or use incremental updates. For MVP, re-calculating daily totals ensures consistency.

    UPDATE milk_inventory
    SET
        total_produced = (SELECT COALESCE(SUM(total_amount), 0) FROM daily_milk_production WHERE production_date = target_date),
        total_calf_consumed = (SELECT COALESCE(SUM(amount), 0) FROM calf_milk_consumption WHERE consumption_date = target_date),
        total_collected = (SELECT COALESCE(SUM(amount), 0) FROM milk_collection WHERE collection_date = target_date),
        total_to_factory = (SELECT COALESCE(SUM(amount_sent), 0) FROM factory_shipments WHERE shipment_date = target_date),
        total_production_used = (SELECT COALESCE(SUM(milk_used), 0) FROM production_batches WHERE production_date = target_date),
        updated_at = NOW()
    WHERE inventory_date = target_date;

    -- Recalculate closing balance: Opening + In - Out
    -- Note: Opening balance logic requires a recursive calculation or a nightly job.
    -- For now, we assume opening balance is carried over manually or by a separate process.
    -- Closing Balance = Opening + Produced + Collected + Returned - (Calf + Factory + Production + Sold + Loss)

    UPDATE milk_inventory
    SET closing_balance = opening_balance + total_produced + total_collected + total_returned
                        - (total_calf_consumed + total_to_factory + total_production_used + total_sold + total_loss)
    WHERE inventory_date = target_date;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3.3 Update Retailer Stats
CREATE OR REPLACE FUNCTION update_retailer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE retailers
        SET
            total_orders = (SELECT COUNT(*) FROM sales WHERE retailer_id = NEW.retailer_id),
            total_returns = (SELECT COUNT(*) FROM returns WHERE retailer_id = NEW.retailer_id),
            current_balance = current_balance + (CASE WHEN TG_TABLE_NAME = 'sales' AND NEW.payment_status != 'paid' THEN (NEW.total_amount - NEW.paid_amount) ELSE 0 END)
        WHERE id = NEW.retailer_id;

        -- Update return rate
        UPDATE retailers
        SET return_rate = CASE
            WHEN total_orders = 0 THEN 0
            ELSE ROUND((total_returns::numeric / total_orders::numeric) * 100, 2)
            END
        WHERE id = NEW.retailer_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3.4 Auto Update Updated_At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 4. TRIGGERS
-- ==========================================

-- Inventory Triggers
CREATE TRIGGER trg_milk_prod_inventory
    AFTER INSERT OR UPDATE OR DELETE ON daily_milk_production
    FOR EACH ROW EXECUTE FUNCTION update_milk_inventory();

CREATE TRIGGER trg_calf_consumption_inventory
    AFTER INSERT OR UPDATE OR DELETE ON calf_milk_consumption
    FOR EACH ROW EXECUTE FUNCTION update_milk_inventory();

CREATE TRIGGER trg_collection_inventory
    AFTER INSERT OR UPDATE OR DELETE ON milk_collection
    FOR EACH ROW EXECUTE FUNCTION update_milk_inventory();

CREATE TRIGGER trg_factory_inventory
    AFTER INSERT OR UPDATE OR DELETE ON factory_shipments
    FOR EACH ROW EXECUTE FUNCTION update_milk_inventory();

CREATE TRIGGER trg_production_inventory
    AFTER INSERT OR UPDATE OR DELETE ON production_batches
    FOR EACH ROW EXECUTE FUNCTION update_milk_inventory();

-- Stats Triggers
CREATE TRIGGER trg_sales_retailer_stats
    AFTER INSERT ON sales
    FOR EACH ROW EXECUTE FUNCTION update_retailer_stats();

CREATE TRIGGER trg_returns_retailer_stats
    AFTER INSERT ON returns
    FOR EACH ROW EXECUTE FUNCTION update_retailer_stats();

-- Updated At Triggers (Applied to all main tables)
CREATE TRIGGER update_cattle_modtime BEFORE UPDATE ON cattle FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retailers_modtime BEFORE UPDATE ON retailers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milk_inventory_modtime BEFORE UPDATE ON milk_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 5. VIEWS
-- ==========================================

-- 5.1 Daily Milk Summary
CREATE OR REPLACE VIEW v_daily_milk_summary AS
SELECT
    production_date,
    COUNT(DISTINCT cattle_id) as milking_cow_count,
    SUM(total_amount) as total_liters,
    AVG(total_amount) as avg_per_cow,
    AVG(fat_percentage) as avg_fat
FROM daily_milk_production
GROUP BY production_date;

-- 5.2 Product Stock Status
CREATE OR REPLACE VIEW v_product_stock_status AS
SELECT
    p.name,
    p.code,
    SUM(pb.quantity_in_stock) as total_stock,
    MIN(pb.expiry_date) as nearest_expiry,
    p.unit
FROM products p
LEFT JOIN production_batches pb ON p.id = pb.product_id
GROUP BY p.id, p.name, p.code, p.unit;

-- 5.3 Upcoming Vaccinations
CREATE OR REPLACE VIEW v_upcoming_vaccinations AS
SELECT
    v.id,
    v.vaccine_name,
    v.scheduled_date,
    COALESCE(c.name, cl.name) as animal_name,
    COALESCE(c.ear_tag, cl.ear_tag) as ear_tag,
    v.status
FROM vaccinations v
LEFT JOIN cattle c ON v.cattle_id = c.id
LEFT JOIN calves cl ON v.calf_id = cl.id
WHERE v.status = 'scheduled' AND v.scheduled_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
ORDER BY v.scheduled_date;
