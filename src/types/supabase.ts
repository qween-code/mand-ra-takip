export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
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
                Relationships: [
                    {
                        foreignKeyName: "animals_mother_id_fkey"
                        columns: ["mother_id"]
                        isOneToOne: false
                        referencedRelation: "animals"
                        referencedColumns: ["id"]
                    },
                ]
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
                    cost: number | null
                    created_at: string
                    date: string
                    feed_type: string
                    group_id: string | null
                    id: string
                    quantity: number
                }
                Insert: {
                    animal_id?: string | null
                    cost?: number | null
                    created_at?: string
                    date?: string
                    feed_type: string
                    group_id?: string | null
                    id?: string
                    quantity: number
                }
                Update: {
                    animal_id?: string | null
                    cost?: number | null
                    created_at?: string
                    date?: string
                    feed_type?: string
                    group_id?: string | null
                    id?: string
                    quantity?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "feed_logs_animal_id_fkey"
                        columns: ["animal_id"]
                        isOneToOne: false
                        referencedRelation: "animals"
                        referencedColumns: ["id"]
                    },
                ]
            }
            health_records: {
                Row: {
                    animal_id: string | null
                    cost: number | null
                    created_at: string
                    date: string
                    description: string | null
                    id: string
                    notes: string | null
                    treatment_type: string
                    veterinarian: string | null
                }
                Insert: {
                    animal_id?: string | null
                    cost?: number | null
                    created_at?: string
                    date?: string
                    description?: string | null
                    id?: string
                    notes?: string | null
                    treatment_type: string
                    veterinarian?: string | null
                }
                Update: {
                    animal_id?: string | null
                    cost?: number | null
                    created_at?: string
                    date?: string
                    description?: string | null
                    id?: string
                    notes?: string | null
                    treatment_type?: string
                    veterinarian?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "health_records_animal_id_fkey"
                        columns: ["animal_id"]
                        isOneToOne: false
                        referencedRelation: "animals"
                        referencedColumns: ["id"]
                    },
                ]
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
                Relationships: [
                    {
                        foreignKeyName: "milk_records_animal_id_fkey"
                        columns: ["animal_id"]
                        isOneToOne: false
                        referencedRelation: "animals"
                        referencedColumns: ["id"]
                    },
                ]
            }
            milk_usage: {
                Row: {
                    amount_liters: number
                    batch_id: string | null
                    calf_id: string | null
                    created_at: string
                    date: string
                    id: string
                    notes: string | null
                    usage_type: string
                }
                Insert: {
                    amount_liters: number
                    batch_id?: string | null
                    calf_id?: string | null
                    created_at?: string
                    date?: string
                    id?: string
                    notes?: string | null
                    usage_type: string
                }
                Update: {
                    amount_liters?: number
                    batch_id?: string | null
                    calf_id?: string | null
                    created_at?: string
                    date?: string
                    id?: string
                    notes?: string | null
                    usage_type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "milk_usage_batch_id_fkey"
                        columns: ["batch_id"]
                        isOneToOne: false
                        referencedRelation: "production_batches"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "milk_usage_calf_id_fkey"
                        columns: ["calf_id"]
                        isOneToOne: false
                        referencedRelation: "animals"
                        referencedColumns: ["id"]
                    },
                ]
            }
            product_transfers: {
                Row: {
                    created_at: string
                    id: string
                    notes: string | null
                    product_id: string | null
                    quantity: number
                    source_region_id: string | null
                    status: string | null
                    target_region_id: string | null
                    target_sales_point_id: string | null
                    transfer_date: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    notes?: string | null
                    product_id?: string | null
                    quantity: number
                    source_region_id?: string | null
                    status?: string | null
                    target_region_id?: string | null
                    target_sales_point_id?: string | null
                    transfer_date?: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    notes?: string | null
                    product_id?: string | null
                    quantity?: number
                    source_region_id?: string | null
                    status?: string | null
                    target_region_id?: string | null
                    target_sales_point_id?: string | null
                    transfer_date?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "product_transfers_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "product_transfers_source_region_id_fkey"
                        columns: ["source_region_id"]
                        isOneToOne: false
                        referencedRelation: "regions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "product_transfers_target_region_id_fkey"
                        columns: ["target_region_id"]
                        isOneToOne: false
                        referencedRelation: "regions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "product_transfers_target_sales_point_id_fkey"
                        columns: ["target_sales_point_id"]
                        isOneToOne: false
                        referencedRelation: "sales_points"
                        referencedColumns: ["id"]
                    },
                ]
            }
            production_batches: {
                Row: {
                    batch_number: string
                    created_at: string
                    end_time: string | null
                    id: string
                    milk_used_liters: number
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
                    product_type?: string
                    start_time?: string | null
                    status?: string | null
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
                Relationships: [
                    {
                        foreignKeyName: "returns_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "returns_sale_id_fkey"
                        columns: ["sale_id"]
                        isOneToOne: false
                        referencedRelation: "sales"
                        referencedColumns: ["id"]
                    },
                ]
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
                Relationships: [
                    {
                        foreignKeyName: "sales_sales_point_id_fkey"
                        columns: ["sales_point_id"]
                        isOneToOne: false
                        referencedRelation: "sales_points"
                        referencedColumns: ["id"]
                    },
                ]
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
                Relationships: [
                    {
                        foreignKeyName: "sales_points_region_id_fkey"
                        columns: ["region_id"]
                        isOneToOne: false
                        referencedRelation: "regions"
                        referencedColumns: ["id"]
                    },
                ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {},
    },
} as const
