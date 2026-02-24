#!/bin/bash

# =============================================================================
# AIDE À LA MIGRATION SUPABASE
# =============================================================================
# Ce script t'aide à migrer vers Supabase
# =============================================================================

echo "🚀 MIGRATION VERS SUPABASE"
echo "=========================="
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "   Installe-le depuis : https://nodejs.org"
    exit 1
fi

echo "✅ Node.js installé"

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ npm installé"
echo ""

# Proposer de désinstaller les anciennes dépendances
echo "📦 ÉTAPE 1 : Nettoyage des dépendances"
echo "======================================"
read -p "Désinstaller les anciennes dépendances (Drizzle, bcrypt, JWT, S3) ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Désinstallation..."
    npm uninstall @neondatabase/serverless drizzle-orm drizzle-kit postgres bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken @types/js-cookie js-cookie @aws-sdk/client-s3 @aws-sdk/s3-request-presigner 2>/dev/null
    echo "✅ Anciennes dépendances supprimées"
else
    echo "⏭️  Ignoré"
fi

echo ""

# Proposer d'installer Supabase
echo "📦 ÉTAPE 2 : Installation de Supabase"
echo "======================================"
read -p "Installer @supabase/supabase-js et @supabase/ssr ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📥 Installation..."
    npm install @supabase/supabase-js @supabase/ssr
    echo "✅ Supabase installé"
else
    echo "⏭️  Ignoré"
fi

echo ""

# Vérifier si .env.local existe
echo "⚙️  ÉTAPE 3 : Configuration"
echo "======================================"
if [ -f ".env.local" ]; then
    echo "✅ .env.local existe déjà"
    echo ""
    echo "📝 Variables requises pour Supabase :"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "   Exemple : .env.supabase.example"
else
    echo "⚠️  .env.local n'existe pas"
    read -p "Créer .env.local depuis .env.supabase.example ? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f ".env.supabase.example" ]; then
            cp .env.supabase.example .env.local
            echo "✅ .env.local créé"
            echo "⚠️  N'oublie pas de remplir les valeurs Supabase !"
        else
            echo "❌ .env.supabase.example introuvable"
        fi
    fi
fi

echo ""

# Proposer de supprimer les anciens fichiers
echo "🗑️  ÉTAPE 4 : Nettoyage (optionnel)"
echo "======================================"
echo "⚠️  ATTENTION : Sauvegarde ton code avant de supprimer !"
echo ""
read -p "Supprimer les anciens fichiers (Drizzle, old auth) ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Suppression..."
    
    # Demander confirmation pour chaque dossier
    if [ -d "drizzle" ]; then
        rm -rf drizzle
        echo "   ✅ drizzle/ supprimé"
    fi
    
    if [ -f "drizzle.config.ts" ]; then
        rm drizzle.config.ts
        echo "   ✅ drizzle.config.ts supprimé"
    fi
    
    if [ -d "scripts" ]; then
        echo "   ⏭️  scripts/ conservé (peut contenir d'autres scripts)"
    fi
    
    echo "✅ Nettoyage terminé"
else
    echo "⏭️  Ignoré (recommandé pour le moment)"
fi

echo ""
echo "============================================"
echo "✅ MIGRATION PRÉPARÉE !"
echo "============================================"
echo ""
echo "📝 PROCHAINES ÉTAPES :"
echo ""
echo "1️⃣  Créer un projet Supabase :"
echo "   → https://supabase.com"
echo "   → Create New Project (gratuit)"
echo ""
echo "2️⃣  Exécuter le schéma SQL :"
echo "   → Supabase Dashboard > SQL Editor"
echo "   → Copie le contenu de supabase-schema.sql"
echo "   → Run"
echo ""
echo "3️⃣  Configurer .env.local :"
echo "   → Récupère les clés API dans Supabase Settings > API"
echo "   → NEXT_PUBLIC_SUPABASE_URL"
echo "   → NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   → SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "4️⃣  Adapter le code :"
echo "   → Lis SUPABASE_MIGRATION.md pour le guide complet"
echo "   → Remplace AuthContext par AuthContextSupabase"
echo "   → Adapte les routes API (voir exemples)"
echo ""
echo "5️⃣  Tester :"
echo "   → npm run dev"
echo "   → Teste inscription/connexion"
echo "   → Vérifie dans Supabase Dashboard"
echo ""
echo "📖 DOCUMENTATION COMPLÈTE :"
echo "   → SUPABASE_MIGRATION.md (guide détaillé)"
echo "   → MIGRATION_RECAP.md (checklist)"
echo ""
echo "🎉 Bonne migration !"
