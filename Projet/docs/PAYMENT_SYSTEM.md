# Système de Paiement Marketplace

Ce système complet de paiement permet aux acheteurs de payer avec leurs cartes bancaires et aux vendeurs de recevoir des paiements via Stripe Connect.

## 🎯 Fonctionnalités

### Pour les acheteurs
- ✅ Ajouter et gérer plusieurs cartes bancaires
- ✅ Définir une carte par défaut
- ✅ Paiement sécurisé avec cartes enregistrées ou nouvelles cartes
- ✅ Historique des commandes

### Pour les vendeurs
- ✅ Configuration du compte Stripe Connect (onboarding)
- ✅ Réception automatique des paiements
- ✅ Dashboard avec statistiques de ventes
- ✅ Accès au tableau de bord Stripe
- ✅ Virements automatiques vers leur compte bancaire

### Pour la plateforme
- ✅ Prélèvement de commission automatique (20% par défaut)
- ✅ Distribution des paiements aux vendeurs
- ✅ Gestion des webhooks Stripe
- ✅ Traçabilité complète des transactions

## 📋 Prérequis

1. **Compte Stripe**
   - Créer un compte sur [stripe.com](https://stripe.com)
   - Obtenir les clés API (Publishable key et Secret key)
   - Créer un webhook secret

2. **Base de données**
   - PostgreSQL avec les nouvelles tables `payment_methods` et `payouts`

## ⚙️ Configuration

### 1. Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Platform Settings
PLATFORM_FEE_PERCENTAGE=20  # Commission de la plateforme (en %)
```

### 2. Migration de la base de données

Exécutez les migrations pour ajouter les nouvelles tables :

```bash
npm run db:push
# ou
pnpm db:push
```

Les nouvelles tables créées :
- `payment_methods` : Cartes bancaires enregistrées
- `payouts` : Historique des virements aux vendeurs

### 3. Configuration du webhook Stripe

1. Allez dans [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Créez un nouveau endpoint : `https://votre-domaine.com/api/webhooks/stripe`
3. Sélectionnez ces événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `account.updated`
   - `payment_method.attached`
   - `payment_method.detached`
4. Copiez le webhook secret dans `STRIPE_WEBHOOK_SECRET`

### 4. Installation des dépendances Stripe

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
# ou
pnpm add @stripe/stripe-js @stripe/react-stripe-js
```

## 🚀 Utilisation

### 1. Gestion des cartes bancaires (Acheteurs)

Dans votre page de paramètres de compte :

```tsx
import { PaymentMethodManager } from '@/components/features/PaymentMethodManager'

export default function SettingsPage() {
  return (
    <div>
      <h1>Mes moyens de paiement</h1>
      <PaymentMethodManager />
    </div>
  )
}
```

### 2. Dashboard vendeur (Vendeurs)

Dans votre dashboard vendeur :

```tsx
import { SellerDashboard } from '@/components/features/SellerDashboard'

export default function SellerDashboardPage() {
  return (
    <div>
      <h1>Mon compte vendeur</h1>
      <SellerDashboard />
    </div>
  )
}
```

### 3. Processus de checkout

Dans votre page de checkout :

```tsx
import { CheckoutForm } from '@/components/features/CheckoutForm'

export default function CheckoutPage() {
  const cartItems = [
    { id: 'prod_1', title: 'Produit 1', price: 2990 },
    { id: 'prod_2', title: 'Produit 2', price: 4990 },
  ]

  return (
    <CheckoutForm
      items={cartItems}
      onSuccess={(orderId) => {
        console.log('Paiement réussi:', orderId)
        // Rediriger vers page de confirmation
      }}
      onError={(error) => {
        console.error('Erreur:', error)
        // Afficher message d'erreur
      }}
    />
  )
}
```

## 🔄 Flux de paiement

### Étape 1 : L'acheteur procède au paiement
1. L'acheteur sélectionne une carte enregistrée ou ajoute une nouvelle carte
2. Le système crée une commande dans la base de données
3. Un Payment Intent est créé avec les métadonnées de la commande

### Étape 2 : Traitement du paiement
1. Le paiement est confirmé par Stripe
2. Le webhook `payment_intent.succeeded` est déclenché
3. La commande est marquée comme "completed"

### Étape 3 : Distribution aux vendeurs
1. Pour chaque produit de la commande :
   - La commission de la plateforme est calculée (20%)
   - Le montant restant est transféré au vendeur via Stripe Connect
2. Les transferts sont enregistrés dans les `order_items`

### Étape 4 : Virement au vendeur
Stripe effectue automatiquement les virements vers le compte bancaire du vendeur selon son planning (quotidien, hebdomadaire, etc.)

## 📊 API Endpoints

### Cartes bancaires
- `GET /api/payment-methods` - Liste les cartes de l'utilisateur
- `POST /api/payment-methods` - Ajoute une carte
- `POST /api/payment-methods/setup-intent` - Crée un setup intent
- `DELETE /api/payment-methods/[id]` - Supprime une carte
- `PUT /api/payment-methods/[id]/default` - Définit une carte par défaut

### Vendeurs (Stripe Connect)
- `POST /api/seller/onboard` - Commence l'onboarding Stripe Connect
- `GET /api/seller/status` - Récupère le statut du compte Connect
- `GET /api/seller/dashboard` - Génère un lien vers le dashboard Stripe
- `GET /api/seller/balance` - Récupère le solde et les gains

### Checkout
- `POST /api/checkout` - Crée un payment intent et une commande

### Webhooks
- `POST /api/webhooks/stripe` - Gère les événements Stripe

## 🔒 Sécurité

- ✅ Toutes les routes API vérifient l'authentification
- ✅ Les cartes bancaires sont stockées sur Stripe (PCI compliant)
- ✅ Les webhooks Stripe sont vérifiés avec signature
- ✅ Les paiements utilisent SCA (Strong Customer Authentication)
- ✅ Les transferts aux vendeurs sont automatiques et sécurisés

## 🧪 Tests

### Test en mode développement (Stripe Test Mode)

1. Utilisez ces cartes de test :
   - `4242 4242 4242 4242` : Paiement réussi
   - `4000 0000 0000 9995` : Paiement refusé (fonds insuffisants)
   - `4000 0025 0000 3155` : Nécessite 3D Secure

2. Pour tester les webhooks localement :
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 📝 Notes importantes

1. **Commission de la plateforme** : Par défaut 20%, configurable via `PLATFORM_FEE_PERCENTAGE`
2. **Devise** : Actuellement configuré pour EUR, modifiable dans les fichiers
3. **Onboarding vendeur** : Les vendeurs doivent compléter l'onboarding Stripe avant de pouvoir recevoir des paiements
4. **Virements** : Gérés automatiquement par Stripe selon le planning du compte Connect

## 🆘 Dépannage

### Les paiements ne fonctionnent pas
- Vérifiez que `STRIPE_SECRET_KEY` est correcte
- Vérifiez que le compte Stripe est en mode actif (pas test)
- Consultez les logs de Stripe Dashboard

### Les vendeurs ne reçoivent pas les paiements
- Vérifiez que le vendeur a complété l'onboarding Stripe
- Vérifiez que `stripe_connect_id` est bien enregistré en base
- Vérifiez les logs dans Stripe Dashboard > Connect

### Les webhooks ne sont pas reçus
- Vérifiez `STRIPE_WEBHOOK_SECRET`
- Vérifiez que l'URL du webhook est correcte et accessible
- Utilisez `stripe listen` pour tester localement

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Testing Cards](https://stripe.com/docs/testing)
