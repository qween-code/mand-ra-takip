export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            animals: {
                Row: {
                    birth_date: string | null
                    created_at: string
                    gender: string | null
                    id: string
                    mother_id: string | null
                    name: string | null
                    notes: string | null
                    status: string | null
                    tag_number: string
                    type: string
                }
                Insert: {
                    birth_date?: string | null
                    created_at?: string
                    gender?: string | null
                    id?: string
                    mother_id?: string | null
                    name?: string | null
                    notes?: string | null
                    status?: string | null
                    tag_number: string
                    type: string
                }
                Update: {
                    birth_date?: string | null
                    created_at?: string
                    gender?: string | null
                    id?: string
                    mother_id?: string | null
                    name?: string | null
                    notes?: string | null
                    status?: string | null
                    tag_number?: string
                    type?: string
                }
                Relationships: []
            }
            expenses: {
                Row: {
                    amount: number
                    category: string
                    created_at: string
                    date: string
                    description: string | null
                    id: string
                    related_id: string | null
                }
                Insert: {
                    amount: number
                    category: string
                    created_at?: string
                    date?: string
                    description?: string | null
                    id?: string
                    related_id?: string | null
                }
                Update: {
                    amount?: number
                    category?: string
                    created_at?: string
                    date?: string
                    description?: string | null
                    id?: string
                    related_id?: string | null
                }
                Relationships: []
            }
            feed_logs: {
                Row: {
                    animal_id: string | null
                    created_at: string
                    date: string
                    feed_type: string
                    id: string
                    notes: string | null
                    quantity: number
                    quantity_kg: number
                    total_cost: number | null
                    unit_cost: number
                }
                Insert: {
                    animal_id?: string | null
                    created_at?: string
                    date?: string
                    feed_type: string
                    id?: string
                    notes?: string | null
                    quantity?: number
                    quantity_kg: number
                    unit_cost: number
                }
                Update: {
                    animal_id?: string | null
                    created_at?: string
                    date?: string
                    feed_type?: string
                    id?: string
                    notes?: string | null
                    quantity?: number
                    quantity_kg?: number
                    unit_cost?: number
                }
                Relationships: []
            }
            health_records: {
                Row: {
                    animal_id: string
                    cost: number | null
                    created_at: string
                    date: string
                    description: string | null
                    id: string
                    next_checkup_date: string | null
                    performed_by: string | null
                    record_type: string
                    treatment_type: string | null
                }
                Insert: {
                    animal_id: string
                    cost?: number | null
                    created_at?: string
                    date?: string
                    description?: string | null
                    id?: string
                    next_checkup_date?: string | null
                    performed_by?: string | null
                    record_type: string
                    treatment_type?: string | null
                }
                Update: {
                    animal_id?: string
                    cost?: number | null
                    created_at?: string
                    date?: string
                    description?: string | null
                    id?: string
                    next_checkup_date?: string | null
                    performed_by?: string | null
                    record_type?: string
                    treatment_type?: string | null
                }
                Relationships: []
            }
            milk_records: {
                Row: {
                    animal_id: string | null
                    created_at: string
                    date: string
                    fat_rate: number | null
                    id: string
                    notes: string | null
                    ph_level: number | null
                    quantity_liters: number
                    shift: string
                }
                Insert: {
                    animal_id?: string | null
                    created_at?: string
                    date?: string
                    fat_rate?: number | null
                    id?: string
                    notes?: string | null
                    ph_level?: number | null
                    quantity_liters: number
                    shift: string
                }
                Update: {
                    animal_id?: string | null
                    created_at?: string
                    date?: string
                    fat_rate?: number | null
                    id?: string
                    notes?: string | null
                    ph_level?: number | null
                    quantity_liters?: number
                    shift?: string
                }
                Relationships: []
            }
            milk_usage: {
                Row: {
                    created_at: string
                    date: string
                    id: string
                    notes: string | null
                    quantity_liters: number
                    related_batch_id: string | null
                    related_calf_id: string | null
                    usage_type: string
                }
                Insert: {
                    created_at?: string
                    date?: string
                    id?: string
                    notes?: string | null
                    quantity_liters: number
                    related_batch_id?: string | null
                    related_calf_id?: string | null
                    usage_type: string
                }
                Update: {
                    created_at?: string
                    date?: string
                    id?: string
                    notes?: string | null
                    quantity_liters?: number
                    related_batch_id?: string | null
                    related_calf_id?: string | null
                    usage_type?: string
                }
                Relationships: []
            }
            production_batches: {
                Row: {
                    batch_number: string
                    created_at: string
                    end_time: string | null
                    id: string
                    milk_used_liters: number
                    output_quantity: number | null
                    output_unit: string | null
                    product_type: string
                    start_time: string | null
                    status: string | null
                }
                Insert: {
                    batch_number: string
                    created_at?: string
                    end_time?: string | null
                    id?: string
                    milk_used_liters: number
                    output_quantity?: number | null
                    output_unit?: string | null
                    product_type: string
                    start_time?: string | null
                    status?: string | null
                }
                Update: {
                    batch_number?: string
                    created_at?: string
                    end_time?: string | null
                    id?: string
                    milk_used_liters?: number
                    output_quantity?: number | null
                    output_unit?: string | null
                    product_type?: string
                    start_time?: string | null
                    status?: string | null
                }
                Relationships: []
            }
            product_transfers: {
                Row: {
                    created_at: string
                    date: string
                    driver_name: string | null
                    id: string
                    product_id: string
                    quantity: number
                    source_region_id: string | null
                    source_type: string
                    status: string | null
                    target_region_id: string | null
                    target_sales_point_id: string | null
                    target_type: string
                    vehicle_plate: string | null
                }
                Insert: {
                    created_at?: string
                    date?: string
                    driver_name?: string | null
                    id?: string
                    product_id: string
                    quantity: number
                    source_region_id?: string | null
                    source_type: string
                    status?: string | null
                    target_region_id?: string | null
                    target_sales_point_id?: string | null
                    target_type: string
                    vehicle_plate?: string | null
                }
                Update: {
                    created_at?: string
                    date?: string
                    driver_name?: string | null
                    id?: string
                    product_id?: string
                    quantity?: number
                    source_region_id?: string | null
                    source_type?: string
                    status?: string | null
                    target_region_id?: string | null
                    target_sales_point_id?: string | null
                    target_type?: string
                    vehicle_plate?: string | null
                }
                Relationships: []
            }
            products: {
                Row: {
                    category: string | null
                    created_at: string
                    id: string
                    name: string
                    sku: string | null
                    stock_quantity: number | null
                    unit_price: number
                }
                Insert: {
                    category?: string | null
                    created_at?: string
                    id?: string
                    name: string
                    sku?: string | null
                    stock_quantity?: number | null
                    unit_price: number
                }
                Update: {
                    category?: string | null
                    created_at?: string
                    id?: string
                    name?: string
                    sku?: string | null
                    stock_quantity?: number | null
                    unit_price?: number
                }
                Relationships: []
            }
            regions: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                }
                Relationships: []
            }
            returns: {
                Row: {
                    created_at: string
                    id: string
                    product_id: string | null
                    quantity: number
                    reason: string | null
                    sale_id: string | null
                    status: string | null
                }
                Insert: {
                    created_at?: string
                    id?: string
                    product_id?: string | null
                    quantity: number
                    reason?: string | null
                    sale_id?: string | null
                    status?: string | null
                }
                Update: {
                    created_at?: string
                    id?: string
                    product_id?: string | null
                    quantity?: number
                    reason?: string | null
                    sale_id?: string | null
                    status?: string | null
                }
                Relationships: []
            }
            sales: {
                Row: {
                    created_at: string
                    customer_name: string | null
                    id: string
                    items: Json | null
                    payment_status: string | null
                    sales_point_id: string | null
                    total_amount: number
                }
                Insert: {
                    created_at?: string
                    customer_name?: string | null
                    id?: string
                    items?: Json | null
                    payment_status?: string | null
                    sales_point_id?: string | null
                    total_amount: number
                }
                Update: {
                    created_at?: string
                    customer_name?: string | null
                    id?: string
                    items?: Json | null
                    payment_status?: string | null
                    sales_point_id?: string | null
                    total_amount?: number
                }
                Relationships: []
            }
            sales_points: {
                Row: {
                    contact_info: string | null
                    created_at: string
                    id: string
                    name: string
                    region_id: string | null
                    type: string | null
                }
                Insert: {
                    contact_info?: string | null
                    created_at?: string
                    id?: string
                    name: string
                    region_id?: string | null
                    type?: string | null
                }
                Update: {
                    contact_info?: string | null
                    created_at?: string
                    id?: string
                    name?: string
                    region_id?: string | null
                    type?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Simplified helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
