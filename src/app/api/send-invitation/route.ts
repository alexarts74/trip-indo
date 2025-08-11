import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { tripName, inviterEmail, inviteeEmail, tripId } =
      await request.json();

    console.log("🔍 Données reçues:", {
      tripName,
      inviterEmail,
      inviteeEmail,
      tripId,
    });

    if (!tripName || !inviterEmail || !inviteeEmail || !tripId) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    console.log("📧 Envoi d'invitation:", {
      tripName,
      inviterEmail,
      inviteeEmail,
      tripId,
    });

    // Template d'email HTML professionnel
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation au voyage - ${tripName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .button.accept { background: #10b981; }
          .button.decline { background: #ef4444; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✈️ Invitation au voyage</h1>
            <h2>${tripName}</h2>
          </div>

          <div class="content">
            <p>Bonjour !</p>

            <p><strong>${inviterEmail}</strong> vous invite à rejoindre son voyage <strong>"${tripName}"</strong> sur Trip Indo !</p>

            <p>Cette invitation vous permettra de :</p>
            <ul>
              <li>Voir les détails du voyage</li>
              <li>Participer à la planification</li>
              <li>Voir les destinations et activités</li>
              <li>Partager vos idées avec l'équipe</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/dashboard" class="button accept">
                ✅ Accepter l'invitation
              </a>
            </div>

            <p><em>Note : Pour l'instant, les boutons redirigent vers le dashboard. Dans une version future, ils mettront à jour directement le statut de l'invitation.</em></p>

            <div class="footer">
              <p>Envoyé depuis Trip Indo</p>
              <p>Si vous avez des questions, contactez ${inviterEmail}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: "Trip Indo <onboarding@resend.dev>",
      to: [inviteeEmail],
      subject: `✈️ Invitation au voyage : ${tripName}`,
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Erreur Resend:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    console.log("✅ Email envoyé avec succès:", data);

    return NextResponse.json({
      success: true,
      message: "Email d'invitation envoyé avec succès",
      data,
    });
  } catch (error) {
    console.error("💥 Erreur API:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
