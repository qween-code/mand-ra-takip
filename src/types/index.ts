// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - TYPE DEFINITIONS v2.0
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type AnimalGender = 'female' | 'male';
export type AnimalStatus = 'active' | 'sold' | 'deceased' | 'sick' | 'quarantine';
export type LactationStatus = 'lactating' | 'dry';
export type HealthStatus = 'healthy' | 'sick' | 'treatment' | 'observation';
export type VaccinationStatus = 'pending' | 'completed' | 'missed';
export type QualityStatus = 'good' | 'acceptable' | 'rejected';
export type ShipmentStatus = 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'processed';
export type ReturnReason = 'expired' | 'damaged' | 'quality_issue' | 'unsold' | 'other';
export type ReturnAction = 'restock' | 'discount_sell' | 'disposal';
export type TransactionType = 'income' | 'expense';
export type NotificationType = 'info' | 'warning' | 'alert' | 'success';
export type NotificationModule = 'animal' | 'milk' | 'production' | 'inventory' | 'sales' | 'system';

// ─────────────────────────────────────────────────────────────────────────────
// 2. ANIMAL MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface Cattle {
    id: string;
    tag_number: string;
    name: string | null;
    breed: string | null;
    date_of_birth: string | null;
    gender: AnimalGender;
    status: AnimalStatus;
    lactation_status: LactationStatus;
    weight: number | null;
    notes: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Calf {
    id: string;
    tag_number: string;
    name: string | null;
    breed: string | null;
    date_of_birth: string | null;
    gender: AnimalGender | null;
    mother_id: string | null;
    father_tag: string | null;
    birth_weight: number | null;
    status: AnimalStatus;
    weaning_date: string | null;
    notes: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    mother?: Partial<Cattle>;
}

export interface HealthRecord {
    id: string;
    created_at: string;
    record_date: string;
    diagnosis: string | null;
    treatment: string | null;
    veterinarian: string | null;
    cost: number;
    status: HealthStatus;
    notes: string | null;
    // Discriminated union could be used here, but for simplicity:
    cattle_id?: string;
    calf_id?: string;
}

