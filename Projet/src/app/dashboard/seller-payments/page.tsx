'use client'

import { SellerDashboard } from '@/components/features/SellerDashboard'

export default function SellerPaymentPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestion des paiements</h1>
        <p className="text-gray-600">
          Configurez votre compte pour recevoir des paiements et suivez vos gains
        </p>
      </div>

      <SellerDashboard />

      <div className="mt-8 p-4 bg-gray-50 border rounded-lg">
        <h3 className="font-semibold mb-3">ℹ️ Comment ça marche ?</h3>
        <ol className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>1. Configurez votre compte</strong> - Cliquez sur "Configurer les paiements"
            pour créer votre compte Stripe Connect. Vous devrez fournir vos informations
            d'identité et vos coordonnées bancaires.
          </li>
          <li>
            <strong>2. Vendez vos produits</strong> - Une fois votre compte validé, vous
            pouvez commencer à vendre. Les paiements sont traités automatiquement.
          </li>
          <li>
            <strong>3. Recevez vos paiements</strong> - Après chaque vente, nous prélevons
            une commission de 20% et le reste vous est transféré automatiquement selon le
            planning défini avec Stripe (généralement quotidien ou hebdomadaire).
          </li>
          <li>
            <strong>4. Suivez vos gains</strong> - Consultez cette page pour voir vos
            gains totaux, votre solde en attente et votre solde disponible. Vous pouvez
            également accéder au tableau de bord Stripe pour plus de détails.
          </li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">
          💡 Bon à savoir
        </h3>
        <ul className="space-y-1 text-sm text-yellow-800">
          <li>• La commission de la plateforme est de 20% sur chaque vente</li>
          <li>• Les virements sont effectués automatiquement par Stripe</li>
          <li>• Vous recevez les paiements directement sur votre compte bancaire</li>
          <li>• Vous pouvez consulter l'historique complet dans le dashboard Stripe</li>
        </ul>
      </div>
    </div>
  )
}
