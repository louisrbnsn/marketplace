# Guide de Contribution

Merci de votre intérêt pour contribuer au Creator Marketplace ! Ce guide vous aidera à démarrer.

## Code de Conduite

- Soyez respectueux et professionnel
- Accueillez les nouvelles idées
- Aidez les autres contributeurs
- Concentrez-vous sur ce qui est bon pour le projet

## Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Créez une issue avec :
   - Titre clair et descriptif
   - Description détaillée du problème
   - Steps pour reproduire
   - Comportement attendu vs actuel
   - Screenshots si applicable
   - Informations d'environnement

### Suggérer une Fonctionnalité

1. Vérifiez que la fonctionnalité n'existe pas déjà
2. Créez une issue avec :
   - Titre clair
   - Description détaillée de la fonctionnalité
   - Cas d'utilisation
   - Bénéfices attendus

### Soumettre une Pull Request

1. Fork le repository
2. Créez une branche depuis `main` :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. Faites vos modifications
4. Committez avec des messages clairs :
   ```bash
   git commit -m "feat: ajouter système de notifications"
   ```
5. Push vers votre fork
6. Ouvrez une Pull Request

## Convention de Commit

Utilisez les préfixes suivants :

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage (pas de changement de code)
- `refactor:` - Refactoring
- `test:` - Ajout de tests
- `chore:` - Maintenance

Exemples :
```
feat: ajouter système de notifications push
fix: corriger l'upload des fichiers zip
docs: mettre à jour le guide d'installation
```

## Standards de Code

### TypeScript

- Utilisez TypeScript strict
- Typez toutes les fonctions et variables
- Évitez `any` sauf si absolument nécessaire
- Utilisez des interfaces pour les objets complexes

### React/Next.js

- Utilisez des composants fonctionnels avec hooks
- Nommez les composants en PascalCase
- Utilisez `'use client'` uniquement quand nécessaire
- Préférez la composition à l'héritage

### Styling

- Utilisez TailwindCSS pour le styling
- Suivez le design system existant
- Utilisez les classes utilitaires plutôt que CSS custom

### API Routes

- Validez toutes les entrées avec Zod
- Gérez les erreurs de manière appropriée
- Retournez toujours le format standard de réponse
- Documentez les nouveaux endpoints dans `/docs/API.md`

## Tests

Avant de soumettre une PR :

1. Testez localement toutes vos modifications
2. Vérifiez qu'il n'y a pas d'erreurs TypeScript :
   ```bash
   npm run type-check
   ```
3. Vérifiez le linting :
   ```bash
   npm run lint
   ```

## Structure du Projet

```
src/
├── app/                    # Pages Next.js
│   ├── api/               # API routes
│   ├── (auth)/            # Pages d'authentification
│   └── dashboard/         # Dashboard pages
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   ├── layout/           # Layout components
│   └── features/         # Feature components
├── lib/                  # Librairies
│   ├── db/              # Database
│   ├── auth/            # Authentication
│   ├── stripe/          # Stripe integration
│   └── storage/         # File storage
├── types/               # TypeScript types
└── utils/               # Utilitaires
```

## Questions ?

Si vous avez des questions, n'hésitez pas à :
- Ouvrir une issue
- Rejoindre notre Discord
- Envoyer un email à dev@marketplace.com

## Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence que le projet.

Merci pour vos contributions ! 🎉
