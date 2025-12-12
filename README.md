# Mandra Süt Takip Sistemi - Deployment Guide

## 1. Veritabanı Kurulumu (Supabase)

Bu proje veritabanı olarak Supabase (PostgreSQL) kullanmaktadır. Kurulum için aşağıdaki adımları izleyin:

1.  [Supabase](https://supabase.com) üzerinde yeni bir proje oluşturun.
2.  Sol menüden **SQL Editor**'e gidin.
3.  `supabase/schema.sql` dosyasının içeriğini kopyalayın ve editöre yapıştırın.
4.  **Run** butonuna basarak tüm tabloları, trigger'ları ve fonksiyonları oluşturun.

### Environment Değişkenleri
Projenizin kök dizininde `.env.local` dosyası oluşturun ve Supabase ayarlarını ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 2. Projeyi Çalıştırma (Local)

Geliştirme ortamında projeyi çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine giderek uygulamayı görüntüleyebilirsiniz.

## 3. Deployment (Vercel)

Bu proje Next.js tabanlı olduğu için Vercel üzerinde en iyi performansı verir.

1.  Projeyi GitHub'a pushlayın.
2.  [Vercel Dashboard](https://vercel.com/dashboard)'a gidin ve **Add New... > Project** seçeneğini kullanın.
3.  GitHub reponuzu seçin ve **Import** deyin.
4.  **Environment Variables** bölümüne Supabase anahtarlarınızı ekleyin:
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5.  **Deploy** butonuna basın.

## 4. Kullanım

Uygulama açıldığında:
1.  **Hayvan Yönetimi**: İnek ve buzağı kayıtlarını girin.
2.  **Süt Takibi**: Günlük sağım verilerini girin. Sistem otomatik olarak depo bakiyesini güncelleyecektir.
3.  **Üretim**: Süt kullanarak yoğurt/peynir üretim kayıtları oluşturun. Bu işlem stoktan süt düşecektir.
4.  **Dağıtım/Satış**: Ürünleri marketlere sevk edin ve satış kayıtlarını girin.

---
**Not:** Bu proje MVP (Minimum Viable Product) kapsamında temel modülleri içerir. İlerleyen fazlarda raporlama ve bildirim modülleri genişletilebilir.
