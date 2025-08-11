"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripName: string;
  onInvitationSent?: () => void;
}

export default function InviteFriendModal({
  isOpen,
  onClose,
  tripId,
  tripName,
}: InviteFriendModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Vérifier que l'utilisateur est connecté
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Vérifier que l'utilisateur est propriétaire du voyage
      const { data: participant } = await supabase
        .from("trip_participants")
        .select("*")
        .eq("trip_id", tripId)
        .eq("user_id", user.id)
        .eq("role", "owner")
        .single();

      if (!participant) {
        throw new Error(
          "Vous devez être propriétaire du voyage pour inviter des amis"
        );
      }

      // Créer l'invitation
      const { error: invitationError } = await supabase
        .from("trip_invitations")
        .insert([
          {
            trip_id: tripId,
            inviter_id: user.id,
            invitee_email: email.toLowerCase().trim(),
          },
        ]);

      if (invitationError) throw invitationError;

      setSuccess("Invitation envoyée avec succès !");
      setEmail("");

      // Appeler le callback si fourni
      // if (onInvitationSent) {
      //   onInvitationSent();
      // }

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Inviter un ami</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Invitez un ami à rejoindre votre voyage :
          </p>
          <p className="text-lg font-semibold text-orange-600">{tripName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email de votre ami *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="ami@exemple.com"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              {success}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Envoi..." : "Envoyer l'invitation"}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Comment ça marche :</strong> Votre ami recevra un email
                avec un lien pour rejoindre le voyage. Une fois accepté, il
                pourra voir tous les détails et contribuer à la planification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
