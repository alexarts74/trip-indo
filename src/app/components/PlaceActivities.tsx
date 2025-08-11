"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import AddActivityModal from "./AddActivityModal";

interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  created_at: string;
}

interface PlaceActivitiesProps {
  destinationId: string;
  destinationName: string;
}

export default function PlaceActivities({
  destinationId,
  destinationName,
}: PlaceActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchActivities();
  }, [destinationId]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("destination_id", destinationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setActivities(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityAdded = () => {
    fetchActivities();
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) {
      return;
    }

    setDeletingActivityId(activityId);
    try {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId);

      if (error) throw error;

      // Mettre à jour la liste locale
      setActivities(
        activities.filter((activity) => activity.id !== activityId)
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDeletingActivityId(null);
    }
  };

  const totalActivitiesCost = activities.reduce(
    (acc, activity) => acc + activity.price,
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h4 className="text-base sm:text-lg font-semibold text-gray-900">
          Activités à {destinationName}
        </h4>
        <button
          onClick={() => setIsAddActivityModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
        >
          + Ajouter une activité
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-xl">
          <div className="text-2xl sm:text-3xl mb-2">🎯</div>
          <p className="text-gray-600 mb-3 text-sm sm:text-base">
            Aucune activité planifiée
          </p>
          <button
            onClick={() => setIsAddActivityModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
          >
            Planifier ma première activité
          </button>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                    {activity.name}
                  </h5>
                  {activity.description && (
                    <p className="text-gray-600 text-xs sm:text-sm mb-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center">
                      ⏱️ {activity.duration}
                    </span>
                    <span className="flex items-center">
                      💰 {activity.price}€
                    </span>
                  </div>
                </div>
                <div className="sm:ml-4 sm:text-right flex flex-row sm:flex-col sm:items-end space-x-3 sm:space-x-0 sm:space-y-1">
                  <div className="text-base sm:text-lg font-bold text-gray-900">
                    {activity.price}€
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    disabled={deletingActivityId === activity.id}
                    className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50"
                    title="Supprimer cette activité"
                  >
                    {deletingActivityId === activity.id ? (
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
            </div>
          ))}

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0 text-xs sm:text-sm">
              <span className="text-orange-800 font-medium">
                Coût total des activités :
              </span>
              <span className="text-orange-900 font-bold">
                {totalActivitiesCost}€
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout d'activité */}
      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        destinationId={destinationId}
        onActivityAdded={handleActivityAdded}
      />
    </div>
  );
}
