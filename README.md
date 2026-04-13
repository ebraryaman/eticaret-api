# E-Ticaret Backend - Proje Dokümantasyonu

Bu dosya projedeki her dosyanın ne yaptığını, neden kullanıldığını ve nasıl çalıştığını detaylıca açıklar.

### 1. Depoyu Klonlayın

```bash
git clone <repo-url>
cd eticaret-project
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Veritabanını Oluşturun

```sql
CREATE DATABASE eticaret_db;
```

> Uygulama ilk çalıştığında `synchronize: true` sayesinde tablolar otomatik oluşturulur (development modunda).

### 4. Çevre Değişkenlerini Yapılandırın

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

### 5. Uygulamayı Çalıştırın

```bash
# Geliştirme modu (hot-reload)
npm run start:dev

## API DOKÜMANTASYONU

Uygulama çalışırken Swagger arayüzüne şuradan erişilir:
```
http://localhost:3000/api/docs
```

Tüm endpoint'ler, istek/yanıt örnekleri ve JWT token girişi bu arayüzde mevcuttur.
```

Arayüze erişin:

```
http://localhost:3000/index.html
```

## VARSAYILAN ADMIN BİLGİLERİ

```
E-posta : admin@eticaret.com
Şifre   : Admin123!
```

## GENEL YAPI

```
eticaret-project/
├── src/                        ← Tüm kaynak kodlar
│   ├── main.ts                 ← Uygulamanın başlangıç noktası
│   ├── app.module.ts           ← Ana modül, her şeyi bir araya getirir
│   ├── config/
│   │   └── configuration.ts   ← Ortam değişkenlerini okur (.env)
│   ├── auth/                   ← Kimlik doğrulama modülü
│   ├── users/                  ← Kullanıcı modülü
│   ├── products/               ← Ürün modülü
│   ├── cart/                   ← Sepet modülü
│   ├── orders/                 ← Sipariş modülü
│   └── common/                 ← Ortak yardımcı araçlar
├── public/
│   └── index.html              ← Frontend arayüzü (HTML/CSS/JS)
├── package.json                ← Bağımlılıklar ve komutlar
├── .env                        ← Gizli ortam değişkenleri (git'e girmez)
├── .env.example                ← .env şablonu (git'e girer)
├── nest-cli.json               ← NestJS CLI yapılandırması
├── tsconfig.json               ← TypeScript ayarları
└── tsconfig.build.json         ← Build için TypeScript ayarları
```

---

## KULLANILAN TEKNOLOJİLER

### Framework: NestJS
NestJS, Node.js üzerine kurulu bir backend framework'üdür. Angular'dan ilham alan modüler yapısı sayesinde büyük projelerde düzenli kod yazmayı kolaylaştırır. Her özellik kendi **Module**, **Controller**, **Service** üçlüsüyle organize edilir.

### Dil: TypeScript
JavaScript'in tip güvenli versiyonudur. Derleme sırasında hataları yakalar. `tsconfig.json` ve `tsconfig.build.json` dosyaları derleyici kurallarını belirler.

### Veritabanı: PostgreSQL + TypeORM
- **PostgreSQL**: Güçlü bir ilişkisel veritabanıdır. `pg` paketi ile Node.js'e bağlanır.
- **TypeORM**: Veritabanı tablolarını TypeScript sınıfları (Entity) olarak tanımlamayı sağlar. SQL yazmak yerine nesne yönelimli kod yazılır.

### Kimlik Doğrulama: JWT + Passport
- **JWT (JSON Web Token)**: Kullanıcı giriş yaptıktan sonra bir token üretilir. Sonraki isteklerde bu token "Authorization: Bearer ..." başlığıyla gönderilir.
- **Passport**: NestJS'in kimlik doğrulama stratejilerini yönettiği kütüphanedir.

---

## DOSYALAR DETAYLI AÇIKLAMA

---

### `src/main.ts` 

Uygulama buradan başlar. `bootstrap()` fonksiyonu çalışır ve şunları yapar:

1. **NestExpressApplication** oluşturur (Express tabanlı HTTP sunucusu)
2. **`public/`** klasörünü statik dosya sunucusu olarak tanımlar → `http://localhost:3000/index.html` adresinde frontend çalışır
3. **Global prefix** ekler: tüm API endpoint'leri `/api/v1/` ile başlar
4. **CORS** açar: farklı domain'lerden istek gelebilsin diye (frontend ayrı bir domainse gerekli)
5. **GlobalExceptionFilter** bağlar: tüm hataları standart formatta döner
6. **LoggingInterceptor** bağlar: her isteği konsola loglar
7. **ClassSerializerInterceptor** bağlar: `@Exclude()` ile işaretlenmiş alanları (şifre gibi) response'tan otomatik çıkarır
8. **ValidationPipe** bağlar: DTO'lardaki `class-validator` kurallarını otomatik uygular, geçersiz veri gelirse 400 hatası döner
9. **Swagger** dokümantasyonunu `/api/docs` adresine kurar
10. **Admin seed**: Uygulama başlarken `admin@eticaret.com` kullanıcısı yoksa oluşturur
11. Belirtilen portta (varsayılan: 3000) dinlemeye başlar

---

### `src/app.module.ts` — Ana Modül

Tüm modülleri bir araya getirir. İki önemli görevi var:

**ConfigModule**: `.env` dosyasındaki değişkenleri okuyup uygulamanın her yerine enjekte eder. `isGlobal: true` olduğu için her modülde tekrar import etmeye gerek yoktur.

**TypeOrmModule**: Veritabanı bağlantısını kurar. Bağlantı bilgilerini ConfigService üzerinden `.env`'den alır. `synchronize: true` (development modunda) ayarı, Entity sınıflarındaki değişiklikleri otomatik olarak veritabanı tablolarına yansıtır — production'da kapatılmalıdır.

---

### `src/config/configuration.ts` — Ortam Değişkenleri

`.env` dosyasını okuyup yapılandırılmış bir nesne döner. Uygulama boyunca `configService.get('database.host')` gibi güvenli tip erişimi sağlar.

```
PORT         → Sunucu portu (varsayılan: 3000)
NODE_ENV     → development / production
DB_HOST      → Veritabanı sunucusu
DB_PORT      → Veritabanı portu (varsayılan: 5432)
DB_USERNAME  → Veritabanı kullanıcısı
DB_PASSWORD  → Veritabanı şifresi
DB_NAME      → Veritabanı adı
JWT_SECRET   → Token imzalama anahtarı (GİZLİ tutulmalı)
JWT_EXPIRES_IN → Token geçerlilik süresi (varsayılan: 7d)
```

---

## AUTH MODÜLÜ (`src/auth/`)

Kullanıcı kaydı, girişi ve yetkilendirmeyi yönetir.

---

### `src/auth/auth.module.ts`

Auth modülünün bağımlılıklarını tanımlar:
- `UsersModule` import eder (kullanıcı sorgulama için)
- `PassportModule` import eder (strateji sistemi için)
- `JwtModule.registerAsync` ile JWT yapılandırmasını `.env`'den dinamik alır
- `AuthService` ve `JwtStrategy`'yi provider olarak kaydeder

---

### `src/auth/auth.service.ts`

Auth iş mantığını içerir. Şu işlemleri yapar:

| Metot | Ne Yapar |
|-------|----------|
| `register()` | Kullanıcı oluşturur, token döner |
| `login()` | Email/şifre doğrular, token döner |
| `getProfile()` | Token sahibinin profilini getirir |
| `changePassword()` | Şifre değiştirir |
| `createAdmin()` | Yeni admin kullanıcı oluşturur |
| `getAllAdmins()` | Tüm adminleri listeler |
| `getAllUsers()` | Tüm normal kullanıcıları listeler |
| `deleteUser()` | Kullanıcıyı siler |
| `generateAuthResponse()` (private) | JWT token üretir, şifreyi response'tan çıkarır |

`AuthResponse` interface'i: `{ accessToken, user }` şeklinde dönüş formatını tanımlar.

---

### `src/auth/auth.controller.ts`

HTTP endpoint'lerini tanımlar:

| Method | URL | Erişim | Açıklama |
|--------|-----|--------|----------|
| POST | `/api/v1/auth/register` | Herkese açık | Kayıt ol |
| POST | `/api/v1/auth/login` | Herkese açık | Giriş yap |
| GET | `/api/v1/auth/profile` | JWT gerekli | Profil getir |
| POST | `/api/v1/auth/change-password` | JWT gerekli | Şifre değiştir |
| POST | `/api/v1/auth/admin/create` | Sadece ADMIN | Yeni admin ekle |
| GET | `/api/v1/auth/admin/list` | Sadece ADMIN | Adminleri listele |
| GET | `/api/v1/auth/users/list` | Sadece ADMIN | Kullanıcıları listele |
| DELETE | `/api/v1/auth/users/:id` | Sadece ADMIN | Kullanıcı sil |

---

### `src/auth/strategies/jwt.strategy.ts`

JWT token'ı nasıl doğrulayacağını tanımlar. Her korumalı endpoint'e istek geldiğinde çalışır:

1. `Authorization: Bearer <token>` başlığından token'ı alır
2. Token imzasını `JWT_SECRET` ile doğrular
3. Token'ın süresi dolmuşsa reddeder
4. Token geçerliyse içindeki `sub` (kullanıcı ID) ile veritabanından kullanıcıyı bulur
5. Kullanıcıyı `request.user`'a atar — controller'larda `@CurrentUser()` ile erişilir

`JwtPayload` interface'i: token içinde `{ sub: number, email: string }` bulunur.

---

### `src/auth/guards/jwt-auth.guard.ts`

`@UseGuards(JwtAuthGuard)` decorator'ıyla endpoint'leri korur. Token yoksa veya geçersizse `"Bu işlem için giriş yapmanız gerekmektedir"` hatası döner.

---

### `src/auth/guards/roles.guard.ts`

`@UseGuards(RolesGuard)` + `@Roles(UserRole.ADMIN)` kombinasyonu ile çalışır. Kullanıcının rolünü kontrol eder. Admin gerektiren endpoint'lere normal kullanıcı erişmeye çalışırsa `ForbiddenException` oluşturur.

`Reflector` kullanır: `@Roles()` decorator'ıyla endpoint'e eklenen metadata'yı okur.

---

### `src/auth/decorators/roles.decorator.ts`

`@Roles(UserRole.ADMIN)` şeklinde kullanılır. `SetMetadata` ile endpoint'e hangi rol(ler)in erişebileceği bilgisini ekler. `RolesGuard` bu bilgiyi `Reflector` ile okur.

---

### `src/auth/dto/` — Veri Transfer Nesneleri

**`register.dto.ts`**: Kayıt için gerekli alanlar
- `name`: string, zorunlu, max 100 karakter
- `email`: geçerli email formatı, zorunlu
- `password`: string, zorunlu, min 6, max 50 karakter

**`login.dto.ts`**: Giriş için gerekli alanlar
- `email`: geçerli email formatı
- `password`: string, min 6 karakter

**`change-password.dto.ts`**: Şifre değişikliği için
- `currentPassword`: mevcut şifre
- `newPassword`: yeni şifre, min 6, max 50 karakter

**`create-admin.dto.ts`**: Yeni admin oluşturmak için
- `name`, `email`, `password` — register.dto ile aynı kurallar

---

## USERS MODÜLÜ (`src/users/`)

---

### `src/users/entities/user.entity.ts`

Veritabanındaki `users` tablosunu temsil eder.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | number (PK) | Otomatik artan birincil anahtar |
| `name` | string (max 100) | Ad soyad |
| `email` | string (unique, max 150) | E-posta, tekrar edemez |
| `password` | string | bcrypt ile şifrelenmiş, `@Exclude()` ile response'ta gizlenir |
| `role` | enum: user/admin | Kullanıcı rolü, varsayılan: user |
| `createdAt` | Date | Oluşturma tarihi, otomatik |
| `updatedAt` | Date | Güncelleme tarihi, otomatik |

**İlişkiler:**
- `User` → `Cart`: OneToOne (bir kullanıcının bir sepeti var, cascade ile kullanıcı silinince sepet de silinir)
- `User` → `Order[]`: OneToMany (bir kullanıcının çok siparişi olabilir)

`UserRole` enum'u: `USER = 'user'`, `ADMIN = 'admin'`

---

### `src/users/users.service.ts`

Veritabanı işlemlerini yapar. Auth servisi tarafından kullanılır.

| Metot | Ne Yapar |
|-------|----------|
| `create()` | Normal kullanıcı oluşturur, şifreyi bcrypt ile hashler, email tekrarını kontrol eder |
| `createAdmin()` | Admin kullanıcı oluşturur |
| `seedAdmin()` | `admin@eticaret.com` yoksa oluşturur (şifre: `Admin123!`) |
| `findAllAdmins()` | role=admin olan herkesi getirir |
| `findAllUsers()` | role=user olan herkesi getirir |
| `deleteUser()` | Kullanıcıyı siler |
| `changePassword()` | Mevcut şifreyi doğrular, yeni şifreyi hashler ve kaydeder |
| `findByEmail()` | Email ile kullanıcı bulur (login için) |
| `findById()` | ID ile kullanıcı bulur, bulamazsa null döner |
| `findByIdOrFail()` | ID ile kullanıcı bulur, bulamazsa NotFoundException oluşturur |

---

### `src/users/users.module.ts`

`UsersService`'i `exports` ile dışarıya açar. `AuthModule` ve `JwtStrategy` bu sayede `UsersService`'i kullanabilir.

---

## PRODUCTS MODÜLÜ (`src/products/`)

---

### `src/products/entities/product.entity.ts`

Veritabanındaki `products` tablosunu temsil eder.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | number (PK) | Birincil anahtar |
| `name` | string (max 200) | Ürün adı |
| `description` | text (nullable) | Ürün açıklaması |
| `price` | decimal(10,2) | Fiyat, 2 ondalık basamak |
| `imageUrl` | string (nullable) | Ürün görseli URL'i |
| `stockQuantity` | number | Stok miktarı, varsayılan 0 |
| `isActive` | boolean | Aktif/pasif durumu, varsayılan true |
| `createdAt` | Date | Oluşturma tarihi |
| `updatedAt` | Date | Güncelleme tarihi |

**İlişkiler:**
- `Product` → `CartItem[]`: OneToMany
- `Product` → `OrderItem[]`: OneToMany

---

### `src/products/products.service.ts`

| Metot | Ne Yapar |
|-------|----------|
| `findAll()` | Sadece `isActive=true` ürünleri, en yeni önce sıralar |
| `findOne()` | ID'ye göre aktif ürün getirir, bulamazsa 404 |
| `findOneByIdForCart()` | Sepete eklerken kullanılır, stoğu da kontrol eder |
| `create()` | Yeni ürün oluşturur |
| `update()` | Ürünü günceller (`Object.assign` ile kısmi güncelleme) |
| `remove()` | Ürünü gerçekten silmez, `isActive=false` yapar (soft delete) |
| `decreaseStock()` | Sipariş verilince stok düşürür, yetersiz stokta hata gönderir. |

---

### `src/products/products.controller.ts`

| Method | URL | Erişim | Açıklama |
|--------|-----|--------|----------|
| GET | `/api/v1/products` | Herkese açık | Tüm ürünleri listele |
| GET | `/api/v1/products/:id` | Herkese açık | Ürün detayı |
| POST | `/api/v1/products` | Sadece ADMIN | Ürün oluştur |
| PUT | `/api/v1/products/:id` | Sadece ADMIN | Ürün güncelle |
| DELETE | `/api/v1/products/:id` | Sadece ADMIN | Ürünü pasife al |

---

### `src/products/dto/`

**`create-product.dto.ts`**: Ürün oluşturmak için
- `name`: zorunlu, max 200 karakter
- `description`: opsiyonel
- `price`: sayısal, pozitif
- `imageUrl`: opsiyonel, geçerli URL formatı
- `stockQuantity`: tam sayı, min 0

**`update-product.dto.ts`**: `PartialType(CreateProductDto)` kullanır — tüm alanlar opsiyonel hale gelir. Ek olarak `isActive` boolean alanı ekler.

---

## CART MODÜLÜ (`src/cart/`)

---

### `src/cart/entities/cart.entity.ts`

Veritabanındaki `carts` tablosu. Her kullanıcının en fazla bir sepeti olur.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | number (PK) | Birincil anahtar |
| `createdAt` | Date | Oluşturma tarihi |
| `updatedAt` | Date | Güncelleme tarihi |

**İlişkiler:**
- `Cart` → `User`: OneToOne, `user_id` foreign key
- `Cart` → `CartItem[]`: OneToMany, `cascade: true` (sepet silinince öğeler de silinir), `eager: true` (sepet sorgulanınca öğeler otomatik yüklenir)

---

### `src/cart/entities/cart-item.entity.ts`

Veritabanındaki `cart_items` tablosu. Bir sepet öğesi, bir ürünün sepette kaç adet bulunduğunu tutar.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | number (PK) | Birincil anahtar |
| `quantity` | number | Adet, varsayılan 1 |
| `createdAt` | Date | Oluşturma tarihi |
| `updatedAt` | Date | Güncelleme tarihi |

**İlişkiler:**
- `CartItem` → `Cart`: ManyToOne, `onDelete: CASCADE`
- `CartItem` → `Product`: ManyToOne, `eager: true` (öğe sorgulanınca ürün detayı otomatik gelir)

---

### `src/cart/cart.service.ts`

`CartSummary` interface'i döner: `{ cart, totalItems, totalAmount }`

| Metot | Ne Yapar |
|-------|----------|
| `getOrCreateCart()` | Kullanıcının sepetini bulur, yoksa oluşturur |
| `getCart()` | Sepeti ve özet bilgileri döner |
| `addItem()` | Ürünü sepete ekler; ürün zaten varsa adedini artırır, stok kontrolü yapar |
| `updateItem()` | Sepet öğesi adedini günceller; adet 0 ise öğeyi siler |
| `removeItem()` | Sepet öğesini direkt siler |
| `clearCart()` | Tüm sepet öğelerini siler (sipariş verilince çağrılır) |
| `buildCartSummary()` (private) | `totalItems` ve `totalAmount` hesaplar |

---

### `src/cart/cart.controller.ts`

Tüm endpoint'ler JWT gerektirir (`@UseGuards(JwtAuthGuard)` controller seviyesinde).

| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/v1/cart` | Sepeti görüntüle |
| POST | `/api/v1/cart/items` | Sepete ürün ekle |
| PUT | `/api/v1/cart/items/:itemId` | Ürün adedini güncelle |
| DELETE | `/api/v1/cart/items/:itemId` | Ürünü sepetten çıkar |

---

### `src/cart/dto/`

**`add-to-cart.dto.ts`**:
- `productId`: tam sayı, pozitif, zorunlu
- `quantity`: tam sayı, min 1

**`update-cart-item.dto.ts`**:
- `quantity`: tam sayı, min 0 (0 gönderilirse ürün silinir)

---

## ORDERS MODÜLÜ (`src/orders/`)

---

### `src/orders/entities/order.entity.ts`

Veritabanındaki `orders` tablosu.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | number (PK) | Birincil anahtar |
| `totalAmount` | decimal(10,2) | Toplam tutar |
| `status` | enum | Sipariş durumu |
| `shippingAddress` | text (nullable) | Teslimat adresi |
| `createdAt` | Date | Oluşturma tarihi |
| `updatedAt` | Date | Güncelleme tarihi |

`OrderStatus` enum'u:
- `PENDING` → Bekliyor (varsayılan)
- `CONFIRMED` → Onaylandı
- `SHIPPED` → Kargoya verildi
- `DELIVERED` → Teslim edildi
- `CANCELLED` → İptal edildi

**İlişkiler:**
- `Order` → `User`: ManyToOne
- `Order` → `OrderItem[]`: OneToMany, `cascade: true`, `eager: true`

---

### `src/orders/entities/order-item.entity.ts`

Veritabanındaki `order_items` tablosu. Sipariş anındaki fiyatı kaydeder (ürün fiyatı değişse bile sipariş tutarı korunur).

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | number (PK) | Birincil anahtar |
| `quantity` | number | Sipariş edilen adet |
| `unitPrice` | decimal(10,2) | Sipariş anındaki birim fiyat |
| `totalPrice` | decimal(10,2) | `unitPrice × quantity` |

**İlişkiler:**
- `OrderItem` → `Order`: ManyToOne, `onDelete: CASCADE`
- `OrderItem` → `Product`: ManyToOne, `eager: true`

---

### `src/orders/orders.service.ts`

| Metot | Ne Yapar |
|-------|----------|
| `createFromCart()` | Sepeti siparişe çevirir: boş sepet kontrolü → stok kontrolü → sipariş oluştur → order items kaydet → stokları düşür → sepeti temizle |
| `findAllByUser()` | Kullanıcının tüm siparişleri, en yeni önce |
| `findAll()` | Tüm siparişler (admin), kullanıcı bilgisiyle birlikte |
| `findOne()` | Belirli bir siparişin detayı (sadece kendi siparişi) |

---

### `src/orders/orders.controller.ts`

Tüm endpoint'ler JWT gerektirir.

| Method | URL | Erişim | Açıklama |
|--------|-----|--------|----------|
| POST | `/api/v1/orders` | JWT gerekli | Sepetten sipariş oluştur |
| GET | `/api/v1/orders/all` | Sadece ADMIN | Tüm siparişleri listele |
| GET | `/api/v1/orders` | JWT gerekli | Kendi siparişlerimi listele |
| GET | `/api/v1/orders/:id` | JWT gerekli | Sipariş detayı |

---

### `src/orders/dto/create-order.dto.ts`

- `shippingAddress`: opsiyonel, max 500 karakter

---

## COMMON (ORTAK) ARAÇLAR (`src/common/`)

---

### `src/common/decorators/current-user.decorator.ts`

`@CurrentUser()` decorator'ı, JWT doğrulamasından sonra `request.user`'a atanan kullanıcıyı controller metoduna parametre olarak verir.

```typescript
// Kullanım örneği:
getCart(@CurrentUser() user: User) {
  return this.cartService.getCart(user.id);
}

// Belirli bir alan da alınabilir:
getCart(@CurrentUser('id') userId: number) { ... }
```

---

### `src/common/filters/http-exception.filter.ts`

`@Catch()` ile tüm hataları yakalar. Her hata için standart bir JSON formatı üretir:

```json
{
  "statusCode": 404,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/v1/products/999",
  "method": "GET",
  "error": "NotFoundException",
  "message": "Ürün bulunamadı (ID: 999)"
}
```

`HttpException` türünden hatalar (400, 401, 404 vb.) bilgi logu olarak, diğer beklenmeyen hatalar ise hata logu olarak kaydedilir.

---

### `src/common/interceptors/logging.interceptor.ts`

Her HTTP isteğini konsola loglar. `tap` operatörü sayesinde response gönderildikten sonra çalışır:

```
GET /api/v1/products 200 - 45ms
POST /api/v1/auth/login 200 - 123ms
```

---

## FRONTEND (`public/index.html`)

796 satırlık tek sayfalık (SPA) bir arayüzdür. JavaScript ile API isteklerini yapar. Şu sayfaları içerir:

- **Giriş/Kayıt** → Auth API
- **Ürünler** → Ürün listesi, sepete ekleme (giriş yapılmamışsa ürünleri göster ama sepete ekleyemez)
- **Sepet** → Ürün adedi güncelleme, ürün silme, sipariş oluşturma
- **Siparişlerim** → Sipariş geçmişi
- **Admin Paneli** → Ürün ekleme/düzenleme/silme, kullanıcı yönetimi (sadece admin görebilir)

`main.ts` içinde `app.useStaticAssets(join(__dirname, '..', 'public'))` satırı sayesinde `http://localhost:3000` adresinde otomatik sunulur.

---

## VERİTABANI ŞEMASI

```
users
  id (PK)
  name
  email (unique)
  password
  role (user/admin)
  created_at
  updated_at

products
  id (PK)
  name
  description
  price
  image_url
  stock_quantity
  is_active
  created_at
  updated_at

carts
  id (PK)
  user_id (FK → users.id)
  created_at
  updated_at

cart_items
  id (PK)
  cart_id (FK → carts.id, CASCADE DELETE)
  product_id (FK → products.id)
  quantity
  created_at
  updated_at

orders
  id (PK)
  user_id (FK → users.id)
  total_amount
  status (pending/confirmed/shipped/delivered/cancelled)
  shipping_address
  created_at
  updated_at

order_items
  id (PK)
  order_id (FK → orders.id, CASCADE DELETE)
  product_id (FK → products.id)
  quantity
  unit_price
  total_price
```

---

## PAKETLER (package.json)

### Production Bağımlılıkları

| Paket | Açıklama |
|-------|----------|
| `@nestjs/common` | NestJS temel dekoratörler, pipe, guard, filter |
| `@nestjs/core` | NestJS çekirdek |
| `@nestjs/config` | `.env` dosyası yönetimi |
| `@nestjs/jwt` | JWT token üretme ve doğrulama |
| `@nestjs/passport` | Passport entegrasyonu |
| `@nestjs/platform-express` | Express HTTP adaptörü |
| `@nestjs/swagger` | Swagger/OpenAPI otomatik dokümantasyon |
| `@nestjs/typeorm` | TypeORM entegrasyonu |
| `bcryptjs` | Şifre hashleme |
| `class-transformer` | `@Exclude()` ile alan gizleme, tip dönüşümü |
| `class-validator` | `@IsEmail()`, `@MinLength()` gibi DTO doğrulama |
| `passport` | Kimlik doğrulama middleware |
| `passport-jwt` | JWT Passport stratejisi |
| `pg` | PostgreSQL Node.js sürücüsü |
| `reflect-metadata` | Dekoratör desteği için gerekli |
| `rxjs` | Reaktif programlama (NestJS iç kullanımı) |
| `typeorm` | ORM kütüphanesi |

### Development Bağımlılıkları

| Paket | Açıklama |
|-------|----------|
| `@nestjs/cli` | `nest build`, `nest start` komutları |
| `@nestjs/testing` | Test modülü |
| `typescript` | TypeScript derleyici |
| `ts-node` | TypeScript'i doğrudan çalıştırır |
| `jest` + `ts-jest` | Test framework'ü |
| `eslint` + `prettier` | Kod kalitesi ve formatlama |

---


## KİMDOĞRULAMA AKIŞI

```
1. Kullanıcı → POST /api/v1/auth/login
2. AuthService → bcrypt.compare(şifre, hashlenmiş şifre)
3. JwtService → token üret (payload: { sub: id, email, role })
4. Kullanıcı → token'ı alır

5. Kullanıcı → GET /api/v1/cart  (Authorization: Bearer <token>)
6. JwtAuthGuard → token'ı doğrular
7. JwtStrategy.validate() → token'dan userId alır, DB'den kullanıcı bulur
8. request.user = kullanıcı objesi
9. Controller → @CurrentUser() ile kullanıcıya erişir
```

