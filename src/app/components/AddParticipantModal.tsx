"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onParticipantAdded: () => void;
}

export default function AddParticipantModal({
  isOpen,
  onClose,
  tripId,
  onParticipantAdded,
}: AddParticipantModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Veuillez entrer un email");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Ajouter directement l'email comme participant
      // Quand l'utilisateur se connectera, on pourra faire la correspondance
      const { error: participantError } = await supabase
        .from("trip_participants")
        .insert([
          {
            trip_id: tripId,
            email: email.toLowerCase().trim(), // Utiliser la colonne email
            role: "participant",
          },
        ]);

      if (participantError) throw participantError;

      setSuccess("Participant ajouté avec succès !");
      setEmail("");
      onParticipantAdded();

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (error: any) {
      console.error("Erreur ajout participant:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Ajouter un participant
            </h2>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du participant
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="exemple@email.com"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
