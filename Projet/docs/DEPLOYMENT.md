# Guide de Déploiement - Stack Vercel Complète

Ce guide vous aide à déployer le marketplace en production avec la stack recommandée.

## 🎯 Stack Recommandée

- **Vercel** : Hébergement + PostgreSQL + Blob Storage
- **Resend** : Emails transactionnels
- **Stripe** : Paiements

## Prérequis

- Compte Vercel
- Compte Stripe
- Compte Resend
- Compte GitHub (pour déploiement automatique)
- Domaine personnalisé (optionnel)

## 1. Configuration Vercel

### 1.1 Création du projet

1. Connectez-vous à [Vercel](https://vercel.com)
2. Importez votre repository GitHub
3. Vercel détectera automatiquement Next.js
4. Ne déployez PAS encore - configurez d'abord les variables d'environnement

### 1.2 Vercel PostgreSQL

1. Dans votre projet Vercel, allez dans **Storage**
2. Créez une nouvelle **Postgres Database**
3. Vercel ajoutera automatiquement `DATABASE_URL` aux variables d'environnement
4. Notez l'URL de connexion pour les migrations

### 1.3 Vercel Blob Storage

1. Dans **Storage**, créez un **Blob Store**
2. Vercel ajoutera automatiquement `BLOB_READ_WRITE_TOKEN`
3. Ce token sera utilisé pour l'upload des fichiers

## 2. Configuration de Stripe

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com)
2. Récupérez vos clés API (Developers > API keys)
3. Activez Stripe Connect (Connect > Get started)
4. Configurez les webhooks :
   - URL: `https://votre-domaine.com/api/webhooks/stripe`
   - Événements: `payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Ajoutez les clés à votre `.env`

## 3. Configuration des Emails (Resend)

1. Créez un compte sur [Resend](https://resend.com)
2. Vérifiez votre domaine (ou utilisez resend.dev pour les tests)
3. Générez une API Key
4. Ajoutez-la aux variables d'environnement Vercel : `RESEND_API_KEY`
5. Configurez l'email d'envoi : `RESEND_FROM_EMAIL=noreply@yourdomain.com`

**Gratuit** : 3000 emails/mois, largement suffisant pour commencer !

## 4. Déploiement

### Via GitHub (Recommandé)

1. Push votre code sur GitHub
2. Dans Vercel, votre projet se déploiera automatiquement
3. Attendez la fin du build (2-3 minutes)
4. Votre site est en ligne ! 🎉

### Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer en production
vercel --prod
```

**Note** : Chaque push sur `main` déclenchera un déploiement automatique

## 5. Variables d'Environnement

Ajoutez toutes ces variables dans Vercel Dashboard (Settings > Environment Variables) :

```env
# Database (Auto-ajouté par Vercel Postgres)
DATABASE_URL=

# Blob Storage (Auto-ajouté par Vercel Blob)
BLOB_READ_WRITE_TOKEN=

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# Resend (Emails)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Platform fee
PLATFORM_FEE_PERCENTAGE=20

# CDN (optionnel)
CDN_URL=

# App
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NEXT_PUBLIC_APP_NAME="Creator Marketplace"

# Featured Prices (en centimes)
FEATURED_HOMEPAGE_7D=4900
FEATURED_HOMEPAGE_30D=14900
FEATURED_CATEGORY_7D=2900
FEATURED_CATEGORY_30D=8900

# Premium Prices (en centimes)
PREMIUM_MONTHLY_PRICE=999
PREMIUM_YEARLY_PRICE=9900
```

## 6. Migrations de la Base de Données

Deux options :

### Option A : Via Vercel CLI (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet local au projet Vercel
vercel link

# Importer les variables d'environnement
vercel env pull .env.local

# Exécuter les migrations
npm run db:generate
npm run db:migrate
```

### Option B : Manuellement

1. Copiez la `DATABASE_URL` depuis Vercel
2. Exécutez en local :
```bash
DATABASE_URL="postgres://..." npm run db:migrate
```

## 7. Configuration DNS

Si vous utilisez un domaine personnalisé :

1. Ajoutez le domaine dans Vercel Dashboard (Settings > Domains)
2. Suivez les instructions Vercel pour configurer les DNS
3. Vercel configure automatiquement SSL/HTTPS
4. Mettez à jour `NEXT_PUBLIC_APP_URL` avec votre domaine

## 8. Optimisations Post-Déploiement

### Monitoring

Activez dans Vercel Dashboard :
- **Vercel Analytics** : Métriques de performance (gratuit)
- **Vercel Speed Insights** : Web Vitals (gratuit)
- Optionnel : **Sentry** pour le tracking d'erreurs

### Sécurité

Vercel inclut automatiquement :
- ✅ HTTPS/SSL
- ✅ Protection DDoS
- ✅ Edge Network mondial
- ✅ Headers de sécurité

### Performance

- ✅ CDN Edge automatique
- ✅ Compression Brotli
- ✅ Image Optimization
- ✅ Caching intelligent

## 9. Checklist Pré-Lancement

- [ ] Vercel Postgres configuré et migré
- [ ] Vercel Blob Storage créé
- [ ] Toutes les variables d'env configurées
- [ ] Resend configuré et domaine vérifié
- [ ] Webhooks Stripe configurés et testés
- [ ] Tests de paiement en mode production
- [ ] Tests d'upload de fichiers
- [ ] SSL actif (automatique)
- [ ] Domaine configuré
- [ ] Analytics activés

## 10. Passage en Production

1. **Changez les clés Stripe de test en production**
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

2. **Testez les paiements** avec de petits montants

3. **Vérifiez les webhooks** Stripe en production

4. **Testez l'upload** de fichiers sur Vercel Blob

5. **Vérifiez les emails** Resend (avec votre domaine vérifié)

6. **Annoncez le lancement** ! 🚀

## 📊 Coûts Estimés

### Vercel
- **Hobby** : Gratuit (parfait pour commencer)
  - 100 GB bandwidth
  - 6000 minutes de build
  - 1 DB PostgreSQL (256 MB)
  - 10 GB Blob Storage
  
- **Pro** : 20$/mois (pour croissance)
  - 1 TB bandwidth
  - Illimité minutes build
  - Plus de ressources DB
  - 100 GB Blob Storage

### Resend
- **Gratuit** : 3000 emails/mois (100/jour)
- **Pro** : 20$/mois (50k emails)

### Stripe
- 2.9% + 0.30€ par transaction (standard EU)
- Pas de frais mensuels

**Total startup** : 0€/mois possible ! 💰

## Support

En cas de problème :
- **Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **Resend** : [resend.com/docs](https://resend.com/docs)
- **Stripe** : [stripe.com/docs](https://stripe.com/docs)

## Mises à jour

Pour déployer des mises à jour :

```bash
git add .
git commit -m "Update: description"
git push origin main
```

Vercel déploiera automatiquement en quelques secondes ! ⚡
