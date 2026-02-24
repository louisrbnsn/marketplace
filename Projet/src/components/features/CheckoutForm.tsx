'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/Button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentMethod {
  id: string
  stripePaymentMethodId: string
  cardBrand?: string
  cardLast4?: string
  cardExpMonth?: number
  cardExpYear?: number
  isDefault: boolean
}

interface CheckoutFormProps {
  items: Array<{ id: string; title: string; price: number }>
  onSuccess: (orderId: string) => void
  onError: (error: string) => void
}

function CheckoutFormContent({ items, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [useNewCard, setUseNewCard] = useState(false)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods')
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data.paymentMethods)
        
        // Auto-select default payment method
        const defaultMethod = data.paymentMethods.find((pm: PaymentMethod) => pm.isDefault)
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.stripePaymentMethodId)
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    try {
      let paymentMethodId = selectedPaymentMethod

      // If using a new card, create payment method first
      if (useNewCard) {
        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
          elements,
        })

        if (stripeError) {
          onError(stripeError.message || 'Failed to add payment method')
          setLoading(false)
          return
        }

        paymentMethodId = paymentMethod.id

        // Optionally save the card
        await fetch('/api/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethodId }),
        })
      }

      // Create checkout
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id })),
          paymentMethodId,
        }),
      })

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json()
        throw new Error(errorData.error || 'Checkout failed')
      }

      const { clientSecret, orderId, status } = await checkoutResponse.json()

      // If payment was already confirmed (using saved card)
      if (status === 'succeeded') {
        onSuccess(orderId)
        return
      }

      // Otherwise, confirm the payment
      if (!useNewCard && paymentMethodId) {
        // Payment already confirmed on server
        onSuccess(orderId)
      } else if (clientSecret) {
        const { error: confirmError } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
          },
          redirect: 'if_required',
        })

        if (confirmError) {
          onError(confirmError.message || 'Payment failed')
        } else {
          onSuccess(orderId)
        }
      }
    } catch (err: any) {
      onError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price / 100)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold mb-3">Résumé de la commande</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.title}</span>
              <span>{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      {paymentMethods.length > 0 && !useNewCard ? (
        <div className="space-y-3">
          <h3 className="font-semibold">Méthode de paiement</h3>
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                selectedPaymentMethod === method.stripePaymentMethodId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.stripePaymentMethodId}
                checked={selectedPaymentMethod === method.stripePaymentMethodId}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium">
                  {method.cardBrand?.toUpperCase()} •••• {method.cardLast4}
                </div>
                <div className="text-sm text-gray-500">
                  Expire {method.cardExpMonth}/{method.cardExpYear}
                </div>
              </div>
              {method.isDefault && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Par défaut
                </span>
              )}
            </label>
          ))}
          <button
            type="button"
            onClick={() => setUseNewCard(true)}
            className="text-blue-600 text-sm hover:underline"
          >
            Utiliser une nouvelle carte
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Informations de paiement</h3>
            {paymentMethods.length > 0 && (
              <button
                type="button"
                onClick={() => setUseNewCard(false)}
                className="text-blue-600 text-sm hover:underline"
              >
                Utiliser une carte enregistrée
              </button>
            )}
          </div>
          <PaymentElement />
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || loading || (!useNewCard && !selectedPaymentMethod)}
        className="w-full"
      >
        {loading ? 'Traitement...' : `Payer ${formatPrice(totalAmount)}`}
      </Button>
    </form>
  )
}

export function CheckoutForm({ items, onSuccess, onError }: CheckoutFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: 'payment',
        amount: items.reduce((sum, item) => sum + item.price, 0),
        currency: 'eur',
        appearance: { theme: 'stripe' },
      }}
    >
      <CheckoutFormContent items={items} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}
