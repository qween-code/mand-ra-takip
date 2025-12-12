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
          breed: string | null
          created_at: string | null
          ear_tag: string
          expected_calving_date: string | null
          father_id: string | null
          gender: string
          id: string
          lactation_number: number | null
          last_calving_date: string | null
          mother_id: string | null
          name: string | null
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          status: string | null
          type: string
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          ear_tag: string
          expected_calving_date?: string | null
          father_id?: string | null
          gender: string
          id?: string
          lactation_number?: number | null
          last_calving_date?: string | null
          mother_id?: string | null
          name?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          status?: string | null
          type: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          ear_tag?: string
          expected_calving_date?: string | null
          father_id?: string | null
          gender?: string
          id?: string
          lactation_number?: number | null
          last_calving_date?: string | null
          mother_id?: string | null
          name?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          status?: string | null
          type?: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_father_id_fkey"
            columns: ["father_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animals_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      cattle: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          tag_number: string
          name: string | null
          breed: string | null
          date_of_birth: string | null
          gender: "female" | "male"
          status: "active" | "sold" | "deceased" | "sick" | "quarantine"
          lactation_status: "lactating" | "dry"
          weight: number | null
          notes: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tag_number: string
          name?: string | null
          breed?: string | null
          date_of_birth?: string | null
          gender?: "female" | "male"
          status?: "active" | "sold" | "deceased" | "sick" | "quarantine"
          lactation_status?: "lactating" | "dry"
          weight?: number | null
          notes?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tag_number?: string
          name?: string | null
          breed?: string | null
          date_of_birth?: string | null
          gender?: "female" | "male"
          status?: "active" | "sold" | "deceased" | "sick" | "quarantine"
          lactation_status?: "lactating" | "dry"
          weight?: number | null
          notes?: string | null
          image_url?: string | null
        }
        Relationships: []
      }
      calves: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          tag_number: string
          name: string | null
          breed: string | null
          date_of_birth: string | null
          gender: "female" | "male" | null
          mother_id: string | null
          father_tag: string | null
          birth_weight: number | null
          status: "active" | "sold" | "deceased" | "sick" | "quarantine"
          weaning_date: string | null
          notes: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tag_number: string
          name?: string | null
          breed?: string | null
          date_of_birth?: string | null
          gender?: "female" | "male" | null
          mother_id?: string | null
          father_tag?: string | null
          birth_weight?: number | null
          status?: "active" | "sold" | "deceased" | "sick" | "quarantine"
          weaning_date?: string | null
          notes?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tag_number?: string
          name?: string | null
          breed?: string | null
          date_of_birth?: string | null
          gender?: "female" | "male" | null
          mother_id?: string | null
          father_tag?: string | null
          birth_weight?: number | null
          status?: "active" | "sold" | "deceased" | "sick" | "quarantine"
          weaning_date?: string | null
          notes?: string | null
          image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calves_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "cattle"
            referencedColumns: ["id"]
          }
        ]
      }
      cattle_health_records: {
        Row: {
          id: string
          created_at: string
          cattle_id: string
          record_date: string
          diagnosis: string | null
          treatment: string | null
          veterinarian: string | null
          cost: number
          status: "healthy" | "sick" | "treatment" | "observation"
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          cattle_id: string
          record_date?: string
          diagnosis?: string | null
          treatment?: string | null
          veterinarian?: string | null
          cost?: number
          status?: "healthy" | "sick" | "treatment" | "observation"
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          cattle_id?: string
          record_date?: string
          diagnosis?: string | null
          treatment?: string | null
          veterinarian?: string | null
          cost?: number
          status?: "healthy" | "sick" | "treatment" | "observation"
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cattle_health_records_cattle_id_fkey"
            columns: ["cattle_id"]
            isOneToOne: false
            referencedRelation: "cattle"
            referencedColumns: ["id"]
          }
        ]
      }
      calf_health_records: {
        Row: {
          id: string
          created_at: string
          calf_id: string
          record_date: string
          diagnosis: string | null
          treatment: string | null
          veterinarian: string | null
          cost: number
          status: "healthy" | "sick" | "treatment" | "observation"
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          calf_id: string
          record_date?: string
          diagnosis?: string | null
          treatment?: string | null
          veterinarian?: string | null
          cost?: number
          status?: "healthy" | "sick" | "treatment" | "observation"
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          calf_id?: string
          record_date?: string
          diagnosis?: string | null
          treatment?: string | null
          veterinarian?: string | null
          cost?: number
          status?: "healthy" | "sick" | "treatment" | "observation"
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calf_health_records_calf_id_fkey"
            columns: ["calf_id"]
            isOneToOne: false
            referencedRelation: "calves"
            referencedColumns: ["id"]
          }
        ]
      }
      breeding_records: {
        Row: {
          animal_id: string
          cost: number | null
          created_at: string | null
          date: string
          details: Json | null
          id: string
          technician: string | null
          type: Database["public"]["Enums"]["breeding_event_type"]
        }
        Insert: {
          animal_id: string
          cost?: number | null
          created_at?: string | null
          date: string
          details?: Json | null
          id?: string
          technician?: string | null
          type: Database["public"]["Enums"]["breeding_event_type"]
        }
        Update: {
          animal_id?: string
          cost?: number | null
          created_at?: string | null
          date?: string
          details?: Json | null
          id?: string
          technician?: string | null
          type?: Database["public"]["Enums"]["breeding_event_type"]
        }
        Relationships: []
      }
      calf_milk_consumption: {
        Row: {
          calf_id: string
          created_at: string | null
          date: string
          feeding_time: string | null
          id: string
          notes: string | null
          quantity_liters: number
          source_cow_id: string | null
        }
        Insert: {
          calf_id: string
          created_at?: string | null
          date?: string
          feeding_time?: string | null
          id?: string
          notes?: string | null
          quantity_liters?: number
          source_cow_id?: string | null
        }
        Update: {
          calf_id?: string
          created_at?: string | null
          date?: string
          feeding_time?: string | null
          id?: string
          notes?: string | null
          quantity_liters?: number
          source_cow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calf_milk_consumption_calf_id_fkey"
            columns: ["calf_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calf_milk_consumption_source_cow_id_fkey"
            columns: ["source_cow_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_distributions: {
        Row: {
          created_at: string | null
          date: string
          distributed_amount: number | null
          id: string
          returned_amount: number | null
          sales_point_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          distributed_amount?: number | null
          id?: string
          returned_amount?: number | null
          sales_point_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          distributed_amount?: number | null
          id?: string
          returned_amount?: number | null
          sales_point_id?: string | null
        }
        Relationships: []
      }
      daily_milk_production: {
        Row: {
          animal_id: string
          created_at: string | null
          created_by: string | null
          date: string
          fat_percentage: number | null
          id: string
          notes: string | null
          ph_level: number | null
          protein_percentage: number | null
          quantity_liters: number
          shift: string
        }
        Insert: {
          animal_id: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          fat_percentage?: number | null
          id?: string
          notes?: string | null
          ph_level?: number | null
          protein_percentage?: number | null
          quantity_liters?: number
          shift: string
        }
        Update: {
          animal_id?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          fat_percentage?: number | null
          id?: string
          notes?: string | null
          ph_level?: number | null
          protein_percentage?: number | null
          quantity_liters?: number
          shift?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_milk_production_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_milk_production_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          id: string
          notes: string | null
          paid_to: string | null
          payment_method: string | null
          receipt_number: string | null
          related_animal_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          paid_to?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          related_animal_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          paid_to?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          related_animal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_related_animal_id_fkey"
            columns: ["related_animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      factory_shipments: {
        Row: {
          created_at: string | null
          date: string
          driver_name: string | null
          factory_name: string
          fat_percentage: number | null
          id: string
          notes: string | null
          protein_percentage: number | null
          quantity_accepted: number | null
          quantity_sent: number
          status: string | null
          total_amount: number | null
          unit_price: number | null
          vehicle_plate: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          driver_name?: string | null
          factory_name: string
          fat_percentage?: number | null
          id?: string
          notes?: string | null
          protein_percentage?: number | null
          quantity_accepted?: number | null
          quantity_sent: number
          status?: string | null
          total_amount?: number | null
          unit_price?: number | null
          vehicle_plate?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          driver_name?: string | null
          factory_name?: string
          fat_percentage?: number | null
          id?: string
          notes?: string | null
          protein_percentage?: number | null
          quantity_accepted?: number | null
          quantity_sent?: number
          status?: string | null
          total_amount?: number | null
          unit_price?: number | null
          vehicle_plate?: string | null
        }
        Relationships: []
      }
      farmers: {
        Row: {
          created_at: string | null
          id: string
          name: string
          phone: string | null
          region_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          region_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          region_id?: string | null
        }
        Relationships: []
      }
      feed_logs: {
        Row: {
          animal_id: string | null
          created_at: string | null
          date: string
          feed_type_id: string
          id: string
          notes: string | null
          quantity: number
        }
        Insert: {
          animal_id?: string | null
          created_at?: string | null
          date?: string
          feed_type_id: string
          id?: string
          notes?: string | null
          quantity: number
        }
        Update: {
          animal_id?: string | null
          created_at?: string | null
          date?: string
          feed_type_id?: string
          id?: string
          notes?: string | null
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
          {
            foreignKeyName: "feed_logs_feed_type_id_fkey"
            columns: ["feed_type_id"]
            isOneToOne: false
            referencedRelation: "feed_types"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_types: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          unit: string | null
          unit_cost: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          unit?: string | null
          unit_cost?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          unit?: string | null
          unit_cost?: number | null
        }
        Relationships: []
      }
      health_records: {
        Row: {
          animal_id: string
          cost: number | null
          created_at: string | null
          date: string
          diagnosis: string | null
          dosage: string | null
          id: string
          medication: string | null
          next_due_date: string | null
          notes: string | null
          record_type: string
          vet_name: string | null
          withdrawal_period_days: number | null
        }
        Insert: {
          animal_id: string
          cost?: number | null
          created_at?: string | null
          date?: string
          diagnosis?: string | null
          dosage?: string | null
          id?: string
          medication?: string | null
          next_due_date?: string | null
          notes?: string | null
          record_type: string
          vet_name?: string | null
          withdrawal_period_days?: number | null
        }
        Update: {
          animal_id?: string
          cost?: number | null
          created_at?: string | null
          date?: string
          diagnosis?: string | null
          dosage?: string | null
          id?: string
          medication?: string | null
          next_due_date?: string | null
          notes?: string | null
          record_type?: string
          vet_name?: string | null
          withdrawal_period_days?: number | null
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
      locations: {
        Row: {
          capacity: number | null
          created_at: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["location_type"]
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["location_type"]
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["location_type"]
        }
        Relationships: []
      }
      milk_collections: {
        Row: {
          collector_name: string | null
          created_at: string | null
          date: string
          fat_percentage: number | null
          id: string
          notes: string | null
          payment_status: string | null
          ph_level: number | null
          quality_status: string | null
          quantity_liters: number
          supplier_id: string
          temperature: number | null
          total_amount: number | null
          unit_price: number | null
        }
        Insert: {
          collector_name?: string | null
          created_at?: string | null
          date?: string
          fat_percentage?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          ph_level?: number | null
          quality_status?: string | null
          quantity_liters: number
          supplier_id: string
          temperature?: number | null
          total_amount?: number | null
          unit_price?: number | null
        }
        Update: {
          collector_name?: string | null
          created_at?: string | null
          date?: string
          fat_percentage?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          ph_level?: number | null
          quality_status?: string | null
          quantity_liters?: number
          supplier_id?: string
          temperature?: number | null
          total_amount?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "milk_collections_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      milk_inventory: {
        Row: {
          closing_balance: number | null
          created_at: string | null
          date: string
          id: string
          opening_balance: number | null
          total_calf_consumed: number | null
          total_collected: number | null
          total_produced: number | null
          total_production_used: number | null
          total_returned: number | null
          total_sold: number | null
          total_to_factory: number | null
          total_waste: number | null
          updated_at: string | null
        }
        Insert: {
          closing_balance?: number | null
          created_at?: string | null
          date: string
          id?: string
          opening_balance?: number | null
          total_calf_consumed?: number | null
          total_collected?: number | null
          total_produced?: number | null
          total_production_used?: number | null
          total_returned?: number | null
          total_sold?: number | null
          total_to_factory?: number | null
          total_waste?: number | null
          updated_at?: string | null
        }
        Update: {
          closing_balance?: number | null
          created_at?: string | null
          date?: string
          id?: string
          opening_balance?: number | null
          total_calf_consumed?: number | null
          total_collected?: number | null
          total_produced?: number | null
          total_production_used?: number | null
          total_returned?: number | null
          total_sold?: number | null
          total_to_factory?: number | null
          total_waste?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      milk_transactions: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          date: string
          destination_id: string | null
          destination_type: string | null
          id: string
          notes: string | null
          related_record_id: string | null
          source_id: string | null
          source_type: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          date?: string
          destination_id?: string | null
          destination_type?: string | null
          id?: string
          notes?: string | null
          related_record_id?: string | null
          source_id?: string | null
          source_type?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          date?: string
          destination_id?: string | null
          destination_type?: string | null
          id?: string
          notes?: string | null
          related_record_id?: string | null
          source_id?: string | null
          source_type?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "milk_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean | null
          module: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          module: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          module?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          module: string
          related_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          module: string
          related_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          module?: string
          related_id?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      production_batches: {
        Row: {
          batch_number: string
          created_at: string | null
          created_by: string | null
          expiry_date: string | null
          id: string
          milk_used_liters: number
          notes: string | null
          product_id: string
          production_cost: number | null
          production_date: string
          quality_check_passed: boolean | null
          quantity_produced: number
          status: string | null
          unit: string | null
        }
        Insert: {
          batch_number: string
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          milk_used_liters: number
          notes?: string | null
          product_id: string
          production_cost?: number | null
          production_date?: string
          quality_check_passed?: boolean | null
          quantity_produced: number
          status?: string | null
          unit?: string | null
        }
        Update: {
          batch_number?: string
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          milk_used_liters?: number
          notes?: string | null
          product_id?: string
          production_cost?: number | null
          production_date?: string
          quality_check_passed?: boolean | null
          quantity_produced?: number
          status?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_milk_sources: {
        Row: {
          batch_id: string
          created_at: string | null
          id: string
          notes: string | null
          quantity_liters: number
          source_date: string | null
          source_id: string
          source_type: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity_liters: number
          source_date?: string | null
          source_id: string
          source_type: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity_liters?: number
          source_date?: string | null
          source_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_milk_sources_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          milk_per_unit: number | null
          min_stock_alert: number | null
          name: string
          notes: string | null
          shelf_life_days: number | null
          sku: string | null
          stock_quantity: number | null
          unit: string | null
          unit_price: number | null
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          milk_per_unit?: number | null
          min_stock_alert?: number | null
          name: string
          notes?: string | null
          shelf_life_days?: number | null
          sku?: string | null
          stock_quantity?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Update: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          milk_per_unit?: number | null
          min_stock_alert?: number | null
          name?: string
          notes?: string | null
          shelf_life_days?: number | null
          sku?: string | null
          stock_quantity?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      retailers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          region_id: string | null
          type: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          region_id?: string | null
          type?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          region_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retailers_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          action_taken: string | null
          batch_id: string | null
          condition: string | null
          created_at: string | null
          date: string
          financial_impact: number | null
          id: string
          inspected_by: string | null
          notes: string | null
          product_id: string | null
          quantity: number
          reason: string | null
          retailer_id: string
          return_type: string
          shipment_id: string | null
        }
        Insert: {
          action_taken?: string | null
          batch_id?: string | null
          condition?: string | null
          created_at?: string | null
          date?: string
          financial_impact?: number | null
          id?: string
          inspected_by?: string | null
          notes?: string | null
          product_id?: string | null
          quantity: number
          reason?: string | null
          retailer_id: string
          return_type: string
          shipment_id?: string | null
        }
        Update: {
          action_taken?: string | null
          batch_id?: string | null
          condition?: string | null
          created_at?: string | null
          date?: string
          financial_impact?: number | null
          id?: string
          inspected_by?: string | null
          notes?: string | null
          product_id?: string | null
          quantity?: number
          reason?: string | null
          retailer_id?: string
          return_type?: string
          shipment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_inspected_by_fkey"
            columns: ["inspected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          item_type: string
          milk_liters: number | null
          product_id: string | null
          quantity: number
          sale_id: string
          total_price: number | null
          unit_price: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          item_type: string
          milk_liters?: number | null
          product_id?: string | null
          quantity: number
          sale_id: string
          total_price?: number | null
          unit_price: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          item_type?: string
          milk_liters?: number | null
          product_id?: string | null
          quantity?: number
          sale_id?: string
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_name: string | null
          date: string
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          retailer_id: string | null
          sale_type: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_name?: string | null
          date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          retailer_id?: string | null
          sale_type?: string | null
          total_amount?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_name?: string | null
          date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          retailer_id?: string | null
          sale_type?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      shipment_items: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          shipment_id: string
          total_price: number | null
          unit_price: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          shipment_id: string
          total_price?: number | null
          unit_price: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          shipment_id?: string
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "shipment_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_items_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          delivery_time: string | null
          departure_time: string | null
          driver_name: string | null
          id: string
          notes: string | null
          retailer_id: string
          shipment_number: string
          status: string | null
          total_amount: number | null
          total_items: number | null
          vehicle_plate: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          delivery_time?: string | null
          departure_time?: string | null
          driver_name?: string | null
          id?: string
          notes?: string | null
          retailer_id: string
          shipment_number: string
          status?: string | null
          total_amount?: number | null
          total_items?: number | null
          vehicle_plate?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          delivery_time?: string | null
          departure_time?: string | null
          driver_name?: string | null
          id?: string
          notes?: string | null
          retailer_id?: string
          shipment_number?: string
          status?: string | null
          total_amount?: number | null
          total_items?: number | null
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          bank_iban: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          price_per_liter: number | null
          total_collected: number | null
          total_paid: number | null
          village: string | null
        }
        Insert: {
          address?: string | null
          bank_iban?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          price_per_liter?: number | null
          total_collected?: number | null
          total_paid?: number | null
          village?: string | null
        }
        Update: {
          address?: string | null
          bank_iban?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          price_per_liter?: number | null
          total_collected?: number | null
          total_paid?: number | null
          village?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_inventory_record: {
        Args: { target_date: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      animal_origin: "born_on_farm" | "purchased"
      breeding_event_type:
      | "insemination"
      | "pregnancy_check"
      | "dry_off"
      | "calving"
      | "abortion"
      location_type: "barn" | "pasture" | "milking_parlor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      animal_origin: ["born_on_farm", "purchased"],
      breeding_event_type: [
        "insemination",
        "pregnancy_check",
        "dry_off",
        "calving",
        "abortion",
      ],
      location_type: ["barn", "pasture", "milking_parlor"],
    },
  },
} as const
