# ✅ Checklist d'Installation - Système de Paiement

Suivez cette checklist étape par étape pour installer et configurer le système de paiement.

## 📋 Phase 1 : Installation (15 minutes)

### 1.1 Dépendances NPM
- [ ] Exécuter : `npm install @stripe/stripe-js @stripe/react-stripe-js`
- [ ] Vérifier que les packages sont dans `package.json`
- [ ] Vérifier qu'il n'y a pas d'erreurs d'installation

### 1.2 Base de données
- [ ] Sauvegarder votre base de données actuelle
- [ ] Exécuter la migration : `npm run db:push` ou `psql -d db < migrations/add_payment_tables.sql`
- [ ] Vérifier que les tables `payment_methods` et `payouts` sont créées
- [ ] Vérifier que les index sont créés

### 1.3 Variables d'environnement
- [ ] Copier `.env.example.payment` vers `.env.local`
- [ ] Remplacer `STRIPE_SECRET_KEY` avec votre clé Stripe
- [ ] Remplacer `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` avec votre clé publique
- [ ] Configurer `PLATFORM_FEE_PERCENTAGE` (20 par défaut)
- [ ] Redémarrer le serveur de développement

## 📋 Phase 2 : Configuration Stripe (20 minutes)

### 2.1 Compte Stripe
- [ ] Créer un compte sur [stripe.com](https://stripe.com) si pas déjà fait
- [ ] Activer le mode Test
- [ ] Noter votre URL de webhook : `https://votre-domaine.com/api/webhooks/stripe`

### 2.2 Clés API
- [ ] Aller sur [Dashboard > Developers > API keys](https://dashboard.stripe.com/apikeys)
- [ ] Copier la "Publishable key" (commence par `pk_test_`)
- [ ] Copier la "Secret key" (commence par `sk_test_`)
- [ ] Ajouter les clés dans `.env.local`

### 2.3 Stripe Connect
- [ ] Aller sur [Dashboard > Settings > Connect](https://dashboard.stripe.com/settings/connect)
- [ ] Activer Stripe Connect si pas déjà fait
- [ ] Configurer les paramètres de l'application Express
- [ ] Noter vos URLs de redirection

### 2.4 Webhook (Développement Local)
- [ ] Installer Stripe CLI : `brew install stripe/stripe-cli/stripe` (macOS)
- [ ] Se connecter : `stripe login`
- [ ] Lancer : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Copier le webhook secret affiché (commence par `whsec_`)
- [ ] Ajouter `STRIPE_WEBHOOK_SECRET` dans `.env.local`
- [ ] Garder la commande qui tourne pendant le développement

### 2.5 Webhook (Production)
- [ ] Aller sur [Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
- [ ] Cliquer sur "Add endpoint"
- [ ] Entrer l'URL : `https://votre-domaine.com/api/webhooks/stripe`
- [ ] Sélectionner les événements :
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `charge.refunded`
  - [ ] `account.updated`
  - [ ] `payment_method.attached`
  - [ ] `payment_method.detached`
- [ ] Copier le "Signing secret"
- [ ] Ajouter dans `.env` de production

## 📋 Phase 3 : Tests (30 minutes)

### 3.1 Test des cartes bancaires (Acheteur)
- [ ] Aller sur `/dashboard/payment-settings`
- [ ] Cliquer sur "Ajouter une carte"
- [ ] Utiliser la carte test : `4242 4242 4242 4242`
  - [ ] Date : Choisir une date future (ex: 12/25)
  - [ ] CVC : Entrer 123
  - [ ] Code postal : Entrer 12345
- [ ] Vérifier que la carte est ajoutée
- [ ] Vérifier qu'elle est marquée "Par défaut"
- [ ] Ajouter une deuxième carte
- [ ] Changer la carte par défaut
- [ ] Supprimer une carte
- [ ] Vérifier dans la console du navigateur qu'il n'y a pas d'erreurs

### 3.2 Test de l'onboarding vendeur
- [ ] Aller sur `/dashboard/seller-payments`
- [ ] Cliquer sur "Configurer les paiements"
- [ ] Compléter le formulaire Stripe Connect (utiliser des données de test)
  - [ ] Type d'entreprise : Individual
  - [ ] Prénom/Nom : Test User
  - [ ] Date de naissance : 01/01/1990
  - [ ] IBAN : Utiliser un IBAN de test
- [ ] Vérifier que le statut devient "Complété"
- [ ] Vérifier que "Paiements activés" est coché
- [ ] Vérifier que "Virements activés" est coché

### 3.3 Test du checkout
- [ ] Ajouter des produits au panier
- [ ] Aller sur la page de checkout
- [ ] Vérifier que vos cartes enregistrées s'affichent
- [ ] Sélectionner une carte enregistrée
- [ ] Effectuer un achat
- [ ] Vérifier la redirection après succès
- [ ] Vérifier que la commande est créée en base
- [ ] Vérifier dans les logs que le webhook est reçu

### 3.4 Test de la distribution au vendeur
- [ ] Dans les logs du webhook Stripe, vérifier :
  - [ ] `payment_intent.succeeded` reçu
  - [ ] Transfer créé pour le vendeur
  - [ ] `stripe_transfer_id` enregistré dans `order_items`
- [ ] Dans le dashboard vendeur :
  - [ ] Vérifier que "Gains totaux" a augmenté
  - [ ] Vérifier que "En attente" est correct
  - [ ] Vérifier le nombre de ventes

### 3.5 Test des webhooks
Dans le terminal où `stripe listen` tourne :
- [ ] Vérifier que les événements sont affichés
- [ ] Vérifier qu'il n'y a pas d'erreurs 400 ou 500
- [ ] Si erreurs, vérifier les logs de l'application

### 3.6 Tests négatifs
- [ ] Tester avec une carte refusée : `4000 0000 0000 9995`
- [ ] Vérifier que l'erreur est bien affichée
- [ ] Vérifier que la commande n'est pas créée
- [ ] Tester la suppression d'une carte utilisée
- [ ] Tester un checkout sans carte

## 📋 Phase 4 : Vérification (10 minutes)

### 4.1 Vérification des fichiers
- [ ] Exécuter : `./scripts/check-payment-setup.sh`
- [ ] Corriger les erreurs affichées
- [ ] Vérifier qu'il n'y a que des ✓ verts

### 4.2 Vérification de la base de données
```sql
-- Dans psql, vérifier :
SELECT COUNT(*) FROM payment_methods; -- Doit afficher les cartes test
SELECT COUNT(*) FROM orders; -- Doit afficher les commandes test
SELECT COUNT(*) FROM order_items; -- Doit afficher les items
SELECT COUNT(*) FROM payouts; -- Peut être vide pour l'instant
```
- [ ] Les requêtes fonctionnent sans erreur
- [ ] Les données sont présentes

### 4.3 Vérification Stripe Dashboard
- [ ] Aller sur [Dashboard > Payments](https://dashboard.stripe.com/test/payments)
- [ ] Vérifier que les paiements test sont affichés
- [ ] Vérifier le statut "Succeeded"
- [ ] Aller sur [Dashboard > Connect](https://dashboard.stripe.com/test/connect/accounts)
- [ ] Vérifier que le compte Connect test est listé
- [ ] Vérifier son statut

### 4.4 Vérification des logs
- [ ] Vérifier les logs de l'application (pas d'erreurs)
- [ ] Vérifier les logs Stripe CLI (événements reçus)
- [ ] Vérifier les logs du serveur Next.js

## 📋 Phase 5 : Documentation (5 minutes)

### 5.1 Lecture de la documentation
- [ ] Lire `SYSTEM_PAIEMENT_README.md`
- [ ] Lire `docs/INSTALLATION_RAPIDE.md`
- [ ] Parcourir `docs/PAYMENT_SYSTEM.md`

### 5.2 Compréhension du flux
- [ ] Comprendre le flux acheteur → paiement → vendeur
- [ ] Comprendre le calcul de commission
- [ ] Comprendre le rôle des webhooks
- [ ] Comprendre Stripe Connect

## 📋 Phase 6 : Préparation Production (Important !)

### 6.1 Basculement en mode Live
⚠️ **NE PAS FAIRE AVANT D'AVOIR TOUT TESTÉ EN MODE TEST**

- [ ] Aller sur Stripe Dashboard
- [ ] Basculer en mode "Live" (en haut à droite)
- [ ] Obtenir les nouvelles clés API live
- [ ] Créer un nouveau webhook en mode live
- [ ] Mettre à jour `.env` de production :
  - [ ] `STRIPE_SECRET_KEY=sk_live_...`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
  - [ ] `STRIPE_WEBHOOK_SECRET=whsec_...` (nouveau secret live)

### 6.2 Vérifications finales production
- [ ] Tester avec une vraie carte (petit montant)
- [ ] Vérifier que le paiement fonctionne
- [ ] Vérifier que le webhook est reçu
- [ ] Vérifier que la distribution aux vendeurs fonctionne
- [ ] Faire un remboursement test
- [ ] Vérifier les emails de confirmation Stripe

### 6.3 Sécurité production
- [ ] Vérifier que les clés ne sont pas commitées dans Git
- [ ] Vérifier que `.env` est dans `.gitignore`
- [ ] Configurer HTTPS (obligatoire pour webhooks)
- [ ] Configurer les variables d'environnement sur votre hébergeur
- [ ] Activer le monitoring des erreurs
- [ ] Configurer les alertes Stripe

### 6.4 Conformité légale
- [ ] Mettre à jour les CGV (conditions de vente)
- [ ] Mettre à jour les mentions légales
- [ ] Ajouter les mentions obligatoires sur les paiements
- [ ] Vérifier la conformité RGPD
- [ ] Informer les utilisateurs du traitement de paiement par Stripe

## 🎉 Félicitations !

Si toutes les cases sont cochées, votre système de paiement est prêt !

### 📞 Support

En cas de problème :
1. Consultez les logs de l'application
2. Consultez les logs Stripe Dashboard
3. Vérifiez la documentation Stripe
4. Consultez `docs/PAYMENT_SYSTEM.md` section "Dépannage"

### 🔄 Maintenance continue

- [ ] Surveiller les webhooks Stripe (pas d'erreurs)
- [ ] Surveiller les paiements échoués
- [ ] Surveiller les onboardings vendeurs incomplets
- [ ] Faire des tests réguliers
- [ ] Tenir à jour la documentation Stripe

---

**Important** : Gardez cette checklist pour référence future et pour former de nouveaux développeurs !
