# Schéma de Base de Données

Ce document décrit le schéma complet de la base de données PostgreSQL pour le marketplace de créateurs.

## Tables

### users
Table principale des utilisateurs de la plateforme.

```sql
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE NOT NULL
- password: VARCHAR(255) NOT NULL (hashed)
- fullName: VARCHAR(255) NOT NULL
- avatar: TEXT
- role: ENUM('buyer', 'seller', 'premium', 'admin')
- isEmailVerified: BOOLEAN DEFAULT false
- emailVerificationToken: VARCHAR(255)
- resetPasswordToken: VARCHAR(255)
- resetPasswordExpires: TIMESTAMP
- stripeCustomerId: VARCHAR(255)
- stripeConnectId: VARCHAR(255)
- trustScore: INTEGER DEFAULT 100
- strikes: INTEGER DEFAULT 0
- isSuspended: BOOLEAN DEFAULT false
- suspendedAt: TIMESTAMP
- suspensionReason: TEXT
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### stores
Boutiques des vendeurs.

```sql
- id: UUID (PK)
- userId: UUID (FK -> users) UNIQUE
- name: VARCHAR(255) NOT NULL
- slug: VARCHAR(255) UNIQUE NOT NULL
- description: TEXT
- logo: TEXT
- banner: TEXT
- socialLinks: JSONB
- averageRating: DECIMAL(3,2) DEFAULT 0
- totalSales: INTEGER DEFAULT 0
- isActive: BOOLEAN DEFAULT true
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### products
Produits vendus sur la plateforme.

```sql
- id: UUID (PK)
- storeId: UUID (FK -> stores)
- userId: UUID (FK -> users) NOT NULL
- title: VARCHAR(255) NOT NULL
- slug: VARCHAR(255) NOT NULL
- description: TEXT NOT NULL
- shortDescription: VARCHAR(500)
- price: INTEGER NOT NULL (en centimes)
- category: ENUM('lut', 'preset', 'sfx', 'template', 'pack', 'overlay', 'other')
- status: ENUM('draft', 'pending_validation', 'published', 'rejected', 'suspended')
- isPlatformProduct: BOOLEAN DEFAULT false
- isPremiumOnly: BOOLEAN DEFAULT false
- fileUrl: TEXT
- fileSize: INTEGER (en bytes)
- fileType: VARCHAR(100)
- thumbnailUrl: TEXT
- previewUrls: JSONB (array)
- tags: JSONB (array)
- downloadCount: INTEGER DEFAULT 0
- viewCount: INTEGER DEFAULT 0
- purchaseCount: INTEGER DEFAULT 0
- averageRating: DECIMAL(3,2) DEFAULT 0
- reviewCount: INTEGER DEFAULT 0
- rejectionReason: TEXT
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
- publishedAt: TIMESTAMP
```

### featured_products
Produits mis en avant (payant).

```sql
- id: UUID (PK)
- productId: UUID (FK -> products) NOT NULL
- userId: UUID (FK -> users) NOT NULL
- type: ENUM('homepage', 'category')
- category: ENUM (product categories)
- featuredUntil: TIMESTAMP NOT NULL
- amountPaid: INTEGER NOT NULL (en centimes)
- stripePaymentId: VARCHAR(255)
- createdAt: TIMESTAMP
```

### orders
Commandes d'achat.

```sql
- id: UUID (PK)
- buyerId: UUID (FK -> users) NOT NULL
- totalAmount: INTEGER NOT NULL (en centimes)
- platformFee: INTEGER NOT NULL (en centimes)
- status: ENUM('pending', 'processing', 'completed', 'failed', 'refunded')
- stripePaymentIntentId: VARCHAR(255)
- stripeChargeId: VARCHAR(255)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
- completedAt: TIMESTAMP
```

### order_items
Items d'une commande (peut contenir plusieurs produits).

```sql
- id: UUID (PK)
- orderId: UUID (FK -> orders) NOT NULL
- productId: UUID (FK -> products) NOT NULL
- sellerId: UUID (FK -> users) NOT NULL
- price: INTEGER NOT NULL (en centimes)
- platformFee: INTEGER NOT NULL (en centimes)
- sellerAmount: INTEGER NOT NULL (en centimes)
- stripeTransferId: VARCHAR(255)
- isDownloaded: BOOLEAN DEFAULT false
- downloadedAt: TIMESTAMP
- createdAt: TIMESTAMP
```

### reviews
Avis clients sur les produits.

```sql
- id: UUID (PK)
- productId: UUID (FK -> products) NOT NULL
- userId: UUID (FK -> users) NOT NULL
- orderId: UUID (FK -> orders) NOT NULL
- rating: INTEGER NOT NULL (1-5)
- comment: TEXT
- isVerifiedPurchase: BOOLEAN DEFAULT true
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### subscriptions
Abonnements premium des utilisateurs.

```sql
- id: UUID (PK)
- userId: UUID (FK -> users) NOT NULL
- stripeSubscriptionId: VARCHAR(255) UNIQUE NOT NULL
- stripePriceId: VARCHAR(255) NOT NULL
- status: ENUM('active', 'canceled', 'past_due', 'trialing')
- currentPeriodStart: TIMESTAMP NOT NULL
- currentPeriodEnd: TIMESTAMP NOT NULL
- cancelAtPeriodEnd: BOOLEAN DEFAULT false
- canceledAt: TIMESTAMP
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### activity_logs
Logs d'activité pour la sécurité et le monitoring.

```sql
- id: UUID (PK)
- userId: UUID (FK -> users)
- action: VARCHAR(255) NOT NULL
- entityType: VARCHAR(100)
- entityId: UUID
- metadata: JSONB
- ipAddress: VARCHAR(50)
- userAgent: TEXT
- createdAt: TIMESTAMP
```

### reports
Signalements de la communauté.

```sql
- id: UUID (PK)
- reporterId: UUID (FK -> users) NOT NULL
- entityType: VARCHAR(100) NOT NULL ('product', 'user', 'review')
- entityId: UUID NOT NULL
- reason: TEXT NOT NULL
- status: VARCHAR(50) DEFAULT 'pending'
- resolvedBy: UUID (FK -> users)
- resolvedAt: TIMESTAMP
- resolution: TEXT
- createdAt: TIMESTAMP
```

## Relations

- Un `user` peut avoir un `store` (1:1)
- Un `user` peut avoir plusieurs `products` (1:N)
- Un `store` peut avoir plusieurs `products` (1:N)
- Un `user` peut avoir plusieurs `orders` en tant qu'acheteur (1:N)
- Un `order` peut avoir plusieurs `order_items` (1:N)
- Un `product` peut avoir plusieurs `reviews` (1:N)
- Un `user` peut avoir une `subscription` (1:1)
- Un `product` peut avoir plusieurs `featured_products` (1:N)

## Indexation

Les index suivants sont créés pour optimiser les performances :

- `users.email` (unique)
- `stores.slug` (unique)
- `stores.userId` (unique)
- `products.slug`
- `products.storeId`
- `products.category`
- `products.status`
- `orders.buyerId`
- `orders.status`
- `reviews.productId`
- `reviews.userId`

## Migrations

Pour générer et appliquer les migrations :

```bash
npm run db:generate
npm run db:migrate
```

Pour ouvrir Drizzle Studio :

```bash
npm run db:studio
```
