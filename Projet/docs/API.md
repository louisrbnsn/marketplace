# Documentation API

Cette documentation décrit toutes les routes API disponibles dans le marketplace.

## Authentification

Toutes les routes protégées nécessitent un cookie `token` contenant un JWT valide.

### POST /api/auth/register

Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "buyer",
      "avatar": null,
      "isEmailVerified": false
    }
  },
  "message": "Compte créé avec succès"
}
```

### POST /api/auth/login

Se connecter avec email et mot de passe.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "seller",
      "avatar": null,
      "isEmailVerified": true
    }
  },
  "message": "Connexion réussie"
}
```

### POST /api/auth/logout

Se déconnecter (supprime le cookie).

**Response:**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

### GET /api/auth/me

Récupérer les informations de l'utilisateur connecté.

**Headers:** Cookie avec token JWT

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "seller",
      "avatar": null,
      "store": {...},
      "subscription": {...}
    }
  }
}
```

## Stores

### GET /api/stores

Récupérer la liste des boutiques.

**Query Params:**
- `page` (number, default: 1)
- `pageSize` (number, default: 12)
- `search` (string, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "stores": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 12,
      "totalPages": 9
    }
  }
}
```

### POST /api/stores

Créer une nouvelle boutique (nécessite authentification).

**Headers:** Cookie avec token JWT

**Body:**
```json
{
  "name": "Ma Boutique",
  "slug": "ma-boutique",
  "description": "Description de ma boutique",
  "logo": "https://...",
  "banner": "https://...",
  "socialLinks": {
    "twitter": "https://twitter.com/...",
    "instagram": "https://instagram.com/..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "store": {...}
  },
  "message": "Boutique créée avec succès"
}
```

### GET /api/stores/[slug]

Récupérer les détails d'une boutique par son slug.

**Response:**
```json
{
  "success": true,
  "data": {
    "store": {
      "id": "uuid",
      "name": "Ma Boutique",
      "slug": "ma-boutique",
      "description": "...",
      "products": [...],
      "user": {...}
    }
  }
}
```

## Products

### GET /api/products

Récupérer la liste des produits avec filtres.

**Query Params:**
- `page` (number, default: 1)
- `pageSize` (number, default: 12)
- `category` (string, optional)
- `search` (string, optional)
- `minPrice` (number, optional)
- `maxPrice` (number, optional)
- `sortBy` (string: 'recent' | 'price-asc' | 'price-desc' | 'rating' | 'popular')
- `featured` (boolean, optional)
- `premiumOnly` (boolean, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "total": 500,
      "page": 1,
      "pageSize": 12,
      "totalPages": 42
    }
  }
}
```

### POST /api/products

Créer un nouveau produit (nécessite authentification et boutique).

**Headers:** Cookie avec token JWT

**Body:**
```json
{
  "title": "Mon Super LUT Pack",
  "description": "Description complète du produit...",
  "shortDescription": "Description courte",
  "price": 2999,
  "category": "lut",
  "isPremiumOnly": false,
  "tags": ["cinematic", "moody", "vintage"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {...}
  },
  "message": "Produit créé avec succès"
}
```

### GET /api/products/[id]

Récupérer les détails d'un produit.

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "title": "...",
      "description": "...",
      "price": 2999,
      "store": {...},
      "user": {...},
      "reviews": [...]
    }
  }
}
```

### PATCH /api/products/[id]

Mettre à jour un produit (nécessite être le propriétaire ou admin).

**Headers:** Cookie avec token JWT

**Body:** (tous les champs sont optionnels)
```json
{
  "title": "Nouveau titre",
  "price": 3999,
  "description": "Nouvelle description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {...}
  },
  "message": "Produit mis à jour avec succès"
}
```

### DELETE /api/products/[id]

Supprimer un produit (nécessite être le propriétaire ou admin).

**Headers:** Cookie avec token JWT

**Response:**
```json
{
  "success": true,
  "message": "Produit supprimé avec succès"
}
```

## Upload

### POST /api/upload

Générer une URL présignée pour uploader un fichier.

**Headers:** Cookie avec token JWT

**Body:**
```json
{
  "fileName": "mon-fichier.cube",
  "fileSize": 1024000,
  "fileType": "application/octet-stream",
  "category": "lut",
  "productId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://...",
    "fileKey": "products/user-id/product-id/..."
  }
}
```

## Codes d'Erreur

- `400` - Bad Request (données invalides)
- `401` - Unauthorized (authentification requise)
- `403` - Forbidden (permissions insuffisantes)
- `404` - Not Found (ressource non trouvée)
- `500` - Internal Server Error (erreur serveur)

## Format des Réponses

Toutes les réponses suivent ce format :

**Succès:**
```json
{
  "success": true,
  "data": {...},
  "message": "Message optionnel"
}
```

**Erreur:**
```json
{
  "success": false,
  "error": "Message d'erreur"
}
```

## Rate Limiting

Les API sont limitées à :
- 100 requêtes par 15 minutes par IP pour les routes publiques
- 1000 requêtes par 15 minutes pour les utilisateurs authentifiés

## Webhooks

### POST /api/webhooks/stripe

Endpoint pour recevoir les événements Stripe (webhooks).

**Headers:**
- `stripe-signature`: Signature de vérification Stripe

**Body:** Event object from Stripe

Les événements gérés :
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `account.updated` (Connect)
- `transfer.created`

## Authentification par Token

Le JWT doit être envoyé via un cookie nommé `token`. Il contient :

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "seller"
}
```

Le token expire après 7 jours par défaut (configurable via `JWT_EXPIRES_IN`).
