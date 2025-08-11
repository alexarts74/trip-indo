"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import CreateTripModal from "./CreateTripModal";
import { useRouter } from "next/navigation";
// import TestModal from "./TestModal";

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

interface TripListProps {
  onTripSelect: (trip: Trip) => void;
  onTripCreated: () => void;
}

// Composant de test simple

export default function TripList({
  onTripSelect,
  onTripCreated,
}: TripListProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTrips(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTripCreated = () => {
    fetchTrips();
    onTripCreated();
  };

  const openCreateTripPage = () => {
    router.push("/create-trip");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
        Erreur: {error}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌏</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun voyage créé
        </h3>
        <p className="text-gray-600 mb-6">
          Commencez par créer votre premier voyage !
        </p>
        <button
          onClick={openCreateTripPage}
          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 cursor-pointer"
        >
          Créer mon premier voyage
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Mes voyages</h3>
        <button
          onClick={openCreateTripPage}
          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-sm"
        >
          + Nouveau voyage
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map((trip) => (
          <div
            key={trip.id}
            onClick={() => onTripSelect(trip)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-orange-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✈️</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {calculateDuration(trip.start_date, trip.end_date)} jours
              </span>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {trip.title}
            </h4>

            {trip.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {trip.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="mr-2">📅</span>
                <span>
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">💰</span>
                <span>Budget: {trip.budget}€</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <span className="text-xs text-orange-600 font-medium">
                Cliquez pour voir les détails →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
