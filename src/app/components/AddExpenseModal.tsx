"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface TripParticipant {
  user_id: string;
  role: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onExpenseAdded: () => void;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  tripId,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Transport",
    date: new Date().toISOString().split("T")[0],
    paidBy: "", // ID de l'utilisateur qui paie
    paidFor: "everyone", // "everyone", ou "specific"
    specificUserId: "", // ID de l'utilisateur pour qui
  });

  // Catégories en dur dans le front
  const categories = [
    { id: "transport", name: "Transport", icon: "🚗" },
    { id: "nourriture", name: "Nourriture", icon: "🍽️" },
    { id: "shopping", name: "Shopping", icon: "🛍️" },
    { id: "activites", name: "Activités", icon: "🎯" },
    { id: "hebergement", name: "Hébergement", icon: "🏨" },
    { id: "autres", name: "Autres", icon: "📝" },
  ];

  const [tripParticipants, setTripParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchTripParticipants();
    }
  }, [isOpen]);

  const fetchTripParticipants = async () => {
    try {
      console.log("tripId", tripId);

      // Test simple de la table
      const { data: allParticipants, error: allError } = await supabase
        .from("trip_participants")
        .select("*")
        .limit(5);

      console.log("Tous les participants (5 premiers):", allParticipants);
      console.log("Erreur tous participants:", allError);

      // Récupérer les participants du voyage
      const { data: participants, error } = await supabase
        .from("trip_participants")
        .select("user_id")
        .eq("trip_id", tripId);

      console.log("participants pour ce voyage:", participants);
      console.log("erreur:", error);

      if (error || !participants) {
        console.error("Erreur récupération participants:", error);
        return;
      }

      // Créer une liste simple avec les IDs
      const simpleParticipants = participants.map((participant) => ({
        user_id: participant.user_id,
        display_name: `Utilisateur ${participant.user_id.slice(0, 8)}...`,
      }));

      console.log("participants transformés:", simpleParticipants);
      setTripParticipants(simpleParticipants);

      // Définir l'utilisateur connecté comme payeur par défaut
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && !formData.paidBy) {
        setFormData((prev) => ({
          ...prev,
          paidBy: user.id,
        }));
      }
    } catch (error) {
      console.error("Erreur récupération participants:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.paidBy) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Déterminer paid_for_user_id
      let paidForUserId = null;
      if (formData.paidFor === "specific" && formData.specificUserId) {
        paidForUserId = formData.specificUserId;
      }
      // Si "everyone", paidForUserId reste null

      // Créer la dépense avec la structure exacte de la DB
      const { error: expenseError } = await supabase.from("expenses").insert({
        trip_id: tripId,
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        paid_by_user_id: formData.paidBy,
        paid_for_user_id: paidForUserId,
      });

      if (expenseError) throw expenseError;

      onExpenseAdded();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Erreur création dépense:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setFormData({
      title: "",
      amount: "",
      category: "Transport",
      date: new Date().toISOString().split("T")[0],
      paidBy: user?.id || "",
      paidFor: "everyone",
      specificUserId: "",
    });
    setError("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getDisplayName = (participant: any) => {
    return participant.display_name || "Utilisateur inconnu";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Ajouter une dépense
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
                Titre *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: Taxi vers l'aéroport"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payé par *
              </label>
              <select
                name="paidBy"
                value={formData.paidBy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="">Sélectionner qui paie</option>
                {tripParticipants.map((participant) => (
                  <option key={participant.user_id} value={participant.user_id}>
                    {getDisplayName(participant)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payé pour
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paidFor"
                    value="everyone"
                    checked={formData.paidFor === "everyone"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Tout le monde</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paidFor"
                    value="specific"
                    checked={formData.paidFor === "specific"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Un participant spécifique
                  </span>
                </label>
              </div>
            </div>

            {formData.paidFor === "specific" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participant
                </label>
                <select
                  name="specificUserId"
                  value={formData.specificUserId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  <option value="">Sélectionner un participant</option>
                  {tripParticipants.map((participant) => (
                    <option
                      key={participant.user_id}
                      value={participant.user_id}
                    >
                      {getDisplayName(participant)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
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
                disabled={
                  isLoading ||
                  !formData.title ||
                  !formData.amount ||
                  !formData.paidBy ||
                  (formData.paidFor === "specific" && !formData.specificUserId)
                }
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
