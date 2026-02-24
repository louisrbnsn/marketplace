import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Platform fee percentage
export const PLATFORM_FEE_PERCENTAGE = parseInt(
  process.env.PLATFORM_FEE_PERCENTAGE || '20'
)

// Featured product prices (in cents)
export const FEATURED_PRICES = {
  homepage_7d: parseInt(process.env.FEATURED_HOMEPAGE_7D || '4900'),
  homepage_30d: parseInt(process.env.FEATURED_HOMEPAGE_30D || '14900'),
  category_7d: parseInt(process.env.FEATURED_CATEGORY_7D || '2900'),
  category_30d: parseInt(process.env.FEATURED_CATEGORY_30D || '8900'),
}

// Premium subscription prices (in cents)
export const PREMIUM_PRICES = {
  monthly: parseInt(process.env.PREMIUM_MONTHLY_PRICE || '999'),
  yearly: parseInt(process.env.PREMIUM_YEARLY_PRICE || '9900'),
}

/**
 * Create a Stripe Connect account for a seller
 */
export async function createConnectAccount(
  email: string,
  userId: string
): Promise<string> {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      userId,
    },
  })

  return account.id
}

/**
 * Create an account link for onboarding
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  return accountLink.url
}

/**
 * Create a payment intent for an order
 */
export async function createPaymentIntent(
  amount: number,
  customerId: string,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  })
}

/**
 * Transfer funds to a seller's Connect account
 */
export async function transferToSeller(
  amount: number,
  connectAccountId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Transfer> {
  return stripe.transfers.create({
    amount,
    currency: 'eur',
    destination: connectAccountId,
    metadata,
  })
}

/**
 * Create a subscription for premium access
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata,
  })
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  if (atPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  }

  return stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Create a Stripe customer
 */
export async function createCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email,
    name,
    metadata,
  })
}

/**
 * Create a checkout session for featured product
 */
export async function createFeaturedCheckoutSession(
  customerId: string,
  amount: number,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Product promotion',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  })
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

/**
 * Get account balance
 */
export async function getAccountBalance(
  accountId: string
): Promise<Stripe.Balance> {
  return stripe.balance.retrieve({
    stripeAccount: accountId,
  })
}

/**
 * List transfers for a Connect account
 */
export async function listTransfers(
  accountId: string,
  limit: number = 10
): Promise<Stripe.ApiList<Stripe.Transfer>> {
  return stripe.transfers.list({
    destination: accountId,
    limit,
  })
}

/**
 * Create a refund for a charge
 */
export async function createRefund(
  chargeId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    charge: chargeId,
    amount,
    reason,
  })
}

/**
 * List payment methods for a customer
 */
export async function listPaymentMethods(
  customerId: string,
  type: string = 'card'
): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
  return stripe.paymentMethods.list({
    customer: customerId,
    type: type as Stripe.PaymentMethodListParams.Type,
  })
}

/**
 * Detach payment method from customer
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  return stripe.paymentMethods.detach(paymentMethodId)
}

/**
 * Update customer default payment method
 */
export async function updateCustomerDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> {
  return stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })
}
