#!/bin/bash

# 🔍 Script de vérification de la configuration email

echo "🔍 Vérification de la configuration..."
echo ""

# Vérifier les variables d'environnement
echo "📋 Variables d'environnement :"
echo "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:-❌ Non défini}"
echo "NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-❌ Non défini}"
echo ""

# Vérifier que Supabase est accessible
echo "🌐 Test de connexion à Supabase..."
if curl -s "${NEXT_PUBLIC_SUPABASE_URL:-https://oiaptwflpeawayinvujn.supabase.co}/rest/v1/" > /dev/null 2>&1; then
    echo "✅ Supabase accessible"
else
    echo "❌ Impossible de joindre Supabase"
fi
echo ""

# Instructions
echo "📝 Prochaines étapes :"
echo ""
echo "1. Configurer les Redirect URLs dans Supabase :"
echo "   https://supabase.com/dashboard/project/oiaptwflpeawayinvujn/auth/url-configuration"
echo "   Ajouter : http://localhost:3000/**"
echo ""
echo "2. Vérifier les Email Templates :"
echo "   https://supabase.com/dashboard/project/oiaptwflpeawayinvujn/auth/templates"
echo ""
echo "3. Tester l'envoi d'email :"
echo "   - Démarrer le serveur : npm run dev"
echo "   - Aller sur : http://localhost:3000/forgot-password"
echo "   - Entrer un email existant"
echo "   - Vérifier votre boîte email (et spams !)"
echo ""
echo "4. Vérifier les logs Supabase :"
echo "   https://supabase.com/dashboard/project/oiaptwflpeawayinvujn/logs/edge-logs"
echo ""
echo "⚠️  IMPORTANT : Supabase limite à 4 emails/heure en développement"
echo ""
