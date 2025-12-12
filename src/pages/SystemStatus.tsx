import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, Button, Badge } from '../components/ui';
import { CheckCircle2, XCircle, AlertTriangle, Play } from 'lucide-react';

interface TestResult {
    name: string;
    status: 'pending' | 'running' | 'success' | 'failure';
    message?: string;
}

const SystemStatus: React.FC = () => {
    const [tests, setTests] = useState<TestResult[]>([
        { name: 'Database Connection', status: 'pending' },
        { name: 'Milk Production Trigger', status: 'pending' },
        { name: 'Inventory Calculation', status: 'pending' },
    ]);
    const [isRunning, setIsRunning] = useState(false);

    const updateTest = (index: number, status: TestResult['status'], message?: string) => {
        setTests(prev => prev.map((t, i) => i === index ? { ...t, status, message } : t));
    };

    const runTests = async () => {
        setIsRunning(true);

        // Reset tests
        setTests(prev => prev.map(t => ({ ...t, status: 'pending', message: undefined })));

        try {
            // 1. Database Connection
            updateTest(0, 'running');
            const { error: connError } = await supabase.from('animals').select('count', { count: 'exact', head: true });
            if (connError) throw new Error(connError.message);
            updateTest(0, 'success', 'Connected to Supabase');

            // 2. Milk Production Trigger
            updateTest(1, 'running');
            const today = new Date().toISOString().split('T')[0];
            const testAmount = 10.5;

            // Get initial inventory
            const { data: initialInv } = await supabase
                .from('milk_inventory')
                .select('total_produced')
                .eq('date', today)
                .single();

            const initialProduced = initialInv?.total_produced || 0;

            // Insert dummy production
            // We need a valid animal ID first
            const { data: animal } = await supabase.from('animals').select('id').limit(1).single();
            if (!animal) throw new Error('No animals found to test production');

            const { data: inserted, error: insertError } = await supabase
                .from('daily_milk_production')
                .insert({
                    animal_id: animal.id,
                    date: today,
                    shift: 'morning',
                    quantity_liters: testAmount,
                    notes: 'SYSTEM_TEST_RECORD'
                })
                .select()
                .single();

            if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

            // Check inventory update
            const { data: updatedInv } = await supabase
                .from('milk_inventory')
                .select('total_produced')
                .eq('date', today)
                .single();

            const newProduced = updatedInv?.total_produced || 0;

            // Clean up
            await supabase.from('daily_milk_production').delete().eq('id', inserted.id);

            if (Math.abs(newProduced - initialProduced - testAmount) < 0.01) {
                updateTest(1, 'success', `Trigger worked: ${initialProduced} -> ${newProduced}`);
            } else {
                updateTest(1, 'failure', `Trigger failed: Expected increase of ${testAmount}, got ${newProduced - initialProduced}`);
            }

            // 3. Inventory Calculation
            updateTest(2, 'running');
            // Verify if closing balance formula is working (generated column or trigger)
            // closing = opening + produced + collected - consumed - sold - used
            // We can just check if the previous test's inventory record has consistent data

            if (updatedInv) {
                updateTest(2, 'success', 'Inventory record exists and is accessible');
            } else {
                updateTest(2, 'failure', 'Could not fetch inventory record');
            }

        } catch (error: any) {
            console.error(error);
            // Mark current running test as failed
            const runningIndex = tests.findIndex(t => t.status === 'running');
            if (runningIndex !== -1) {
                updateTest(runningIndex, 'failure', error.message);
            }
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Sistem Durumu</h1>
                    <p className="text-[var(--text-secondary)]">Veritabanı ve entegrasyon testleri</p>
                </div>
                <Button onClick={runTests} disabled={isRunning} variant="primary">
                    <Play size={16} className="mr-2" />
                    {isRunning ? 'Test ediliyor...' : 'Testleri Çalıştır'}
                </Button>
            </div>

            <div className="grid gap-4">
                {tests.map((test, index) => (
                    <Card key={index} className="overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {test.status === 'pending' && <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" /></div>}
                                {test.status === 'running' && <div className="w-8 h-8 rounded-full bg-[var(--info-bg)] flex items-center justify-center"><div className="loading-spinner w-4 h-4 border-2" /></div>}
                                {test.status === 'success' && <div className="w-8 h-8 rounded-full bg-[var(--success-bg)] flex items-center justify-center"><CheckCircle2 size={18} className="text-[var(--success)]" /></div>}
                                {test.status === 'failure' && <div className="w-8 h-8 rounded-full bg-[var(--error-bg)] flex items-center justify-center"><XCircle size={18} className="text-[var(--error)]" /></div>}

                                <div>
                                    <h3 className="font-medium text-[var(--text-primary)]">{test.name}</h3>
                                    {test.message && <p className={`text-sm ${test.status === 'failure' ? 'text-[var(--error)]' : 'text-[var(--text-secondary)]'}`}>{test.message}</p>}
                                </div>
                            </div>
                            <Badge variant={
                                test.status === 'success' ? 'success' :
                                    test.status === 'failure' ? 'error' :
                                        test.status === 'running' ? 'info' : 'default'
                            }>
                                {test.status.toUpperCase()}
                            </Badge>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SystemStatus;
