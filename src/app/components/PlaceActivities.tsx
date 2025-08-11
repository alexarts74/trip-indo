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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">
          Activités à {destinationName}
        </h4>
        <button
          onClick={() => setIsAddActivityModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-sm"
        >
          + Ajouter une activité
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-xl">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-gray-600 mb-3">Aucune activité planifiée</p>
          <button
            onClick={() => setIsAddActivityModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-sm"
          >
            Planifier ma première activité
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">
                    {activity.name}
                  </h5>
                  {activity.description && (
                    <p className="text-gray-600 text-sm mb-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>⏱️ {activity.duration}</span>
                    <span>💰 {activity.price}€</span>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {activity.price}€
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
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
