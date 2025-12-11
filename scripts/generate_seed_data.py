import datetime
import random
import json

def generate_sql():
    start_date = datetime.date.today() - datetime.timedelta(days=90)
    sql_statements = []

    # 1. Clear existing data (optional, but good for clean seed)
    sql_statements.append("TRUNCATE TABLE public.milk_records, public.production_batches, public.sales, public.returns CASCADE;")

    # 2. Products (Static)
    sql_statements.append("""
INSERT INTO public.products (name, sku, unit_price, stock_quantity, category) VALUES
('Tam Yağlı Yoğurt (1kg)', 'YGT-001', 45.00, 150, 'Yoğurt'),
('Süzme Yoğurt (500g)', 'YGT-002', 35.00, 80, 'Yoğurt'),
('Tam Yağlı Beyaz Peynir (Kg)', 'PYN-001', 180.00, 45, 'Peynir'),
('Taze Kaşar Peyniri (400g)', 'PYN-002', 120.00, 60, 'Peynir'),
('Köy Tereyağı (Kg)', 'YAG-001', 350.00, 25, 'Tereyağı'),
('Yayık Ayranı (1L)', 'ICE-001', 25.00, 100, 'İçecek');
""")

    # 3. Milk Records (Daily, 2 shifts)
    milk_records_values = []
    current_date = start_date
    while current_date <= datetime.date.today():
        # Morning Shift
        qty_m = round(random.uniform(440, 480), 1)
        fat_m = round(random.uniform(3.6, 4.0), 2)
        ph_m = round(random.uniform(6.6, 6.8), 2)
        milk_records_values.append(f"('{current_date}', 'morning', {qty_m}, {fat_m}, {ph_m}, '')")

        # Evening Shift
        qty_e = round(random.uniform(410, 450), 1)
        fat_e = round(random.uniform(3.7, 4.1), 2)
        ph_e = round(random.uniform(6.6, 6.8), 2)
        milk_records_values.append(f"('{current_date}', 'evening', {qty_e}, {fat_e}, {ph_e}, '')")
        
        current_date += datetime.timedelta(days=1)

    sql_statements.append(f"INSERT INTO public.milk_records (date, shift, quantity_liters, fat_rate, ph_level, notes) VALUES {', '.join(milk_records_values)};")

    # 4. Production Batches (Every 2-3 days)
    production_values = []
    current_date = start_date
    batch_counter = 100
    products = ['Yoğurt', 'Beyaz Peynir', 'Kaşar Peyniri', 'Tereyağı', 'Ayran']
    
    while current_date <= datetime.date.today():
        if random.random() > 0.3: # 70% chance of production
            p_type = random.choice(products)
            batch_num = f"2024-{p_type[:3].upper()}-{batch_counter}"
            milk_used = round(random.uniform(300, 800), 0)
            
            # Status logic
            days_ago = (datetime.date.today() - current_date).days
            if days_ago < 1:
                status = 'in_progress'
                end_time = "NULL"
                out_qty = "NULL"
                out_unit = "NULL"
            else:
                status = 'completed'
                end_time = f"'{current_date} 18:00:00'"
                out_qty = round(milk_used * (0.8 if p_type == 'Yoğurt' else 0.15), 1) # Rough conversion
                out_unit = "'Kg'"

            production_values.append(f"('{batch_num}', '{p_type}', {milk_used}, '{current_date} 08:00:00', {end_time}, '{status}', {out_qty}, {out_unit})")
            batch_counter += 1
        
        current_date += datetime.timedelta(days=random.randint(1, 2))

    sql_statements.append(f"INSERT INTO public.production_batches (batch_number, product_type, milk_used_liters, start_time, end_time, status, output_quantity, output_unit) VALUES {', '.join(production_values)};")

    # 5. Sales (Daily)
    sales_values = []
    current_date = start_date
    customers = ['Ahmet Yılmaz', 'Ayşe Demir', 'Mehmet Kaya', 'Fatma Çelik', 'Market A', 'Market B', 'Restoran X']
    
    while current_date <= datetime.date.today():
        num_sales = random.randint(1, 5)
        for _ in range(num_sales):
            cust = random.choice(customers)
            amount = round(random.uniform(100, 2000), 2)
            status = random.choice(['paid', 'paid', 'paid', 'pending']) # Mostly paid
            
            # Simple JSON item
            item_name = random.choice(['Tam Yağlı Yoğurt', 'Beyaz Peynir', 'Kaşar'])
            items_json = json.dumps([{"product": item_name, "quantity": random.randint(1, 10), "price": amount}])
            
            sales_values.append(f"('{current_date}', '{cust}', {amount}, '{status}', '{items_json}')")
        
        current_date += datetime.timedelta(days=1)

    sql_statements.append(f"INSERT INTO public.sales (created_at, customer_name, total_amount, payment_status, items) VALUES {', '.join(sales_values)};")

    return "\n".join(sql_statements)

if __name__ == "__main__":
    print(generate_sql())
