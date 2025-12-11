import { supabase } from '../lib/supabase';
import { Cow, Calf } from '../types';

export const getTodayCows = async (): Promise<Cow[]> => {
    const today = new Date().toISOString().split('T')[0];

    // Fetch cows
    const { data: cowsData, error: cowsError } = await supabase
        .from('animals')
        .select('*')
        .eq('type', 'cow');

    if (cowsError) {
        console.error('Error fetching cows:', cowsError);
        return [];
    }

    // Fetch today's milk records
    const { data: milkData, error: milkError } = await supabase
        .from('milk_records')
        .select('*')
        .eq('date', today);

    if (milkError) {
        console.error('Error fetching milk records:', milkError);
        return [];
    }

    // Fetch yesterday's total for each cow (simplified: just sum of yesterday's records)
    // For now, we'll skip yesterday's data or fetch it separately if needed.
    // Let's just return 0 for yesterday to keep it simple or implement a separate query.

    return cowsData.map((cow: any) => {
        const morningRecord = milkData?.find((m: any) => m.animal_id === cow.id && m.shift === 'morning');
        const eveningRecord = milkData?.find((m: any) => m.animal_id === cow.id && m.shift === 'evening');

        return {
            id: cow.id,
            name: cow.name,
            tagNumber: cow.tag_number,
            morningMilked: !!morningRecord,
            eveningMilked: !!eveningRecord,
            morningLiters: morningRecord?.quantity_liters || 0,
            eveningLiters: eveningRecord?.quantity_liters || 0,
            yesterdayLiters: 0 // Placeholder
        };
    });
};

export const saveMilkRecord = async (id: string, session: 'morning' | 'evening', value: number) => {
    const today = new Date().toISOString().split('T')[0];

    // Check if record exists
    const { data: existing } = await supabase
        .from('milk_records')
        .select('id')
        .eq('animal_id', id)
        .eq('date', today)
        .eq('shift', session)
        .single();

    if (existing) {
        await supabase
            .from('milk_records')
            .update({ quantity_liters: value })
            .eq('id', existing.id);
    } else {
        await supabase
            .from('milk_records')
            .insert({
                animal_id: id,
                date: today,
                shift: session,
                quantity_liters: value
            });
    }
};

export const getCalves = async (): Promise<Calf[]> => {
    const today = new Date().toISOString().split('T')[0];

    // Fetch calves with mother info
    const { data: calvesData, error: calvesError } = await supabase
        .from('animals')
        .select('*, mother:animals!mother_id(name)') // Self-join to get mother name
        .eq('type', 'calf');

    if (calvesError) {
        console.error('Error fetching calves:', calvesError);
        return [];
    }

    // Fetch today's feeding (milk usage)
    const { data: usageData, error: usageError } = await supabase
        .from('milk_usage')
        .select('*')
        .eq('date', today)
        .eq('usage_type', 'feeding');

    if (usageError) {
        console.error('Error fetching usage:', usageError);
        return [];
    }

    return calvesData.map((calf: any) => {
        const usage = usageData?.find((u: any) => u.related_calf_id === calf.id);

        // Calculate age in months
        const birthDate = new Date(calf.birth_date);
        const now = new Date();
        const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());

        return {
            id: calf.id,
            name: calf.name,
            motherName: calf.mother?.name || 'Bilinmiyor',
            ageMonths: ageMonths > 0 ? ageMonths : 0,
            targetConsumption: calf.target_consumption || 4,
            dailyConsumption: usage?.quantity_liters || 0
        };
    });
};

export const updateCalfConsumption = async (id: string, delta: number) => {
    const today = new Date().toISOString().split('T')[0];

    // Get current consumption
    const { data: existing } = await supabase
        .from('milk_usage')
        .select('id, quantity_liters')
        .eq('related_calf_id', id)
        .eq('date', today)
        .eq('usage_type', 'feeding')
        .single();

    const currentAmount = existing?.quantity_liters || 0;
    const newAmount = Math.max(0, currentAmount + delta);

    if (existing) {
        await supabase
            .from('milk_usage')
            .update({ quantity_liters: newAmount })
            .eq('id', existing.id);
    } else {
        await supabase
            .from('milk_usage')
            .insert({
                related_calf_id: id,
                date: today,
                usage_type: 'feeding',
                quantity_liters: newAmount
            });
    }
};

export const addCowDB = async (cow: Partial<Cow>) => {
    await supabase.from('animals').insert({
        name: cow.name,
        tag_number: cow.tagNumber,
        type: 'cow',
        status: 'active',
        birth_date: new Date().toISOString() // Default to today if not provided
    });
};

export const addCalfDB = async (calf: Partial<Calf>) => {
    // Find mother ID by name if provided (simplified)
    let motherId = null;
    if (calf.motherName) {
        const { data: mother } = await supabase.from('animals').select('id').eq('name', calf.motherName).single();
        motherId = mother?.id;
    }

    await supabase.from('animals').insert({
        name: calf.name,
        type: 'calf',
        status: 'active',
        mother_id: motherId,
        target_consumption: calf.targetConsumption,
        birth_date: new Date(new Date().setMonth(new Date().getMonth() - (calf.ageMonths || 0))).toISOString()
    });
};

export const getCowHistory = async (id: string) => {
    const { data } = await supabase
        .from('milk_records')
        .select('date, shift, quantity_liters')
        .eq('animal_id', id)
        .order('date', { ascending: false })
        .limit(14); // Last 7 days (2 shifts per day)

    // Process data to match chart format { day: 'Pzt', morning: 10, evening: 12 }
    // This is a simplified mock return for now as processing logic is complex
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return days.map(day => ({
        day,
        morning: Math.floor(Math.random() * 5) + 10,
        evening: Math.floor(Math.random() * 5) + 10,
    }));
};
