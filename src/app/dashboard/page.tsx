"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import TripList from "../components/TripList";
import TripDetails from "../components/TripDetails";
import SentInvitations from "../components/SentInvitations";
import { syncUserParticipants } from "../lib/participantSync";

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

export default function Dashboard() {
  const router = useRouter();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Vérifier la session au chargement
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // Synchroniser les participants si l'utilisateur a un email
      if (session.user.email) {
        await syncUserParticipants(session.user.email, session.user.id);
      }

      setIsLoading(false);
    };

    checkSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      } else {
        setUser(session.user);

        // Synchroniser les participants lors de la connexion
        if (event === "SIGNED_IN" && session.user.email) {
          await syncUserParticipants(session.user.email, session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    console.log("isLoading", isLoading);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Chargement de votre espace voyage...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleTripCreated = () => {
    // Le voyage a été créé, on peut rafraîchir la liste si nécessaire
    // Cette fonction sera utilisée pour rafraîchir la liste des voyages
  };

  const handleBackToTrips = () => {
    setSelectedTrip(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm sm:text-lg">🌏</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Trip Indo
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Organisez vos voyages en Indonésie
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="text-center sm:text-right">
                <span className="text-xs sm:text-sm text-gray-600">
                  Bonjour, {user.email}
                </span>
                <div className="text-xs text-gray-500">
                  {selectedTrip
                    ? `Voyage: ${selectedTrip.title}`
                    : "Sélectionnez un voyage"}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push("/invitations")}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Invitations</span>
                  <span className="sm:hidden">Inv.</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Se déconnecter</span>
                  <span className="sm:hidden">Déco.</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Indicateur de navigation */}
        <div className="mb-4 sm:mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className={`text-xs sm:text-sm font-medium transition-colors ${
                    !selectedTrip
                      ? "text-orange-600 cursor-default"
                      : "text-gray-500 hover:text-gray-700 cursor-pointer"
                  }`}
                >
                  Mes Voyages
                </button>
              </li>
              {selectedTrip && (
                <>
                  <li>
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </li>
                  <li>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-xs">
                      {selectedTrip.title}
                    </span>
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>

        {/* Contenu principal */}
        {selectedTrip ? (
          <TripDetails trip={selectedTrip} onBack={handleBackToTrips} />
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Section des invitations envoyées */}
            <SentInvitations currentUserId={user.id} />

            {/* Liste des voyages */}
            <TripList
              onTripSelect={handleTripSelect}
              onTripCreated={handleTripCreated}
            />
          </div>
        )}
      </div>
    </div>
  );
}
