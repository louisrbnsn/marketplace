#!/bin/bash

# Script de vérification de la configuration du système de paiement

echo "🔍 Vérification de la configuration du système de paiement..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Check environment variables
echo "📋 Vérification des variables d'environnement..."

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo -e "${RED}✗${NC} STRIPE_SECRET_KEY n'est pas définie"
  ((errors++))
else
  echo -e "${GREEN}✓${NC} STRIPE_SECRET_KEY est définie"
fi

if [ -z "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ]; then
  echo -e "${RED}✗${NC} NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY n'est pas définie"
  ((errors++))
else
  echo -e "${GREEN}✓${NC} NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est définie"
fi

if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
  echo -e "${YELLOW}⚠${NC} STRIPE_WEBHOOK_SECRET n'est pas définie (nécessaire pour la production)"
  ((warnings++))
else
  echo -e "${GREEN}✓${NC} STRIPE_WEBHOOK_SECRET est définie"
fi

if [ -z "$PLATFORM_FEE_PERCENTAGE" ]; then
  echo -e "${YELLOW}⚠${NC} PLATFORM_FEE_PERCENTAGE n'est pas définie (utilisation de la valeur par défaut: 20%)"
  ((warnings++))
else
  echo -e "${GREEN}✓${NC} PLATFORM_FEE_PERCENTAGE est définie ($PLATFORM_FEE_PERCENTAGE%)"
fi

echo ""
echo "📦 Vérification des dépendances npm..."

# Check if stripe packages are installed
if grep -q "@stripe/stripe-js" package.json; then
  echo -e "${GREEN}✓${NC} @stripe/stripe-js est installé"
else
  echo -e "${RED}✗${NC} @stripe/stripe-js n'est pas installé"
  echo "  Exécutez: npm install @stripe/stripe-js @stripe/react-stripe-js"
  ((errors++))
fi

if grep -q "@stripe/react-stripe-js" package.json; then
  echo -e "${GREEN}✓${NC} @stripe/react-stripe-js est installé"
else
  echo -e "${RED}✗${NC} @stripe/react-stripe-js n'est pas installé"
  echo "  Exécutez: npm install @stripe/stripe-js @stripe/react-stripe-js"
  ((errors++))
fi

if grep -q "stripe" package.json; then
  echo -e "${GREEN}✓${NC} stripe (Node.js) est installé"
else
  echo -e "${RED}✗${NC} stripe (Node.js) n'est pas installé"
  echo "  Exécutez: npm install stripe"
  ((errors++))
fi

echo ""
echo "🗄️  Vérification des tables de base de données..."

# Check if migration file exists
if [ -f "migrations/add_payment_tables.sql" ]; then
  echo -e "${GREEN}✓${NC} Fichier de migration trouvé"
  echo "  Pour appliquer la migration: psql -d votre_database < migrations/add_payment_tables.sql"
else
  echo -e "${YELLOW}⚠${NC} Fichier de migration non trouvé"
  ((warnings++))
fi

echo ""
echo "📁 Vérification des fichiers créés..."

files=(
  "src/lib/db/schema.ts"
  "src/app/api/payment-methods/route.ts"
  "src/app/api/payment-methods/[id]/route.ts"
  "src/app/api/payment-methods/[id]/default/route.ts"
  "src/app/api/payment-methods/setup-intent/route.ts"
  "src/app/api/seller/onboard/route.ts"
  "src/app/api/seller/status/route.ts"
  "src/app/api/seller/dashboard/route.ts"
  "src/app/api/seller/balance/route.ts"
  "src/app/api/checkout/route.ts"
  "src/app/api/webhooks/stripe/route.ts"
  "src/components/features/PaymentMethodManager.tsx"
  "src/components/features/SellerDashboard.tsx"
  "src/components/features/CheckoutForm.tsx"
  "docs/PAYMENT_SYSTEM.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (manquant)"
    ((errors++))
  fi
done

echo ""
echo "📊 Résumé:"
echo -e "  Erreurs: ${RED}$errors${NC}"
echo -e "  Avertissements: ${YELLOW}$warnings${NC}"
echo ""

if [ $errors -eq 0 ]; then
  echo -e "${GREEN}✓ Configuration validée avec succès!${NC}"
  echo ""
  echo "📝 Prochaines étapes:"
  echo "  1. Appliquez les migrations de base de données"
  echo "  2. Configurez votre webhook Stripe"
  echo "  3. Testez avec les cartes de test Stripe"
  echo "  4. Consultez docs/PAYMENT_SYSTEM.md pour plus de détails"
  exit 0
else
  echo -e "${RED}✗ Des erreurs ont été détectées. Veuillez les corriger avant de continuer.${NC}"
  exit 1
fi