export interface Vaccination {
    id: string;
    animal_type: 'cattle' | 'calf';
    animal_id: string;
    vaccine_name: string;
    scheduled_date: string;
    administered_date: string | null;
    status: VaccinationStatus;
    performer: string | null;
    batch_number: string | null;
    notes: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MILK MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface DailyMilkProduction {
    id: string;
    date: string;
    shift: 'morning' | 'evening';
    animal_id: string | null;
    quantity_liters: number;
    fat_rate: number | null;
    protein_rate: number | null;
    lactose_rate: number | null;
    somatic_cell_count: number | null;
    note: string | null;
    created_at: string;
    // Joined data
    animal?: Cattle;
}

export interface MilkInventory {
    id: string;
    date: string;
    opening_balance: number;
    total_produced: number;
    total_collected: number;
    total_sold: number;
    total_production_used: number;
    total_calf_consumed: number;
    total_waste: number;
    total_to_factory: number;
    closing_balance: number;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface MilkQualityTest {
    id: string;
    date: string;
    sample_source: string;
    source_id: string | null;
    ph_level: number | null;
    fat_rate: number | null;
    antibiotic_test: boolean;
    result: QualityStatus;
    tester_name: string | null;
    notes: string | null;
}

export interface CalfMilkConsumption {
    id: string;
    date: string;
    calf_id: string;
    quantity_liters: number;
    feeding_time: 'morning' | 'evening' | 'noon' | null;
    source_cow_id: string | null;
    notes: string | null;
    created_at: string;
    // Joined data
    calf?: Calf;
    source_cow?: Cattle;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SUPPLY & COLLECTION
// ─────────────────────────────────────────────────────────────────────────────

export interface Supplier {
    id: string;
    name: string;
    phone: string | null;
    village: string | null;
    price_per_liter: number;
    is_active: boolean;
    total_collected: number;
    total_paid: number;
    created_at: string;
}

export interface MilkCollection {
    id: string;
    date: string;
    supplier_id: string;
    quantity_liters: number;
    temperature: number | null;
    quality_status: QualityStatus;
    unit_price: number;
    total_amount: number;
    collector_name: string | null;
    notes: string | null;
    created_at: string;
    // Joined data
    supplier?: Supplier;
}

export interface Factory {
    id: string;
    name: string;
    contact_person: string | null;
    phone: string | null;
    address: string | null;
    contract_price: number | null;
}

export interface FactoryShipment {
    id: string;
    date: string;
    factory_id: string;
    quantity_liters: number;
    fat_rate: number | null;
    ph_level: number | null;
    plate_number: string | null;
    driver_name: string | null;
    status: ShipmentStatus;
    notes: string | null;
    created_at: string;
    // Joined data
    factory?: Factory;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PRODUCTION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface Product {
    id: string;
    name: string;
    category: string;
    unit: string;
    unit_price: number;
    stock_quantity: number;
    shelf_life_days: number;
    min_stock_alert: number;
    milk_per_unit?: number;
    cost_per_unit?: number;
    sku?: string;
    notes?: string;
    image_url?: string | null;
    is_active: boolean;
    created_at: string;
}

export interface ProductionBatch {
    id: string;
    batch_number: string;
    product_id: string;
    start_date: string;
    end_date: string | null;
    milk_used_liters: number;
    quantity_produced: number | null;
    unit: string;
    expiration_date: string | null;
    status: 'planned' | 'in_progress' | 'maturing' | 'completed' | 'failed';
    notes: string | null;
    created_at: string;
    // Joined data
    product?: Product;
}

export interface ProductionMilkSource {
    id: string;
    batch_id: string;
    source_type: 'farm_tank' | 'collection' | 'specific_cow';
    source_date: string | null;
    quantity_used: number;
    notes: string | null;
}

export interface ProductStock {
    id: string;
    product_id: string;
    batch_id: string | null;
    quantity: number;
    location: string | null;
    updated_at: string;
    // Joined data
    product?: Product;
    batch?: ProductionBatch;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DISTRIBUTION & SALES
// ─────────────────────────────────────────────────────────────────────────────

export interface Region {
    id: string;
    name: string;
    city: string | null;
    description: string | null;
}

export interface Retailer {
    id: string;
    name: string;
    region_id: string | null;
    contact_person: string | null;
    phone: string | null;
    address: string | null;
    current_balance: number;
    status: string;
    // Joined data
    region?: Region;
}

export interface Shipment {
    id: string;
    shipment_number: string | null;
    date: string;
    driver_name: string | null;
    vehicle_plate: string | null;
    route_id: string | null;
    status: ShipmentStatus;
    notes: string | null;
    // Joined data
    route?: Region;
    items?: ShipmentItem[];
}

export interface ShipmentItem {
    id: string;
    shipment_id: string;
    product_id: string;
    batch_id: string | null;
    quantity: number;
    unit_price: number | null;
    // Joined data
    product?: Product;
    batch?: ProductionBatch;
}

export interface Sale {
    id: string;
    date: string;
    retailer_id: string | null;
    total_amount: number;
    payment_status: 'pending' | 'partial' | 'paid';
    payment_method: string | null;
    invoice_number: string | null;
    notes: string | null;
    customer_name?: string | null;
    // Joined data
    retailer?: Retailer;
    items?: SaleItem[];
}

export interface SaleItem {
    id: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    // Joined data
    product?: Product;
}

export interface Return {
    id: string;
    date: string;
    retailer_id: string | null;
    status: ReturnStatus;
    total_refund_amount: number;
    processed_by: string | null;
    notes: string | null;
    // Joined data
    retailer?: Retailer;
    items?: ReturnItem[];
}

export interface ReturnItem {
    id: string;
    return_id: string;
    product_id: string;
    batch_id: string | null;
    quantity: number;
    reason: ReturnReason;
    action_taken: ReturnAction | null;
    notes: string | null;
    // Joined data
    product?: Product;
    batch?: ProductionBatch;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. FINANCE & LOGS
// ─────────────────────────────────────────────────────────────────────────────

export type ExpenseCategory = 'feed' | 'veterinary' | 'fuel' | 'labor' | 'maintenance' | 'utilities' | 'other';

export interface Expense {
    id: string;
    date: string;
    category: ExpenseCategory;
    amount: number;
    description: string | null;
    paid_to: string | null;
    created_at: string;
}

export interface FinancialTransaction {
    id: string;
    date: string;
    type: TransactionType;
    category: string;
    amount: number;
    description: string | null;
    related_entity_type: string | null;
    related_entity_id: string | null;
}

export interface Notification {
    id: string;
    user_id: string | null;
    title: string;
    message: string;
    type: NotificationType;
    module: NotificationModule | null;
    is_read: boolean;
    link: string | null;
    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. USER
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    email: string;
    name?: string;
    role?: 'admin' | 'manager' | 'worker' | string;
    phone?: string | null;
    created_at?: string;
    is_active?: boolean;
}

export interface DashboardStats {
    todayMilk: number;
    totalAnimals: number;
    activeCows: number;
    totalCalves: number;
    activeProduction: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    tankBalance: number;
}
