// Configuration pour l'envoi d'emails
export const emailConfig = {
  // Service d'email utilisé
  service: "Resend",

  // URL de l'application
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Instructions de configuration
  setupInstructions: {
    step1: "Créez un compte sur resend.com",
    step2: "Obtenez votre clé API (commence par 're_')",
    step3: "Ajoutez RESEND_API_KEY=re_votre_cle dans .env.local",
    step4: "Redémarrez votre serveur Next.js",
  },

  // Domaine d'envoi par défaut
  defaultFrom: "noreply@resend.dev",

  // Limite d'emails gratuits par mois
  freeLimit: "100 emails/mois",
};
