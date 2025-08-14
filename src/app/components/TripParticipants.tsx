"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchParticipants();
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
      <div className="mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
          <p className="text-sm text-gray-600">
            {participants.length} participant
            {participants.length > 1 ? "s" : ""}
          </p>
        </div>
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
    </div>
  );
}
