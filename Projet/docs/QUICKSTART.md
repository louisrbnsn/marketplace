# Guide de Démarrage Rapide

Bienvenue sur Creator Marketplace ! Ce guide vous aidera à démarrer rapidement.

## 🚀 Installation en 5 Minutes

### 1. Cloner et Installer

```bash
# Cloner le repository
git clone <votre-repo>
cd Projet

# Installer les dépendances
npm install
```

### 2. Configuration de Base

```bash
# Copier le fichier d'environnement
cp .env.example .env
```

Modifiez `.env` avec vos credentials minimaux :

```env
# Database (Vercel Postgres ou en local)
DATABASE_URL="postgresql://user:password@localhost:5432/marketplace"

# JWT Secret (générer une clé aléatoire)
JWT_SECRET="votre-secret-super-securise"

# Stripe (mode test)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Vercel Blob (pour stockage de fichiers)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Resend (pour emails)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialiser la Base de Données

```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:migrate
```

### 4. Lancer l'Application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur ! 🎉

## 📖 Premiers Pas

### Créer un Compte

1. Allez sur `/register`
2. Créez votre compte
3. Vérifiez votre email (en dev, le lien est dans la console)
4. Vous êtes automatiquement connecté !

### Créer une Boutique

1. Allez sur `/dashboard`
2. Cliquez sur "Créer ma boutique"
3. Remplissez les informations
4. Votre boutique est créée !

### Ajouter un Produit

1. Depuis le dashboard, cliquez sur "Nouveau produit"
2. Remplissez les détails du produit
3. Uploadez vos fichiers (image + fichier produit)
4. Cochez "Produit gratuit" si vous voulez un produit gratuit
5. Publiez !

## 🔧 Configuration Avancée

### Configuration Stripe

Pour tester les paiements :

1. Créez un compte sur [Stripe](https://stripe.com)
2. Récupérez vos clés de test
3. Activez Stripe Connect
4. Configurez les webhooks (voir [DEPLOYMENT.md](./DEPLOYMENT.md))

### Configuration Vercel Blob (Stockage)

#### En développement local

1. Installez Vercel CLI :
```bash
npm i -g vercel
```

2. Connectez-vous et liez votre projet :
```bash
vercel login
vercel link
```

3. Récupérez les variables d'environnement :
```bash
vercel env pull .env.local
```

4. Redémarrez :
```bash
npm run dev
```

### Configuration Resend (Emails)

1. Créez un compte sur [Resend](https://resend.com) (gratuit : 3000 emails/mois)
2. Générez une API Key
3. Ajoutez-la dans `.env` : `RESEND_API_KEY="re_..."`
4. Configurez l'email d'envoi : `RESEND_FROM_EMAIL="noreply@yourdomain.com"`

**Note** : En développement, les emails sont loggés dans la console si Resend n'est pas configuré.

## 🎯 Stack Complète Recommandée

Pour un déploiement en production simple et économique :

| Service | Utilité | Gratuit | Prix après |
|---------|---------|---------|------------|
| **Vercel** | Hébergement + BDD + Files | 10 GB storage, 100 GB bandwidth | 20$/mois (Pro) |
| **Resend** | Emails transactionnels | 3000/mois | 20$/mois |
| **Stripe** | Paiements | Oui | 2.9% + 0.30€/transaction |

**Total startup : 0€/mois** puis ~20-40$/mois selon usage 💰

Ou utilisez AWS S3 si vous préférez.

## 📚 Documentation Complète

- [README.md](../README.md) - Vue d'ensemble du projet
- [DATABASE.md](./docs/DATABASE.md) - Schéma de la base de données
- [API.md](./docs/API.md) - Documentation de l'API
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Guide de déploiement
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) - Guide de contribution

## 🐛 Problèmes Courants

### Erreur de connexion à la base de données

```bash
# Vérifiez que PostgreSQL est lancé
# Vérifiez la DATABASE_URL dans .env
```

### Erreur lors de l'upload de fichiers

```bash
# Vérifiez la configuration S3/R2
# Vérifiez les credentials dans .env
```

### Erreur Stripe

```bash
# Vérifiez vos clés API Stripe
# Assurez-vous d'utiliser les clés de test (sk_test_...)
```

## 🎯 Prochaines Étapes

1. ✅ Installer et configurer le projet
2. ✅ Créer un compte et une boutique
3. 📝 Ajouter vos premiers produits
4. 💳 Configurer Stripe Connect pour recevoir des paiements
5. 🚀 Déployer en production (voir [DEPLOYMENT.md](./docs/DEPLOYMENT.md))

## 💡 Astuces

- Utilisez `npm run db:studio` pour visualiser votre base de données
- Les clés Stripe de test commencent par `sk_test_` et `pk_test_`
- Pour tester les paiements, utilisez la carte `4242 4242 4242 4242`
- Consultez les logs Vercel pour débugger en production

## 🆘 Besoin d'Aide ?

- 📖 Consultez la [documentation complète](../README.md)
- 🐛 Ouvrez une [issue sur GitHub](https://github.com/...)
- 💬 Rejoignez notre [Discord](https://discord.gg/...)
- 📧 Email : support@votre-marketplace.com

Bon développement ! 🚀
