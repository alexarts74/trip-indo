"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import InviteFriendModal from "./InviteFriendModal";

interface Participant {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface Invitation {
  id: string;
  invitee_email: string;
  status: string;
  created_at: string;
}

interface TripParticipantsProps {
  tripId: string;
  tripName: string;
  currentUserId: string;
}

export default function TripParticipants({
  tripId,
  tripName,
  currentUserId,
}: TripParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchParticipants();
    fetchInvitations();
  }, [tripId]);

  const fetchParticipants = async () => {
    try {
      // D'abord récupérer les participants
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("trip_participants")
          .select("id, user_id, role, joined_at")
          .eq("trip_id", tripId)
          .order("joined_at", { ascending: true });

      if (participantsError) throw participantsError;

      // Ensuite récupérer les profils des utilisateurs
      const userIds = participantsData?.map((p) => p.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Combiner les données
      const combinedData =
        participantsData?.map((participant) => {
          const profile = profilesData?.find(
            (p) => p.id === participant.user_id
          );
          return {
            ...participant,
            profile: profile || null,
          };
        }) || [];

      setParticipants(combinedData);

      // Vérifier si l'utilisateur actuel est propriétaire
      const currentParticipant = combinedData?.find(
        (p) => p.user_id === currentUserId
      );
      setIsOwner(currentParticipant?.role === "owner");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvitations = async () => {
    // Ne charger les invitations que si l'utilisateur est propriétaire
    if (!isOwner) {
      setInvitations([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("trip_invitations")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des invitations:", error);
      setInvitations([]);
    }
  };

  const handleInvitationSent = () => {
    fetchInvitations();
  };

  const removeParticipant = async (
    participantId: string,
    participantUserId: string
  ) => {
    if (!isOwner || participantUserId === currentUserId) return;

    try {
      const { error } = await supabase
        .from("trip_participants")
        .delete()
        .eq("id", participantId);

      if (error) throw error;

      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
          <p className="text-sm text-gray-600">
            {participants.length} participant
            {participants.length > 1 ? "s" : ""}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-sm"
          >
            + Inviter un ami
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* Liste des participants */}
      <div className="space-y-3 mb-6">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {participant.profile?.first_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {participant.profile?.first_name}{" "}
                  {participant.profile?.last_name}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      participant.role === "owner"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {participant.role === "owner"
                      ? "Propriétaire"
                      : "Participant"}
                  </span>
                  <span>•</span>
                  <span>
                    Rejoint le{" "}
                    {new Date(participant.joined_at).toLocaleDateString(
                      "fr-FR"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {isOwner && participant.role !== "owner" && (
              <button
                onClick={() =>
                  removeParticipant(participant.id, participant.user_id)
                }
                className="text-red-500 hover:text-red-700 transition-colors p-1"
                title="Retirer le participant"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Invitations en attente */}
      {invitations.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Invitations en attente
          </h4>
          <div className="space-y-2">
            {invitations
              .filter((inv) => inv.status === "pending")
              .map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invitation.invitee_email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Invité le{" "}
                        {new Date(invitation.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                    En attente
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal d'invitation */}
      <InviteFriendModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        tripId={tripId}
        tripName={tripName}
        onInvitationSent={handleInvitationSent}
      />
    </div>
  );
}
