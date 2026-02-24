# 🚀 Guide d'Installation Rapide - Système de Paiement Marketplace

## Étape 1 : Installation des dépendances

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
# ou
pnpm add @stripe/stripe-js @stripe/react-stripe-js stripe
```

## Étape 2 : Configuration des variables d'environnement

1. Créez un compte Stripe sur [stripe.com](https://stripe.com)
2. Récupérez vos clés API : [Dashboard > Developers > API keys](https://dashboard.stripe.com/apikeys)
3. Ajoutez à votre fichier `.env` :

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
PLATFORM_FEE_PERCENTAGE=20
```

## Étape 3 : Migration de la base de données

Exécutez le script de migration SQL :

```bash
# Si vous utilisez Drizzle
npm run db:push

# Ou manuellement avec PostgreSQL
psql -d votre_database < migrations/add_payment_tables.sql
```

Cela créera deux nouvelles tables :
- `payment_methods` : Pour stocker les cartes bancaires
- `payouts` : Pour l'historique des virements aux vendeurs

## Étape 4 : Configuration du webhook Stripe

### En développement (local)

1. Installez Stripe CLI :
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (avec Scoop)
scoop install stripe

# Ou téléchargez depuis https://github.com/stripe/stripe-cli/releases
```

2. Connectez-vous à Stripe :
```bash
stripe login
```

3. Lancez le forwarding des webhooks :
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Copiez le webhook secret affiché et mettez-le dans `.env.local`

### En production

1. Allez sur [Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur "Add endpoint"
3. URL : `https://votre-domaine.com/api/webhooks/stripe`
4. Sélectionnez les événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `account.updated`
   - `payment_method.attached`
   - `payment_method.detached`
5. Copiez le webhook secret dans votre `.env` de production

## Étape 5 : Vérification de l'installation

Exécutez le script de vérification :

```bash
chmod +x scripts/check-payment-setup.sh
./scripts/check-payment-setup.sh
```

## Étape 6 : Intégration dans votre application

### Pour les acheteurs (gestion des cartes)

Créez une page `/dashboard/payment-settings` :

```tsx
import { PaymentMethodManager } from '@/components/features/PaymentMethodManager'

export default function PaymentSettingsPage() {
  return <PaymentMethodManager />
}
```

### Pour les vendeurs (compte paiements)

Créez une page `/dashboard/seller-payments` :

```tsx
import { SellerDashboard } from '@/components/features/SellerDashboard'

export default function SellerPaymentsPage() {
  return <SellerDashboard />
}
```

### Pour le checkout

Utilisez le composant `CheckoutForm` :

```tsx
import { CheckoutForm } from '@/components/features/CheckoutForm'

export default function CheckoutPage() {
  const items = [
    { id: 'prod_1', title: 'Produit 1', price: 2990 }, // Prix en centimes
  ]

  return (
    <CheckoutForm
      items={items}
      onSuccess={(orderId) => {
        // Rediriger vers page de succès
        router.push(`/order/${orderId}`)
      }}
      onError={(error) => {
        // Afficher l'erreur
        alert(error)
      }}
    />
  )
}
```

## Étape 7 : Test du système

### Cartes de test Stripe

Utilisez ces numéros de carte pour tester :

- **Paiement réussi** : `4242 4242 4242 4242`
- **Paiement refusé** : `4000 0000 0000 9995`
- **Nécessite 3D Secure** : `4000 0025 0000 3155`

Pour tous les tests :
- Date d'expiration : N'importe quelle date future
- CVC : N'importe quel 3 chiffres
- Code postal : N'importe quel code

### Scénarios de test

1. **En tant qu'acheteur** :
   - Allez sur `/dashboard/payment-settings`
   - Ajoutez une carte de test
   - Procédez à un achat
   - Vérifiez que la commande est créée

2. **En tant que vendeur** :
   - Allez sur `/dashboard/seller-payments`
   - Cliquez sur "Configurer les paiements"
   - Complétez l'onboarding Stripe Connect (utilisez des données de test)
   - Vérifiez que votre compte est activé

3. **Vérification des webhooks** :
   - Dans le terminal où `stripe listen` tourne, vérifiez que les événements arrivent
   - Consultez les logs de votre application pour voir le traitement

## 🎉 C'est terminé !

Votre système de paiement marketplace est maintenant configuré. Les fonctionnalités suivantes sont actives :

✅ Ajout et gestion de cartes bancaires
✅ Paiement sécurisé avec SCA (3D Secure)
✅ Onboarding vendeurs Stripe Connect
✅ Distribution automatique des paiements aux vendeurs
✅ Prélèvement de commission (20% par défaut)
✅ Webhooks pour synchroniser les paiements
✅ Dashboard vendeur avec statistiques

## 📚 Documentation complète

Consultez `docs/PAYMENT_SYSTEM.md` pour la documentation complète.

## 🆘 Besoin d'aide ?

- [Documentation Stripe](https://stripe.com/docs)
- [Support Stripe](https://support.stripe.com)
- [Stripe Discord](https://stripe.com/go/developer-chat)

## ⚠️ Avant de passer en production

1. Basculez de `sk_test_` vers `sk_live_` dans vos variables d'environnement
2. Configurez le webhook en production (URL HTTPS requise)
3. Testez tous les flux de paiement
4. Vérifiez que les virements aux vendeurs fonctionnent
5. Consultez les exigences légales de votre pays pour les marketplaces
