import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  uniqueIndex,
  index,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// =====================
// ENUMS
// =====================

export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller', 'premium', 'admin'])
export const productStatusEnum = pgEnum('product_status', [
  'draft',
  'pending_validation',
  'published',
  'rejected',
  'suspended',
])
export const productCategoryEnum = pgEnum('product_category', [
  'lut',
  'preset',
  'sfx',
  'template',
  'pack',
  'overlay',
  'other',
])
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
])
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'past_due',
  'trialing',
])
export const featuredTypeEnum = pgEnum('featured_type', ['homepage', 'category'])

// =====================
// USERS
// =====================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    avatar: text('avatar'),
    role: userRoleEnum('role').default('buyer').notNull(),
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),
    emailVerificationToken: varchar('email_verification_token', { length: 255 }),
    resetPasswordToken: varchar('reset_password_token', { length: 255 }),
    resetPasswordExpires: timestamp('reset_password_expires'),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    stripeConnectId: varchar('stripe_connect_id', { length: 255 }),
    trustScore: integer('trust_score').default(100).notNull(),
    strikes: integer('strikes').default(0).notNull(),
    isSuspended: boolean('is_suspended').default(false).notNull(),
    suspendedAt: timestamp('suspended_at'),
    suspensionReason: text('suspension_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex('users_email_idx').on(table.email),
      stripeCustomerIdx: index('users_stripe_customer_idx').on(table.stripeCustomerId),
      stripeConnectIdx: index('users_stripe_connect_idx').on(table.stripeConnectId),
    }
  }
)

// =====================
// STORES
// =====================

export const stores = pgTable(
  'stores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    logo: text('logo'),
    banner: text('banner'),
    socialLinks: jsonb('social_links').$type<{
      twitter?: string
      instagram?: string
      youtube?: string
      website?: string
    }>(),
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
    totalSales: integer('total_sales').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      slugIdx: uniqueIndex('stores_slug_idx').on(table.slug),
      userIdIdx: uniqueIndex('stores_user_id_idx').on(table.userId),
    }
  }
)

// =====================
// PRODUCTS
// =====================

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    storeId: uuid('store_id').references(() => stores.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description').notNull(),
    shortDescription: varchar('short_description', { length: 500 }),
    price: integer('price').notNull(), // in cents
    category: productCategoryEnum('category').notNull(),
    status: productStatusEnum('status').default('draft').notNull(),
    isPlatformProduct: boolean('is_platform_product').default(false).notNull(),
    isPremiumOnly: boolean('is_premium_only').default(false).notNull(),
    fileUrl: text('file_url'),
    fileSize: integer('file_size'), // in bytes
    fileType: varchar('file_type', { length: 100 }),
    thumbnailUrl: text('thumbnail_url'),
    previewUrls: jsonb('preview_urls').$type<string[]>(),
    tags: jsonb('tags').$type<string[]>(),
    downloadCount: integer('download_count').default(0).notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    purchaseCount: integer('purchase_count').default(0).notNull(),
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
    reviewCount: integer('review_count').default(0).notNull(),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    publishedAt: timestamp('published_at'),
  },
  (table) => {
    return {
      slugIdx: index('products_slug_idx').on(table.slug),
      storeIdIdx: index('products_store_id_idx').on(table.storeId),
      categoryIdx: index('products_category_idx').on(table.category),
      statusIdx: index('products_status_idx').on(table.status),
      createdAtIdx: index('products_created_at_idx').on(table.createdAt),
    }
  }
)

// =====================
// FEATURED PRODUCTS
// =====================

