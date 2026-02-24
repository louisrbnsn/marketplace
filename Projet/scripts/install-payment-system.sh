#!/bin/bash

# Script d'installation automatique du système de paiement
# Exécutez ce script pour installer tous les composants nécessaires

set -e  # Arrête le script en cas d'erreur

echo "🚀 Installation du système de paiement marketplace..."
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Installation des dépendances npm
echo -e "${BLUE}📦 Étape 1/4 : Installation des dépendances Stripe...${NC}"
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
echo -e "${GREEN}✓ Dépendances installées${NC}"
echo ""

# 2. Vérification du fichier .env
echo -e "${BLUE}🔧 Étape 2/4 : Vérification de la configuration...${NC}"
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}⚠ Aucun fichier .env trouvé${NC}"
  echo "Création d'un fichier .env.local..."
  cat > .env.local << 'EOF'
# Stripe Configuration
# Récupérez vos clés sur https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Platform Configuration
PLATFORM_FEE_PERCENTAGE=20
EOF
  echo -e "${GREEN}✓ Fichier .env.local créé${NC}"
  echo -e "${YELLOW}⚠ IMPORTANT: Vous devez configurer vos clés Stripe dans .env.local${NC}"
else
  echo -e "${GREEN}✓ Fichier de configuration trouvé${NC}"
  
  # Vérifier si les clés Stripe sont présentes
  if ! grep -q "STRIPE_SECRET_KEY" .env* 2>/dev/null; then
    echo -e "${YELLOW}⚠ STRIPE_SECRET_KEY non trouvée dans les fichiers .env${NC}"
    echo "Ajoutez cette ligne à votre .env ou .env.local :"
    echo "STRIPE_SECRET_KEY=sk_test_your_key_here"
  fi
  
  if ! grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env* 2>/dev/null; then
    echo -e "${YELLOW}⚠ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY non trouvée${NC}"
    echo "Ajoutez cette ligne à votre .env ou .env.local :"
    echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here"
  fi
fi
echo ""

# 3. Application des migrations
echo -e "${BLUE}🗄️  Étape 3/4 : Préparation des migrations de base de données...${NC}"
if [ -f "migrations/add_payment_tables.sql" ]; then
  echo -e "${GREEN}✓ Script de migration trouvé${NC}"
  echo ""
  echo "Pour appliquer les migrations, exécutez l'une de ces commandes :"
  echo ""
  echo "  # Si vous utilisez Drizzle ORM :"
  echo -e "  ${BLUE}npm run db:push${NC}"
  echo ""
  echo "  # Ou manuellement avec PostgreSQL :"
  echo -e "  ${BLUE}psql -d votre_database < migrations/add_payment_tables.sql${NC}"
  echo ""
else
  echo -e "${RED}✗ Script de migration non trouvé${NC}"
fi

# 4. Instructions pour Stripe CLI
echo -e "${BLUE}🎧 Étape 4/4 : Configuration des webhooks Stripe${NC}"
echo ""
echo "Pour tester les webhooks en local :"
echo ""
echo "1. Installez Stripe CLI :"
echo -e "   ${BLUE}brew install stripe/stripe-cli/stripe${NC}  # macOS"
echo -e "   ${BLUE}scoop install stripe${NC}  # Windows"
echo ""
echo "2. Connectez-vous :"
echo -e "   ${BLUE}stripe login${NC}"
echo ""
echo "3. Démarrez le forwarding :"
echo -e "   ${BLUE}stripe listen --forward-to localhost:3000/api/webhooks/stripe${NC}"
echo ""
echo "4. Copiez le webhook secret affiché et ajoutez-le à .env.local"
echo ""

# Résumé
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Installation terminée !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📚 Documentation disponible :"
echo "   • Guide d'installation : docs/INSTALLATION_RAPIDE.md"
echo "   • Documentation technique : docs/PAYMENT_SYSTEM.md"
echo "   • Récapitulatif : SYSTEM_PAIEMENT_README.md"
echo ""
echo "🎯 Prochaines étapes :"
echo "   1. Configurez vos clés Stripe dans .env.local"
echo "   2. Appliquez les migrations de base de données"
echo "   3. Configurez les webhooks Stripe"
echo "   4. Testez avec les cartes de test Stripe"
echo ""
echo "💳 Cartes de test :"
echo "   • Paiement réussi : 4242 4242 4242 4242"
echo "   • Paiement refusé : 4000 0000 0000 9995"
echo ""
echo -e "${GREEN}Bon développement ! 🚀${NC}"
