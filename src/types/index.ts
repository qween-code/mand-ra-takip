// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Core Types
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'worker';

export interface User {
    id: string;
    email: string | null;
    name: string;
    role: UserRole;
    phone: string | null;
    created_at: string;
    is_active: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Animal Types
// ─────────────────────────────────────────────────────────────────────────────

export type AnimalType = 'cow' | 'calf' | 'bull';
export type AnimalGender = 'male' | 'female';
export type AnimalStatus = 'active' | 'sold' | 'deceased' | 'sick' | 'dry';

export interface Animal {
    id: string;
    ear_tag: string;
    name: string | null;
    type: AnimalType;
    gender: AnimalGender;
    birth_date: string | null;
    mother_id: string | null;
    father_id: string | null;
    breed: string | null;
    weight_kg: number | null;
    purchase_date: string | null;
    purchase_price: number;
    status: AnimalStatus;
    lactation_number: number;
    last_calving_date: string | null;
    expected_calving_date: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    mother?: Animal | null;
}

export type HealthRecordType = 'vaccination' | 'treatment' | 'checkup' | 'birth' | 'insemination' | 'pregnancy_check' | 'other';

export interface HealthRecord {
    id: string;
    animal_id: string;
    record_type: HealthRecordType;
    date: string;
    vet_name: string | null;
    diagnosis: string | null;
    medication: string | null;
    dosage: string | null;
    cost: number;
    withdrawal_period_days: number;
    next_due_date: string | null;
    notes: string | null;
    created_at: string;
}

export type FeedCategory = 'roughage' | 'concentrate' | 'supplement' | 'other';

export interface FeedType {
    id: string;
    name: string;
    unit: string;
    unit_cost: number;
    category: FeedCategory;
    is_active: boolean;
    created_at: string;
}

export interface FeedLog {
    id: string;
    date: string;
    animal_id: string | null;
    feed_type_id: string;
    quantity: number;
    notes: string | null;
    created_at: string;
    // Joined data
    feed_type?: FeedType;
    animal?: Animal;
}

// ─────────────────────────────────────────────────────────────────────────────
// Milk Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MilkInventory {
    id: string;
    date: string;
    opening_balance: number;
    total_produced: number;
    total_collected: number;
    total_returned: number;
    total_calf_consumed: number;
    total_to_factory: number;
    total_production_used: number;
    total_sold: number;
    total_waste: number;
    closing_balance: number;
    created_at: string;
    updated_at: string;
}

export type MilkShift = 'morning' | 'evening';

export interface DailyMilkProduction {
    id: string;
    date: string;
    animal_id: string;
    shift: MilkShift;
    quantity_liters: number;
    fat_percentage: number | null;
    protein_percentage: number | null;
    ph_level: number | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    // Joined data
    animal?: Animal;
}

export type FeedingTime = 'morning' | 'noon' | 'evening';

export interface CalfMilkConsumption {
    id: string;
    date: string;
    calf_id: string;
    source_cow_id: string | null;
    quantity_liters: number;
    feeding_time: FeedingTime | null;
    notes: string | null;
    created_at: string;
    // Joined data
    calf?: Animal;
    source_cow?: Animal;
}

export type MilkTransactionType = 'milking' | 'collection' | 'return_in' | 'calf_feeding' | 'factory_out' | 'production' | 'sale' | 'waste';

