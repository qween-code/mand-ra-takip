-- Seed Data for Mandıra Asistanı

-- 1. Milk Records (Last 7 Days)
INSERT INTO public.milk_records (date, shift, quantity_liters, fat_rate, ph_level, notes) VALUES
(CURRENT_DATE - INTERVAL '6 days', 'morning', 450.5, 3.8, 6.7, 'Normal verim'),
(CURRENT_DATE - INTERVAL '6 days', 'evening', 420.0, 3.9, 6.6, ''),
(CURRENT_DATE - INTERVAL '5 days', 'morning', 460.0, 3.7, 6.8, ''),
(CURRENT_DATE - INTERVAL '5 days', 'evening', 430.2, 3.8, 6.7, 'Yem değişikliği yapıldı'),
(CURRENT_DATE - INTERVAL '4 days', 'morning', 455.0, 3.8, 6.7, ''),
(CURRENT_DATE - INTERVAL '4 days', 'evening', 425.0, 3.9, 6.6, ''),
(CURRENT_DATE - INTERVAL '3 days', 'morning', 470.0, 3.6, 6.8, 'Yüksek verim'),
(CURRENT_DATE - INTERVAL '3 days', 'evening', 440.0, 3.7, 6.7, ''),
(CURRENT_DATE - INTERVAL '2 days', 'morning', 445.0, 3.8, 6.7, ''),
(CURRENT_DATE - INTERVAL '2 days', 'evening', 415.0, 3.9, 6.6, 'Hava sıcaklığı arttı'),
(CURRENT_DATE - INTERVAL '1 days', 'morning', 465.0, 3.7, 6.8, ''),
(CURRENT_DATE - INTERVAL '1 days', 'evening', 435.0, 3.8, 6.7, ''),
(CURRENT_DATE, 'morning', 460.0, 3.8, 6.7, 'Bugünkü sabah sağımı');

-- 2. Products
INSERT INTO public.products (name, sku, unit_price, stock_quantity, category) VALUES
('Tam Yağlı Yoğurt (1kg)', 'YGT-001', 45.00, 150, 'Yoğurt'),
('Süzme Yoğurt (500g)', 'YGT-002', 35.00, 80, 'Yoğurt'),
('Tam Yağlı Beyaz Peynir (Kg)', 'PYN-001', 180.00, 45, 'Peynir'),
('Taze Kaşar Peyniri (400g)', 'PYN-002', 120.00, 60, 'Peynir'),
('Köy Tereyağı (Kg)', 'YAG-001', 350.00, 25, 'Tereyağı'),
('Yayık Ayranı (1L)', 'ICE-001', 25.00, 100, 'İçecek');

-- 3. Production Batches
INSERT INTO public.production_batches (batch_number, product_type, milk_used_liters, start_time, end_time, status, output_quantity, output_unit) VALUES
('2023-YGT-101', 'Yoğurt', 500, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '6 hours', 'completed', 450, 'Kg'),
('2023-PYN-055', 'Beyaz Peynir', 1000, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '12 hours', 'completed', 180, 'Kg'),
('2023-YAG-012', 'Tereyağı', 200, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days' + INTERVAL '4 hours', 'completed', 15, 'Kg'),
('2023-YGT-102', 'Yoğurt', 600, CURRENT_TIMESTAMP - INTERVAL '4 hours', NULL, 'in_progress', NULL, NULL);

-- 4. Sales
INSERT INTO public.sales (customer_name, total_amount, payment_status, items) VALUES
('Ahmet Yılmaz', 450.00, 'paid', '[{"product": "Tam Yağlı Yoğurt (1kg)", "quantity": 2, "price": 45}, {"product": "Tam Yağlı Beyaz Peynir (Kg)", "quantity": 2, "price": 180}]'),
('Ayşe Demir', 120.00, 'paid', '[{"product": "Taze Kaşar Peyniri (400g)", "quantity": 1, "price": 120}]'),
('Market A', 3500.00, 'pending', '[{"product": "Tam Yağlı Yoğurt (1kg)", "quantity": 50, "price": 45}, {"product": "Yayık Ayranı (1L)", "quantity": 50, "price": 25}]');
