# Instructions pour corriger l'erreur de déploiement Vercel

## Problème
L'erreur `Property 'raw' does not exist on type 'SupabaseClient'` indique que le code essayait d'utiliser une méthode qui n'existe pas dans Supabase.

## Solution appliquée

### 1. Création d'une fonction SQL atomique
Une fonction PostgreSQL `increment_purchase_count` a été créée pour incrémenter le compteur d'achats de manière atomique et efficace.

**Fichiers modifiés :**
- `bdd.sql` - Fonction ajoutée dans la section FONCTIONS ET TRIGGERS
- `migrations/increment_purchase_count.sql` - Fichier de migration dédié

### 2. Mise à jour du webhook Stripe
Le code dans `src/app/api/webhooks/stripe/route.ts` a été mis à jour pour utiliser la fonction RPC au lieu de SELECT + UPDATE.

## Étapes pour déployer la correction

### A. Appliquer la fonction SQL à votre base de données Supabase

**Option 1 : Via l'interface Supabase (recommandé)**
1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez et exécutez le contenu de `migrations/increment_purchase_count.sql`

**Option 2 : Via la CLI Supabase**
```bash
supabase db push migrations/increment_purchase_count.sql
```

### B. Pousser le code corrigé sur GitHub
```bash
# Vérifier les modifications
git status

# Ajouter les fichiers modifiés
git add src/app/api/webhooks/stripe/route.ts
git add bdd.sql
git add migrations/increment_purchase_count.sql

# Créer un commit
git commit -m "fix: corrige l'erreur purchase_count avec fonction RPC"

# Pousser sur GitHub
git push origin main
```

### C. Redéployer sur Vercel
Vercel détectera automatiquement le push et redéploiera le site. Vous pouvez aussi forcer un redéploiement depuis le dashboard Vercel.

## Vérification

Après le déploiement, le build devrait réussir sans l'erreur TypeScript précédente.

## Avantages de la solution

- ✅ **Atomique** : Évite les race conditions lors de plusieurs achats simultanés
- ✅ **Performant** : Une seule requête au lieu de deux (SELECT + UPDATE)
- ✅ **Type-safe** : Compatible avec TypeScript et le client Supabase
- ✅ **Maintenable** : La logique métier est dans la base de données
