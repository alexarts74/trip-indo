"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface SentInvitation {
  id: string;
  trip_id: string;
  invitee_email: string;
  status: string;
  created_at: string;
}

interface SentInvitationsProps {
  currentUserId: string;
}

export default function SentInvitations({
  currentUserId,
}: SentInvitationsProps) {
  const [invitations, setInvitations] = useState<SentInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSentInvitations();
  }, []);

  const fetchSentInvitations = async () => {
    try {
      console.log("🔍 Fetching invitations for user:", currentUserId);

      const { data, error } = await supabase
        .from("trip_invitations")
        .select("id, trip_id, invitee_email, status, created_at")
        .eq("inviter_id", currentUserId)
        .order("created_at", { ascending: false });

      console.log("📡 Invitations response:", { data, error });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error("💥 Error fetching invitations:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            En attente
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Acceptée
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Déclinée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  if (invitations.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Aucune invitation envoyée
          </h3>
          <p className="text-xs text-gray-500">
            Vous n'avez pas encore envoyé d'invitations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Invitations envoyées
        </h3>
        <span className="text-sm text-gray-500">
          {invitations.length} invitation{invitations.length > 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {invitation.trip_id.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Trip ID: {invitation.trip_id.substring(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-600">
                    Invité : {invitation.invitee_email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {getStatusBadge(invitation.status)}
              <span className="text-xs text-gray-500">
                {formatDate(invitation.created_at)}
              </span>

              {/* Aucun bouton d'action - l'inviteur ne peut pas modifier le statut */}
              {invitation.status === "pending" && (
                <span className="text-xs text-gray-500 italic">
                  En attente de réponse
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
