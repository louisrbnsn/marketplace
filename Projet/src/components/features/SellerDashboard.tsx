'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface SellerStatus {
  connected: boolean
  detailsSubmitted: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  requirements?: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
  }
}

interface Balance {
  totalEarnings: number
  totalSales: number
  pendingAmount: number
  pendingSales: number
  availableAmount: number
  currency: string
  stripeBalance?: {
    available: Array<{ amount: number; currency: string }>
    pending: Array<{ amount: number; currency: string }>
  }
}

export function SellerDashboard() {
  const [status, setStatus] = useState<SellerStatus | null>(null)
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboarding, setOnboarding] = useState(false)

  useEffect(() => {
    fetchSellerStatus()
    fetchBalance()
  }, [])

  const fetchSellerStatus = async () => {
    try {
      const response = await fetch('/api/seller/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error fetching seller status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/seller/balance')
      if (response.ok) {
        const data = await response.json()
        setBalance(data)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const handleOnboarding = async () => {
    setOnboarding(true)
    try {
      const response = await fetch('/api/seller/onboard', {
        method: 'POST',
      })
      const data = await response.json()
      
      // Redirect to Stripe onboarding
      window.location.href = data.url
    } catch (error) {
      console.error('Error starting onboarding:', error)
      setOnboarding(false)
    }
  }

  const handleOpenDashboard = async () => {
    try {
      const response = await fetch('/api/seller/dashboard')
      const data = await response.json()
      
      // Open Stripe dashboard in new window
      window.open(data.url, '_blank')
    } catch (error) {
      console.error('Error opening dashboard:', error)
    }
  }

  const formatAmount = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount / 100)
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tableau de bord vendeur</h2>

      {/* Connection Status */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">Statut du compte de paiement</h3>
        
        {!status?.connected ? (
          <div>
            <p className="text-gray-600 mb-4">
              Pour recevoir des paiements, vous devez configurer votre compte Stripe Connect.
            </p>
            <Button onClick={handleOnboarding} disabled={onboarding}>
              {onboarding ? 'Redirection...' : 'Configurer les paiements'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Informations complètes</span>
                <div className="flex items-center mt-1">
                  {status.detailsSubmitted ? (
                    <>
                      <span className="text-green-600">✓</span>
                      <span className="ml-2">Complété</span>
                    </>
                  ) : (
                    <>
                      <span className="text-yellow-600">⚠</span>
                      <span className="ml-2">Incomplet</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Paiements activés</span>
                <div className="flex items-center mt-1">
                  {status.chargesEnabled ? (
                    <>
                      <span className="text-green-600">✓</span>
                      <span className="ml-2">Activé</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-600">✗</span>
                      <span className="ml-2">Désactivé</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Virements activés</span>
                <div className="flex items-center mt-1">
                  {status.payoutsEnabled ? (
                    <>
                      <span className="text-green-600">✓</span>
                      <span className="ml-2">Activé</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-600">✗</span>
                      <span className="ml-2">Désactivé</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {status.requirements && status.requirements.currently_due.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  Des informations supplémentaires sont requises pour activer complètement votre compte.
                </p>
                <Button
                  onClick={handleOnboarding}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Compléter les informations
                </Button>
              </div>
            )}

            <Button onClick={handleOpenDashboard} variant="outline">
              Ouvrir le tableau de bord Stripe
            </Button>
          </div>
        )}
      </div>

      {/* Balance */}
      {balance && status?.connected && (
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Solde et gains</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Gains totaux</div>
              <div className="text-2xl font-bold">
                {formatAmount(balance.totalEarnings, balance.currency)}
              </div>
              <div className="text-sm text-gray-500">{balance.totalSales} ventes</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">En attente</div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatAmount(balance.pendingAmount, balance.currency)}
              </div>
              <div className="text-sm text-gray-500">{balance.pendingSales} ventes</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Disponible</div>
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(balance.availableAmount, balance.currency)}
              </div>
            </div>

            {balance.stripeBalance && balance.stripeBalance.available.length > 0 && (
              <div>
                <div className="text-sm text-gray-600">Solde Stripe</div>
                <div className="text-2xl font-bold">
                  {formatAmount(
                    balance.stripeBalance.available[0].amount,
                    balance.stripeBalance.available[0].currency
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