export const featuredProducts = pgTable('featured_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: featuredTypeEnum('type').notNull(),
  category: productCategoryEnum('category'),
  featuredUntil: timestamp('featured_until').notNull(),
  amountPaid: integer('amount_paid').notNull(), // in cents
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// =====================
// ORDERS
// =====================

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    buyerId: uuid('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    totalAmount: integer('total_amount').notNull(), // in cents
    platformFee: integer('platform_fee').notNull(), // in cents
    status: orderStatusEnum('status').default('pending').notNull(),
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
    stripeChargeId: varchar('stripe_charge_id', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => {
    return {
      buyerIdIdx: index('orders_buyer_id_idx').on(table.buyerId),
      statusIdx: index('orders_status_idx').on(table.status),
      createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
    }
  }
)

// =====================
// ORDER ITEMS
// =====================

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  sellerId: uuid('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  price: integer('price').notNull(), // in cents
  platformFee: integer('platform_fee').notNull(), // in cents
  sellerAmount: integer('seller_amount').notNull(), // in cents
  stripeTransferId: varchar('stripe_transfer_id', { length: 255 }),
  isDownloaded: boolean('is_downloaded').default(false).notNull(),
  downloadedAt: timestamp('downloaded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// =====================
// REVIEWS
// =====================

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(), // 1-5
    comment: text('comment'),
    isVerifiedPurchase: boolean('is_verified_purchase').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      productIdIdx: index('reviews_product_id_idx').on(table.productId),
      userIdIdx: index('reviews_user_id_idx').on(table.userId),
    }
  }
)

// =====================
// SUBSCRIPTIONS
// =====================

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).notNull().unique(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }).notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// =====================
// PAYMENT METHODS (Saved Cards)
// =====================

export const paymentMethods = pgTable(
  'payment_methods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripePaymentMethodId: varchar('stripe_payment_method_id', { length: 255 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull(), // 'card', 'sepa_debit', etc.
    cardBrand: varchar('card_brand', { length: 50 }), // 'visa', 'mastercard', etc.
    cardLast4: varchar('card_last4', { length: 4 }),
    cardExpMonth: integer('card_exp_month'),
    cardExpYear: integer('card_exp_year'),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index('payment_methods_user_id_idx').on(table.userId),
      stripePaymentMethodIdx: uniqueIndex('payment_methods_stripe_pm_idx').on(table.stripePaymentMethodId),
    }
  }
)

// =====================
// SELLER PAYOUTS
// =====================

export const payouts = pgTable(
  'payouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(), // in cents
    currency: varchar('currency', { length: 3 }).default('eur').notNull(),
    status: varchar('status', { length: 50 }).default('pending').notNull(), // 'pending', 'paid', 'failed', 'canceled'
    stripePayoutId: varchar('stripe_payout_id', { length: 255 }),
    stripeTransferId: varchar('stripe_transfer_id', { length: 255 }),
    arrivalDate: timestamp('arrival_date'),
    failureMessage: text('failure_message'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      sellerIdIdx: index('payouts_seller_id_idx').on(table.sellerId),
      statusIdx: index('payouts_status_idx').on(table.status),
      createdAtIdx: index('payouts_created_at_idx').on(table.createdAt),
    }
  }
)

// =====================
// ACTIVITY LOGS
// =====================

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 255 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// =====================
// REPORTS (Community flags)
// =====================

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  entityType: varchar('entity_type', { length: 100 }).notNull(), // 'product', 'user', 'review'
  entityId: uuid('entity_id').notNull(),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// =====================
// RELATIONS
// =====================

export const usersRelations = relations(users, ({ one, many }) => ({
  store: one(stores, {
    fields: [users.id],
    references: [stores.userId],
  }),
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
  subscription: one(subscriptions),
  paymentMethods: many(paymentMethods),
  payouts: many(payouts),
}))

export const storesRelations = relations(stores, ({ one, many }) => ({
  user: one(users, {
    fields: [stores.userId],
    references: [users.id],
  }),
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  reviews: many(reviews),
  featured: many(featuredProducts),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  items: many(orderItems),
  reviews: many(reviews),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  seller: one(users, {
    fields: [orderItems.sellerId],
    references: [users.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}))

export const payoutsRelations = relations(payouts, ({ one }) => ({
  seller: one(users, {
    fields: [payouts.sellerId],
    references: [users.id],
  }),
}))
  }),
}))
