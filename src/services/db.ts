// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - DATABASE SERVICE
// Simplified database helper functions using new schema
// ═══════════════════════════════════════════════════════════════════════════

import { supabase } from '../lib/supabase';

// Re-export supabase for convenience
export { supabase };

// ─────────────────────────────────────────────────────────────────────────────
// Milk Inventory Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const getTankStatus = async (date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const { data } = await supabase
        .from('milk_inventory')
        .select('closing_balance')
        .eq('date', targetDate)
        .single();
    return data?.closing_balance || 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// Animal Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const getActiveCows = async () => {
    const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('type', 'cow')
        .eq('status', 'active')
        .order('name');

    if (error) {
        console.error('Error fetching cows:', error);
        return [];
    }
    return data || [];
};

export const getActiveCalves = async () => {
    const { data, error } = await supabase
        .from('animals')
        .select('*, mother:animals!mother_id(name)')
        .eq('type', 'calf')
        .eq('status', 'active')
        .order('name');

    if (error) {
        console.error('Error fetching calves:', error);
        return [];
    }
    return data || [];
};

// ─────────────────────────────────────────────────────────────────────────────
// Milk Production Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const getMilkProduction = async (date: string) => {
    const { data, error } = await supabase
        .from('daily_milk_production')
        .select('*')
        .eq('date', date);

    if (error) {
        console.error('Error fetching milk production:', error);
        return [];
    }
    return data || [];
};

export const saveMilkProduction = async (
    animalId: string,
    shift: 'morning' | 'evening',
    quantity: number,
    date: string
) => {
    // Check if record exists
    const { data: existing } = await supabase
        .from('daily_milk_production')
        .select('id')
        .eq('animal_id', animalId)
        .eq('date', date)
        .eq('shift', shift)
        .single();

    if (existing) {
        // Update existing
        return supabase
            .from('daily_milk_production')
            .update({ quantity_liters: quantity })
            .eq('id', existing.id);
    } else {
        // Insert new
        return supabase
            .from('daily_milk_production')
            .insert({
                animal_id: animalId,
                date,
                shift,
                quantity_liters: quantity,
            });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Calf Consumption Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const getCalfConsumption = async (date: string) => {
    const { data, error } = await supabase
        .from('calf_milk_consumption')
        .select('*, calf:animals!calf_id(*)')
        .eq('date', date);

    if (error) {
        console.error('Error fetching calf consumption:', error);
        return [];
    }
    return data || [];
};

export const saveCalfConsumption = async (
    calfId: string,
    quantity: number,
    date: string,
    sourceCowId?: string
) => {
    // Check if record exists
    const { data: existing } = await supabase
        .from('calf_milk_consumption')
        .select('id')
        .eq('calf_id', calfId)
        .eq('date', date)
        .single();

    if (existing) {
        return supabase
            .from('calf_milk_consumption')
            .update({ quantity_liters: quantity })
            .eq('id', existing.id);
    } else {
        return supabase
            .from('calf_milk_consumption')
            .insert({
                calf_id: calfId,
                date,
                quantity_liters: quantity,
                source_cow_id: sourceCowId || null,
                feeding_time: 'morning',
            });
    }
};
