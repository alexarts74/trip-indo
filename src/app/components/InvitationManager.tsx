"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface InvitationManagerProps {
  tripId: string;
  tripName: string;
  currentUserId: string;
}

export default function InvitationManager({
  tripId,
  tripName,
  currentUserId,
}: InvitationManagerProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const sendInvitation = async () => {
    if (!email.trim()) {
      setError("Veuillez saisir un email");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("📧 Envoi d'invitation...");

      // 1. Créer l'invitation dans Supabase
      const { data: invitationData, error: invitationError } = await supabase
        .from("trip_invitations")
        .insert({
          trip_id: tripId,
          inviter_id: currentUserId,
          invitee_email: email.toLowerCase().trim(),
          status: "pending",
        })
        .select()
        .single();

      if (invitationError) {
        console.error("❌ Erreur création invitation:", invitationError);
        throw invitationError;
      }

      console.log("✅ Invitation créée avec succès !");

      // 2. Envoyer l'email d'invitation
      console.log("📧 Envoi de l'email d'invitation...");

      try {
        const { data: userData } = await supabase.auth.getUser();
        const inviterEmail = userData.user?.email || "inviteur@exemple.com";

        const emailResponse = await fetch("/api/send-invitation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tripName,
            inviterEmail,
            inviteeEmail: email.toLowerCase().trim(),
            tripId,
          }),
        });

        const emailResult = await emailResponse.json();
        console.log("📧 Réponse API email:", emailResult);

        if (!emailResponse.ok) {
          const errorMessage =
            emailResult.error || "Erreur lors de l'envoi de l'email";

          // Message d'erreur spécial pour la configuration email
          if (emailResponse.status === 403 && emailResult.details) {
            throw new Error(
              `Configuration email requise : ${emailResult.details}`
            );
          }

          throw new Error(errorMessage);
        }

        console.log("✅ Email envoyé avec succès !");
        setSuccess(
          `Invitation envoyée à ${email} ! Email d'invitation envoyé.`
        );
      } catch (emailError: any) {
        console.error("❌ Erreur envoi email:", emailError);
        setSuccess(`Invitation créée mais erreur email: ${emailError.message}`);
      }

      setEmail("");
    } catch (error: any) {
      console.error("💥 Erreur envoi invitation:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ✉️ Inviter quelqu'un
        </h3>
        <div className="text-sm text-gray-500">Voyage : {tripName}</div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email de l'invité
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ami@exemple.com"
            className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={sendInvitation}
          disabled={isLoading || !email.trim()}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Envoi en cours..." : "Envoyer l'invitation"}
        </button>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>💡 Note importante :</strong> Pour envoyer des invitations par
          email, vous devez configurer Resend. Actuellement, vous ne pouvez
          envoyer qu'à votre propre adresse. Consultez le fichier{" "}
          <code className="bg-blue-100 px-1 rounded">
            src/config/email-setup.md
          </code>{" "}
          pour la configuration.
        </p>
      </div>
    </div>
  );
}