export interface MilkTransaction {
    id: string;
    date: string;
    transaction_type: MilkTransactionType;
    amount: number;
    source_type: string | null;
    source_id: string | null;
    destination_type: string | null;
    destination_id: string | null;
    related_record_id: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Supplier Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Supplier {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    village: string | null;
    bank_iban: string | null;
    price_per_liter: number;
    is_active: boolean;
    total_collected: number;
    total_paid: number;
    notes: string | null;
    created_at: string;
}

export type QualityStatus = 'good' | 'acceptable' | 'rejected';
export type PaymentStatus = 'pending' | 'paid' | 'partial';

export interface MilkCollection {
    id: string;
    date: string;
    supplier_id: string;
    quantity_liters: number;
    temperature: number | null;
    ph_level: number | null;
    fat_percentage: number | null;
    quality_status: QualityStatus;
    unit_price: number | null;
    total_amount: number;
    payment_status: 'pending' | 'paid';
    collector_name: string | null;
    notes: string | null;
    created_at: string;
    // Joined data
    supplier?: Supplier;
}

// ─────────────────────────────────────────────────────────────────────────────
// Production Types
// ─────────────────────────────────────────────────────────────────────────────

export type ProductCategory = 'yogurt' | 'cheese' | 'butter' | 'ice_cream' | 'milk' | 'other';

export interface Product {
    id: string;
    name: string;
    sku: string | null;
    category: ProductCategory;
    unit: string;
    unit_price: number;
    cost_per_unit: number;
    milk_per_unit: number;
    shelf_life_days: number;
    is_active: boolean;
    stock_quantity: number;
    min_stock_alert: number;
    notes: string | null;
    created_at: string;
}

export type BatchStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface ProductionBatch {
    id: string;
    batch_number: string;
    product_id: string;
    production_date: string;
    milk_used_liters: number;
    quantity_produced: number;
    unit: string;
    production_cost: number;
    expiry_date: string | null;
    status: BatchStatus;
    quality_check_passed: boolean | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    // Joined data
    product?: Product;
    milk_sources?: ProductionMilkSource[];
}

export type MilkSourceType = 'cow' | 'supplier' | 'return';

export interface ProductionMilkSource {
    id: string;
    batch_id: string;
    source_type: MilkSourceType;
    source_id: string;
    quantity_liters: number;
    source_date: string | null;
    notes: string | null;
    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Distribution Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Region {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
}

export type RetailerType = 'market' | 'restaurant' | 'individual' | 'distributor' | 'other';

export interface Retailer {
    id: string;
    region_id: string | null;
    name: string;
    type: RetailerType;
    contact_name: string | null;
    phone: string | null;
    address: string | null;
    credit_limit: number;
    current_balance: number;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    // Joined data
    region?: Region;
}

export type ShipmentStatus = 'preparing' | 'in_transit' | 'delivered' | 'cancelled';

export interface Shipment {
    id: string;
    shipment_number: string;
    date: string;
    retailer_id: string;
    status: ShipmentStatus;
    driver_name: string | null;
    vehicle_plate: string | null;
    departure_time: string | null;
    delivery_time: string | null;
    total_items: number;
    total_amount: number;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    // Joined data
    retailer?: Retailer;
    items?: ShipmentItem[];
}

export interface ShipmentItem {
    id: string;
    shipment_id: string;
    product_id: string;
    batch_id: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    // Joined data
    product?: Product;
    batch?: ProductionBatch;
}

// ─────────────────────────────────────────────────────────────────────────────
// Return Types
// ─────────────────────────────────────────────────────────────────────────────

export type ReturnType = 'product' | 'milk';
export type ReturnReason = 'expired' | 'near_expiry' | 'damaged' | 'quality' | 'unsold' | 'other';
export type ReturnCondition = 'good' | 'acceptable' | 'damaged' | 'spoiled';
export type ReturnAction = 'restock' | 'discount_sale' | 'production' | 'dispose';

export interface Return {
    id: string;
    date: string;
    retailer_id: string;
    shipment_id: string | null;
    return_type: ReturnType;
    product_id: string | null;
    batch_id: string | null;
    quantity: number;
    reason: ReturnReason | null;
    condition: ReturnCondition | null;
    action_taken: ReturnAction | null;
    financial_impact: number;
    notes: string | null;
    inspected_by: string | null;
    created_at: string;
    // Joined data
    retailer?: Retailer;
    product?: Product;
    batch?: ProductionBatch;
}

// ─────────────────────────────────────────────────────────────────────────────
// Financial Types
// ─────────────────────────────────────────────────────────────────────────────

export type SaleType = 'direct' | 'wholesale' | 'retail';
export type PaymentMethod = 'cash' | 'credit' | 'bank_transfer' | 'other';

export interface Sale {
    id: string;
    date: string;
    customer_name: string | null;
    retailer_id: string | null;
    sale_type: SaleType;
    total_amount: number;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    // Joined data
    retailer?: Retailer;
    items?: SaleItem[];
}

export type SaleItemType = 'product' | 'milk';

export interface SaleItem {
    id: string;
    sale_id: string;
    item_type: SaleItemType;
    product_id: string | null;
    batch_id: string | null;
    milk_liters: number | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    // Joined data
    product?: Product;
}

export type ExpenseCategory = 'feed' | 'veterinary' | 'fuel' | 'labor' | 'maintenance' | 'utilities' | 'other';

export interface Expense {
    id: string;
    date: string;
    category: ExpenseCategory;
    amount: number;
    description: string | null;
    paid_to: string | null;
    payment_method: string | null;
    related_animal_id: string | null;
    receipt_number: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
}

export type FactoryShipmentStatus = 'sent' | 'accepted' | 'rejected' | 'partial';

export interface FactoryShipment {
    id: string;
    date: string;
    factory_name: string;
    quantity_sent: number;
    quantity_accepted: number | null;
    fat_percentage: number | null;
    protein_percentage: number | null;
    unit_price: number | null;
    total_amount: number;
    status: FactoryShipmentStatus;
    driver_name: string | null;
    vehicle_plate: string | null;
    notes: string | null;
    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Types
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface NotificationSetting {
    id: string;
    user_id: string | null;
    module: string;
    is_enabled: boolean;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string | null;
    type: NotificationType;
    module: string;
    title: string;
    message: string;
    is_read: boolean;
    action_url: string | null;
    related_id: string | null;
    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Types
// ─────────────────────────────────────────────────────────────────────────────

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

export interface RecentActivity {
    id: string;
    type: 'milk' | 'sale' | 'production' | 'health' | 'expense';
    title: string;
    description: string;
    timestamp: string;
    icon?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Form Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MilkEntryFormData {
    date: string;
    entries: {
        animal_id: string;
        morning: number;
        evening: number;
    }[];
}

export interface CalfFeedingFormData {
    date: string;
    calf_id: string;
    source_cow_id: string | null;
    quantity: number;
    feeding_time: FeedingTime;
}

export interface ProductionFormData {
    product_id: string;
    milk_sources: {
        source_type: MilkSourceType;
        source_id: string;
        quantity: number;
    }[];
    quantity_produced: number;
    notes?: string;
}
