# 📧 Configuration Email avec Resend

## 🚨 Problème actuel

Vous ne pouvez envoyer des emails qu'à votre propre adresse (`artusalexandre74@gmail.com`) car vous utilisez le domaine de test `onboarding@resend.dev`.

## 🔧 Solutions

### Option 1 : Vérifier votre domaine (Recommandé)

1. Allez sur [resend.com/domains](https://resend.com/domains)
2. Cliquez sur "Add Domain"
3. Entrez votre domaine (ex: `tripindo.com` ou votre domaine personnel)
4. Suivez les instructions de vérification DNS
5. Une fois vérifié, modifiez le code :

```typescript
// Dans src/app/api/send-invitation/route.ts
from: "Trip Indo <noreply@votre-domaine.com>";
```

### Option 2 : Utiliser une adresse Gmail vérifiée

1. Dans votre compte Resend, allez dans "Settings" > "Sending"
2. Ajoutez votre adresse Gmail personnelle
3. Vérifiez l'email reçu
4. Modifiez le code :

```typescript
// Dans src/app/api/send-invitation/route.ts
from: "Trip Indo <votre-email@gmail.com>";
```

### Option 3 : Utiliser le domaine de test (Limité)

Avec `onboarding@resend.dev`, vous ne pouvez envoyer qu'à l'email avec lequel vous vous êtes inscrit sur Resend.

## 📝 Variables d'environnement

Assurez-vous d'avoir dans votre `.env.local` :

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🧪 Test

Pour tester, utilisez d'abord votre propre email, puis une fois configuré, testez avec d'autres adresses.

## 📚 Documentation

- [Resend Domains](https://resend.com/docs/domains)
- [Resend Sending](https://resend.com/docs/send-with-api)
