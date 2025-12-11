-- Regions
INSERT INTO public.regions (name, description) VALUES
('Kadıköy Bölgesi', 'Kadıköy ve çevresi dağıtım bölgesi'),
('Üsküdar Bölgesi', 'Üsküdar ve çevresi dağıtım bölgesi'),
('Kartal Bölgesi', 'Kartal ve çevresi dağıtım bölgesi');

-- Sales Points (Kadıköy)
INSERT INTO public.sales_points (region_id, name, type, contact_info) 
SELECT id, 'Çarşı Şarküteri', 'market', '0532 100 0001' FROM public.regions WHERE name = 'Kadıköy Bölgesi';
INSERT INTO public.sales_points (region_id, name, type, contact_info) 
SELECT id, 'Moda Market', 'market', '0532 100 0002' FROM public.regions WHERE name = 'Kadıköy Bölgesi';
INSERT INTO public.sales_points (region_id, name, type, contact_info) 
SELECT id, 'Bahariye Bakkal', 'market', '0532 100 0003' FROM public.regions WHERE name = 'Kadıköy Bölgesi';

-- Sales Points (Üsküdar)
INSERT INTO public.sales_points (region_id, name, type, contact_info) 
SELECT id, 'Meydan Büfe', 'market', '0532 200 0001' FROM public.regions WHERE name = 'Üsküdar Bölgesi';
INSERT INTO public.sales_points (region_id, name, type, contact_info) 
SELECT id, 'Kuzguncuk Manav', 'market', '0532 200 0002' FROM public.regions WHERE name = 'Üsküdar Bölgesi';
INSERT INTO public.sales_points (region_id, name, type, contact_info) 
SELECT id, 'Bağlarbaşı Market', 'market', '0532 200 0003' FROM public.regions WHERE name = 'Üsküdar Bölgesi';

-- Sales Points (Kartal)
INSERT INTO public.sales_points (region_id, name, type, contact_info) 
SELECT id, 'Merkez Gıda', 'market', '0532 300 0001' FROM public.regions WHERE name = 'Kartal Bölgesi';
INSERT INTO public.sales_points (region_id, name, type, contact_info) 
SELECT id, 'Sahil Pastanesi', 'restaurant', '0532 300 0002' FROM public.regions WHERE name = 'Kartal Bölgesi';
INSERT INTO public.sales_points (region_id, name, type, contact_info) 
SELECT id, 'Yakacık Şarküteri', 'market', '0532 300 0003' FROM public.regions WHERE name = 'Kartal Bölgesi';

-- Animals (Cows)
INSERT INTO public.animals (tag_number, name, type, gender, birth_date, status) VALUES
('TR-34-001', 'Sarıkız', 'cow', 'female', '2020-05-15', 'active'),
('TR-34-002', 'Kırmızı', 'cow', 'female', '2021-03-10', 'active'),
('TR-34-003', 'Benekli', 'cow', 'female', '2019-11-20', 'active'),
('TR-34-004', 'Gülkız', 'cow', 'female', '2022-01-05', 'active'),
('TR-34-005', 'Kara', 'cow', 'female', '2020-08-12', 'active'),
('TR-34-006', 'Yıldız', 'cow', 'female', '2021-06-30', 'active'),
('TR-34-007', 'Pamuk', 'cow', 'female', '2022-04-18', 'active'),
('TR-34-008', 'Nazlı', 'cow', 'female', '2020-02-25', 'active'),
('TR-34-009', 'Ceylan', 'cow', 'female', '2021-09-14', 'active'),
('TR-34-010', 'Sultan', 'cow', 'female', '2019-07-07', 'active');

-- Animals (Calves)
INSERT INTO public.animals (tag_number, name, type, gender, birth_date, mother_id, status) 
SELECT 'TR-34-101', 'Boncuk', 'calf', 'female', '2025-10-01', id, 'active' FROM public.animals WHERE name = 'Sarıkız';
INSERT INTO public.animals (tag_number, name, type, gender, birth_date, mother_id, status) 
SELECT 'TR-34-102', 'Efe', 'calf', 'male', '2025-11-15', id, 'active' FROM public.animals WHERE name = 'Benekli';
INSERT INTO public.animals (tag_number, name, type, gender, birth_date, mother_id, status) 
SELECT 'TR-34-103', 'Garip', 'calf', 'male', '2025-09-20', id, 'active' FROM public.animals WHERE name = 'Kara';

-- Health Records
INSERT INTO public.health_records (animal_id, record_type, date, description, cost, performed_by)
SELECT id, 'checkup', '2025-11-01', 'Genel sağlık kontrolü', 500, 'Vet. Ahmet' FROM public.animals WHERE name = 'Sarıkız';
INSERT INTO public.health_records (animal_id, record_type, date, description, cost, performed_by)
SELECT id, 'vaccination', '2025-11-05', 'Şap aşısı', 250, 'Vet. Ahmet' FROM public.animals WHERE type = 'cow';

-- Feed Logs
INSERT INTO public.feed_logs (feed_type, quantity_kg, unit_cost, date, notes) VALUES
('Saman', 500, 2.5, '2025-12-01', 'Toplu yemleme'),
('Yonca', 300, 5.0, '2025-12-01', 'Toplu yemleme'),
('Süt Yemi', 200, 8.0, '2025-12-01', 'Toplu yemleme');

-- Expenses
INSERT INTO public.expenses (category, amount, date, description) VALUES
('Yakıt', 1500, '2025-12-01', 'Traktör mazotu'),
('Personel', 15000, '2025-12-01', 'Kasım ayı maaş ödemesi'),
('Bakım', 750, '2025-12-05', 'Sağım makinesi bakımı');
