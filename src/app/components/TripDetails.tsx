"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import AddPlaceModal from "./AddPlaceModal";
import PlaceActivities from "./PlaceActivities";
import TripStats from "./TripStats";
import TripParticipants from "./TripParticipants";
import ReceivedInvitations from "./ReceivedInvitations";
import InvitationManager from "./InvitationManager";
import ExpenseManager from "./ExpenseManager";

interface Destination {
  id: string;
  name: string;
  description: string;
  address: string;
  price: number;
  created_at: string;
}

interface Trip {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  user_id: string;
  created_at: string;
}

interface TripDetailsProps {
  trip: Trip;
  onBack: () => void;
}

type TabType =
  | "overview"
  | "destinations"
  | "expenses"
  | "participants"
  | "invitations";

export default function TripDetails({ trip, onBack }: TripDetailsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false);
  const [deletingDestinationId, setDeletingDestinationId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    fetchDestinations();
  }, [trip.id]);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("trip_id", trip.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setDestinations(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePlaceAdded = () => {
    fetchDestinations();
  };

  const handleDeleteDestination = async (destinationId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cette destination ? Toutes les activités associées seront également supprimées."
      )
    ) {
      return;
    }

    setDeletingDestinationId(destinationId);
    try {
      // Supprimer d'abord toutes les activités de cette destination
      const { error: activitiesError } = await supabase
        .from("activities")
        .delete()
        .eq("destination_id", destinationId);

      if (activitiesError) throw activitiesError;

      // Puis supprimer la destination
      const { error: destinationError } = await supabase
        .from("destinations")
        .delete()
        .eq("id", destinationId);

      if (destinationError) throw destinationError;

      // Mettre à jour la liste locale
      setDestinations(destinations.filter((dest) => dest.id !== destinationId));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDeletingDestinationId(null);
    }
  };

  const tabs = [
    {
      id: "overview" as TabType,
      name: "Vue d'ensemble",
      icon: "📊",
      description: "Statistiques et informations générales",
    },
    {
      id: "destinations" as TabType,
      name: "Destinations",
      icon: "🗺️",
      description: "Gérer les lieux et activités",
    },
    {
      id: "expenses" as TabType,
      name: "Dépenses",
      icon: "💰",
      description: "Gérer les dépenses et remboursements",
    },
    {
      id: "participants" as TabType,
      name: "Participants",
      icon: "👥",
      description: "Gérer l'équipe du voyage",
    },
    {
      id: "invitations" as TabType,
      name: "Invitations",
      icon: "✉️",
      description: "Inviter des amis et gérer les demandes",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Informations du voyage */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {trip.title}
                  </h2>
                  {trip.description && (
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                      {trip.description}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center">
                      📅 {formatDate(trip.start_date)} -{" "}
                      {formatDate(trip.end_date)}
                    </span>
                    <span className="flex items-center">
                      ⏱️ {calculateDuration(trip.start_date, trip.end_date)}{" "}
                      jours
                    </span>
                    <span className="flex items-center">
                      💰 Budget: {trip.budget}€
                    </span>
                  </div>
                </div>
                <div className="lg:ml-4 lg:mt-0">
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base text-center">
                    {destinations.length} destination
                    {destinations.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques du voyage */}
            <TripStats tripId={trip.id} tripBudget={trip.budget} />
          </div>
        );

      case "destinations":
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* En-tête des destinations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Destinations du voyage
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Gérez vos lieux de visite et leurs activités
                  </p>
                </div>
                <button
                  onClick={() => setIsAddPlaceModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                >
                  + Ajouter une destination
                </button>
              </div>
            </div>

            {/* Liste des destinations */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                Erreur: {error}
              </div>
            ) : destinations.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <div className="text-4xl sm:text-6xl mb-4">🗺️</div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Aucune destination ajoutée
                </h4>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Commencez par ajouter vos premières destinations !
                </p>
                <button
                  onClick={() => setIsAddPlaceModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                >
                  Ajouter ma première destination
                </button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {destinations.map((destination) => (
                  <div
                    key={destination.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                          {destination.name}
                        </h4>
                        {destination.description && (
                          <p className="text-gray-600 mb-3 text-sm sm:text-base">
                            {destination.description}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center">
                            📍 {destination.address}
                          </span>
                          <span className="flex items-center">
                            💰 {destination.price}€
                          </span>
                        </div>
                      </div>
                      <div className="sm:ml-4 sm:text-right flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="text-lg font-bold text-gray-900">
                          {destination.price}€
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {((destination.price / trip.budget) * 100).toFixed(1)}
                          % du budget
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteDestination(destination.id)
                          }
                          disabled={deletingDestinationId === destination.id}
                          className="text-red-600 hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50 disabled:opacity-50 self-end sm:self-auto"
                          title="Supprimer cette destination"
                        >
                          {deletingDestinationId === destination.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Activités de cette destination */}
                    <div className="mt-4 sm:mt-6">
                      <PlaceActivities
                        destinationId={destination.id}
                        destinationName={destination.name}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "expenses":
        return <ExpenseManager tripId={trip.id} tripName={trip.title} />;

      case "participants":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Participants du voyage
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Gérez votre équipe de voyageurs
              </p>
              <TripParticipants
                tripId={trip.id}
                tripName={trip.title}
                currentUserId={trip.user_id}
              />
            </div>
          </div>
        );

      case "invitations":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Gestion des invitations
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Invitez des amis et gérez les demandes d'invitation
              </p>

              {/* Gestionnaire d'invitations */}
              <InvitationManager
                tripId={trip.id}
                tripName={trip.title}
                currentUserId={trip.user_id}
              />

              {/* Invitations reçues par l'utilisateur connecté */}
              <div className="mt-6 sm:mt-8">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Invitations reçues
                </h4>
                <ReceivedInvitations currentUserId={trip.user_id} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Retour aux voyages</span>
          <span className="sm:hidden">Retour</span>
        </button>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
        <nav
          className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="font-medium text-center">{tab.name}</span>
                <span className="text-xs opacity-75 hidden lg:block text-center">
                  {tab.description}
                </span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de l'onglet actif */}
      {renderTabContent()}

      {/* Modal d'ajout de destination */}
      <AddPlaceModal
        isOpen={isAddPlaceModalOpen}
        onClose={() => setIsAddPlaceModalOpen(false)}
        tripId={trip.id}
        onPlaceAdded={handlePlaceAdded}
      />
    </div>
  );
}
