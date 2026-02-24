'use client'

import { useState } from 'react'
import { PaymentMethodManager } from '@/components/features/PaymentMethodManager'

export default function PaymentSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Paramètres de paiement</h1>
        <p className="text-gray-600">
          Gérez vos méthodes de paiement pour faciliter vos achats futurs
        </p>
      </div>

      <PaymentMethodManager />

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">
          🔒 Vos paiements sont sécurisés
        </h3>
        <p className="text-sm text-blue-800">
          Toutes les informations de carte bancaire sont stockées de manière
          sécurisée par notre partenaire de paiement Stripe. Nous ne conservons
          jamais les détails complets de votre carte.
        </p>
      </div>
    </div>
  )
}
