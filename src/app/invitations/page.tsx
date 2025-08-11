"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

interface Invitation {
  id: string;
  trip_id: string;
  inviter_id: string;
  invitee_email: string;
  status: string;
  created_at: string;
  trips: {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    budget: number;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export default function InvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthAndFetchInvitations();
  }, []);

  const checkAuthAndFetchInvitations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      await fetchInvitations(user.email!);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvitations = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from("trip_invitations")
        .select(
          `
          *,
          trips (
            name,
            description,
            start_date,
            end_date,
            budget
          ),
          profiles (
            first_name,
            last_name
          )
        `
        )
        .eq("invitee_email", userEmail.toLowerCase())
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleInvitationResponse = async (
    invitationId: string,
    response: "accepted" | "declined"
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // Mettre à jour le statut de l'invitation
      const { error: updateError } = await supabase
        .from("trip_invitations")
        .update({ status: response })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      if (response === "accepted") {
        // Récupérer les détails de l'invitation
        const invitation = invitations.find((inv) => inv.id === invitationId);
        if (invitation) {
          // Ajouter l'utilisateur comme participant
          const { error: participantError } = await supabase
            .from("trip_participants")
            .insert([
              {
                trip_id: invitation.trip_id,
                user_id: user.id,
                role: "participant",
              },
            ]);

          if (participantError) throw participantError;
        }
      }

      // Rafraîchir la liste des invitations
      await fetchInvitations(user.email!);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Retour au dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Mes invitations</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos invitations aux voyages
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {invitations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune invitation en attente
            </h3>
            <p className="text-gray-600">
              Vous n'avez pas d'invitations en attente pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {invitation.profiles.first_name
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {invitation.trips.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Invitation de {invitation.profiles.first_name}{" "}
                          {invitation.profiles.last_name}
                        </p>
                      </div>
                    </div>

                    {invitation.trips.description && (
                      <p className="text-gray-700 mb-3">
                        {invitation.trips.description}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Date de début :</span>
                        <br />
                        {formatDate(invitation.trips.start_date)}
                      </div>
                      <div>
                        <span className="font-medium">Date de fin :</span>
                        <br />
                        {formatDate(invitation.trips.end_date)}
                      </div>
                      <div>
                        <span className="font-medium">Budget :</span>
                        <br />
                        {invitation.trips.budget}€
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      Invitation reçue le {formatDate(invitation.created_at)}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() =>
                      handleInvitationResponse(invitation.id, "declined")
                    }
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    Décliner
                  </button>
                  <button
                    onClick={() =>
                      handleInvitationResponse(invitation.id, "accepted")
                    }
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
                  >
                    Accepter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
