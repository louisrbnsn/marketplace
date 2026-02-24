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
  type: string
  cardBrand?: string
  cardLast4?: string
  cardExpMonth?: number
  cardExpYear?: number
  isDefault: boolean
  createdAt: string
}

function AddPaymentMethodForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
      })

      if (stripeError) {
        setError(stripeError.message || 'Failed to create payment method')
        setLoading(false)
        return
      }

      // Save payment method to backend
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save payment method')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      <Button type="submit" disabled={!stripe || loading}>
        {loading ? 'Ajout en cours...' : 'Ajouter la carte'}
      </Button>
    </form>
  )
}

export function PaymentMethodManager() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [setupIntentSecret, setSetupIntentSecret] = useState<string | null>(null)

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods')
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data.paymentMethods)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const handleAddCard = async () => {
    try {
      // Create setup intent for adding card
      const response = await fetch('/api/payment-methods/setup-intent', {
        method: 'POST',
      })
      const data = await response.json()
      setSetupIntentSecret(data.clientSecret)
      setShowAddForm(true)
    } catch (error) {
      console.error('Error creating setup intent:', error)
    }
  }

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      return
    }

    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id))
      }
    } catch (error) {
      console.error('Error deleting payment method:', error)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/payment-methods/${id}/default`, {
        method: 'PUT',
      })

      if (response.ok) {
        setPaymentMethods(
          paymentMethods.map((pm) => ({
            ...pm,
            isDefault: pm.id === id,
          }))
        )
      }
    } catch (error) {
      console.error('Error setting default payment method:', error)
    }
  }

  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'amex':
        return '💳'
      default:
        return '💳'
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Méthodes de paiement</h2>
        {!showAddForm && (
          <Button onClick={handleAddCard}>
            Ajouter une carte
          </Button>
        )}
      </div>

      {showAddForm && setupIntentSecret && (
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Ajouter une nouvelle carte</h3>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: setupIntentSecret,
              appearance: { theme: 'stripe' },
            }}
          >
            <AddPaymentMethodForm
              onSuccess={() => {
                setShowAddForm(false)
                setSetupIntentSecret(null)
                fetchPaymentMethods()
              }}
            />
          </Elements>
          <Button
            variant="ghost"
            onClick={() => {
              setShowAddForm(false)
              setSetupIntentSecret(null)
            }}
            className="mt-4"
          >
            Annuler
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune méthode de paiement enregistrée
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className="border rounded-lg p-4 flex items-center justify-between bg-white"
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{getCardIcon(method.cardBrand)}</span>
                <div>
                  <div className="font-medium">
                    {method.cardBrand?.toUpperCase()} •••• {method.cardLast4}
                  </div>
                  <div className="text-sm text-gray-500">
                    Expire {method.cardExpMonth}/{method.cardExpYear}
                  </div>
                  {method.isDefault && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Par défaut
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Définir par défaut
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCard(method.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
