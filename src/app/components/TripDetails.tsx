"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import AddPlaceModal from "./AddPlaceModal";
import PlaceActivities from "./PlaceActivities";
import TripStats from "./TripStats";
import TripParticipants from "./TripParticipants";
import ReceivedInvitations from "./ReceivedInvitations";
import InvitationManager from "./InvitationManager";
// import EmailConfigHelp from "./EmailConfigHelp";

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

export default function TripDetails({ trip, onBack }: TripDetailsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
          <span>Retour aux voyages</span>
        </button>
      </div>

      {/* Informations du voyage */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {trip.title}
            </h2>
            {trip.description && (
              <p className="text-gray-600 mb-4">{trip.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>
                📅 {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </span>
              <span>
                ⏱️ {calculateDuration(trip.start_date, trip.end_date)} jours
              </span>
              <span>💰 Budget: {trip.budget}€</span>
            </div>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium">
              {destinations.length} destinations
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques du voyage */}
      <TripStats tripId={trip.id} tripBudget={trip.budget} />

      {/* Participants du voyage */}
      <TripParticipants
        tripId={trip.id}
        tripName={trip.title}
        currentUserId={trip.user_id}
      />

      {/* Aide configuration emails */}
      {/* <EmailConfigHelp /> */}

      {/* Gestionnaire d'invitations */}
      <InvitationManager
        tripId={trip.id}
        tripName={trip.title}
        currentUserId={trip.user_id}
      />

      {/* Invitations reçues par l'utilisateur connecté */}
      <ReceivedInvitations currentUserId={trip.user_id} />

      {/* Liste des destinations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Destinations</h3>
          <button
            onClick={() => setIsAddPlaceModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-sm"
          >
            + Ajouter une destination
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            Erreur: {error}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🗺️</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune destination ajoutée
            </h4>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter vos premières destinations !
            </p>
            <button
              onClick={() => setIsAddPlaceModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
            >
              Ajouter ma première destination
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {destinations.map((destination) => (
              <div
                key={destination.id}
                className="border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {destination.name}
                    </h4>
                    {destination.description && (
                      <p className="text-gray-600 mb-3">
                        {destination.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📍 {destination.address}</span>
                      <span>💰 {destination.price}€</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {destination.price}€
                    </div>
                    <div className="text-sm text-gray-500">
                      {((destination.price / trip.budget) * 100).toFixed(1)}% du
                      budget
                    </div>
                  </div>
                </div>

                {/* Activités de cette destination */}
                <PlaceActivities
                  destinationId={destination.id}
                  destinationName={destination.name}
                />
              </div>
            ))}
          </div>
        )}
      </div>

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
