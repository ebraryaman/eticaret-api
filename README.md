# E-Ticaret Backend API

NestJS (TypeScript) ile geliştirilmiş RESTful E-Ticaret Backend API.

## Özellikler

- **Ürün Yönetimi** — Ürün listeleme, detay görüntüleme, oluşturma, güncelleme ve silme
- **Sepet Yönetimi** — Kullanıcı bazlı sepet; ürün ekleme, çıkarma ve adet güncelleme
- **Kimlik Doğrulama (Bonus)** — JWT tabanlı kayıt/giriş, korumalı endpoint'ler
- **Sipariş Yönetimi (Bonus)** — Sepeti siparişe dönüştürme, sipariş listeleme ve detay görüntüleme
- **OpenAPI / Swagger** — Tüm endpoint'ler için interaktif API dokümantasyonu
- **Global Exception Handling** — Anlamlı hata mesajları ve doğru HTTP durum kodları
- **Logging** — Her HTTP isteği için method, URL, status kodu ve süre loglaması

## Kullanılan Teknolojiler

| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| NestJS | Ana backend framework |
| TypeScript | Tip güvenliği |
| PostgreSQL | İlişkisel veritabanı |
| TypeORM | ORM (veritabanı yönetimi) |
| @nestjs/swagger | OpenAPI dokümantasyonu |
| class-validator | DTO validasyonu |
| @nestjs/jwt + passport-jwt | JWT tabanlı kimlik doğrulama |
| bcryptjs | Şifre hashleme |

## Kurulum

### Ön Gereksinimler

- Node.js >= 18
- PostgreSQL >= 14

### 1. Depoyu Klonlayın

```bash
git clone <repo-url>
cd eticaret-project
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Çevre Değişkenlerini Yapılandırın

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=eticaret_db

JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

### 4. Veritabanını Oluşturun

```sql
CREATE DATABASE eticaret_db;
```

> Uygulama ilk çalıştığında `synchronize: true` sayesinde tablolar otomatik oluşturulur (development modunda).

### 5. Uygulamayı Çalıştırın

```bash
# Geliştirme modu (hot-reload)
npm run start:dev

# Production modu
npm run build
npm run start:prod
```

## API Dokümantasyonu

Uygulama çalıştıktan sonra Swagger UI'a erişin:

```
http://localhost:3000/api/docs
```

## API Endpoint'leri

### Base URL: `/api/v1`

#### Auth
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/auth/register` | Yeni kullanıcı kaydı | — |
| POST | `/auth/login` | Kullanıcı girişi, JWT döner | — |
| GET | `/auth/profile` | Kullanıcı profili | JWT |

#### Products
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/products` | Tüm ürünleri listele | — |
| GET | `/products/:id` | Ürün detayı | — |
| POST | `/products` | Yeni ürün oluştur | JWT |
| PUT | `/products/:id` | Ürün güncelle | JWT |
| DELETE | `/products/:id` | Ürün sil (soft delete) | JWT |

#### Cart
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/cart` | Sepeti görüntüle | JWT |
| POST | `/cart/items` | Sepete ürün ekle | JWT |
| PUT | `/cart/items/:itemId` | Ürün adedini güncelle | JWT |
| DELETE | `/cart/items/:itemId` | Sepetten ürün çıkar | JWT |

#### Orders
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/orders` | Sepeti siparişe dönüştür | JWT |
| GET | `/orders` | Sipariş listesi | JWT |
| GET | `/orders/:id` | Sipariş detayı | JWT |

## Veri Modeli ve İlişkiler

```
User
 ├── Cart (1-1)
 │    └── CartItem[] (1-N)
 │         └── Product (N-1)
 └── Order[] (1-N)
      └── OrderItem[] (1-N)
           └── Product (N-1)
```

## Proje Yapısı

```
src/
├── auth/              # Kimlik doğrulama modülü
│   ├── dto/           # Login ve register DTO'ları
│   ├── guards/        # JWT auth guard
│   ├── strategies/    # Passport JWT strategy
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── cart/              # Sepet modülü
│   ├── dto/
│   ├── entities/
│   ├── cart.controller.ts
│   ├── cart.module.ts
│   └── cart.service.ts
├── common/            # Paylaşılan yardımcılar
│   ├── decorators/    # @CurrentUser()
│   ├── filters/       # GlobalExceptionFilter
│   └── interceptors/  # LoggingInterceptor
├── config/            # Uygulama konfigürasyonu
├── orders/            # Sipariş modülü
│   ├── dto/
│   ├── entities/
│   ├── orders.controller.ts
│   ├── orders.module.ts
│   └── orders.service.ts
├── products/          # Ürün modülü
│   ├── dto/
│   ├── entities/
│   ├── products.controller.ts
│   ├── products.module.ts
│   └── products.service.ts
├── users/             # Kullanıcı modülü
│   ├── entities/
│   ├── users.module.ts
│   └── users.service.ts
├── app.module.ts
└── main.ts
```

## Varsayımlar ve Kararlar

- **Soft delete**: Ürünler veritabanından silinmez; `isActive: false` yapılır.
- **Sepet otomasyonu**: Her kullanıcı için ilk istekte otomatik sepet oluşturulur.
- **Stok kontrolü**: Sepete ürün eklenirken ve sipariş oluşturulurken stok kontrol edilir.
- **Sipariş akışı**: Sipariş oluşturulduğunda sepet temizlenir ve stok güncellenir.
- **Fiyat anlık değeri**: Sipariş kalemi, oluşturulma anındaki ürün fiyatını saklar.
- **Ürün yönetimi**: POST/PUT/DELETE ürün endpoint'leri JWT koruması altındadır.
- **synchronize**: Development ortamında TypeORM `synchronize: true` ile tablo şeması otomatik güncellenir; production'da kapatılmıştır.

## Bonus Özellikler

- JWT tabanlı kimlik doğrulama (register, login, profile)
- Sipariş yönetimi (sepeti siparişe dönüştürme, sipariş listeleme)
- Global exception filter ile merkezi hata yönetimi
- HTTP logging interceptor
- Soft delete ürün silme
- Stok yönetimi ve kontrol
