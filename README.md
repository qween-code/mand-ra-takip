# Mandıra Asistanı

Mandıra işletmeleri için geliştirilmiş, uçtan uca dijital yönetim sistemi.

## Kurulum ve Başlangıç

1.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

2.  **Veritabanı Kurulumu (Supabase):**
    Projenin çalışması için Supabase üzerinde gerekli tabloların oluşturulması gerekmektedir.
    
    *   `supabase_schema.sql` dosyasının içeriğini kopyalayın.
    *   Supabase Dashboard -> SQL Editor bölümüne gidin.
    *   Kodu yapıştırın ve **Run** butonuna basarak tabloları oluşturun.

3.  **Uygulamayı Çalıştırın:**
    ```bash
    npm run dev
    ```

## Özellikler

*   **Dashboard:** İşletme genel durumu ve KPI takibi.
*   **Süt Girişi:** Günlük süt verimi, yağ oranı ve pH takibi.
*   **Üretim (MES):** Parti bazlı üretim takibi (Yoğurt, Peynir vb.).
*   **Lojistik:** Stok ve satış yönetimi.

## Teknolojiler

*   React + TypeScript
*   Tailwind CSS
*   Supabase (PostgreSQL)
*   Lucide React (İkonlar)
