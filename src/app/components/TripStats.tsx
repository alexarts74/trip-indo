"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface Place {
  id: string;
  name: string;
  price: number;
}

interface Activity {
  id: string;
  name: string;
  price: number;
  destination_id: string;
}

interface TripStatsProps {
  tripId: string;
  tripBudget: number;
}

export default function TripStats({ tripId, tripBudget }: TripStatsProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    try {
      // Récupérer les destinations
      const { data: placesData, error: placesError } = await supabase
        .from("destinations")
        .select("id, name, price")
        .eq("trip_id", tripId);

      if (placesError) throw placesError;

      // Récupérer les activités
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("id, name, price, destination_id")
        .in("destination_id", placesData?.map((p) => p.id) || []);

      if (activitiesError) throw activitiesError;

      setPlaces(placesData || []);
      setActivities(activitiesData || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
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

  const totalPlacesCost = places.reduce((acc, place) => acc + place.price, 0);
  const totalActivitiesCost = activities.reduce(
    (acc, activity) => acc + activity.price,
    0
  );
  const totalCost = totalPlacesCost + totalActivitiesCost;
  const remainingBudget = tripBudget - totalCost;
  const budgetUsagePercentage = (totalCost / tripBudget) * 100;

  const topExpenses = [...places, ...activities]
    .sort((a, b) => b.price - a.price)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Statistiques du voyage
      </h3>

      {/* Vue d'ensemble du budget */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Budget total
          </h4>
          <div className="text-2xl font-bold text-gray-900">{tripBudget}€</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Dépensé</h4>
          <div className="text-2xl font-bold text-orange-600">{totalCost}€</div>
          <div className="text-sm text-gray-500">
            {budgetUsagePercentage.toFixed(1)}% utilisé
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Restant</h4>
          <div
            className={`text-2xl font-bold ${
              remainingBudget >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {remainingBudget}€
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Destinations
          </h4>
          <div className="text-2xl font-bold text-pink-600">
            {places.length}
          </div>
          <div className="text-sm text-gray-500">lieux planifiés</div>
        </div>
      </div>

      {/* Barre de progression du budget */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Utilisation du budget
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progression</span>
            <span>{budgetUsagePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                budgetUsagePercentage > 100
                  ? "bg-red-500"
                  : budgetUsagePercentage > 80
                  ? "bg-orange-500"
                  : "bg-gradient-to-r from-orange-500 to-pink-500"
              }`}
              style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>0€</span>
            <span>{tripBudget}€</span>
          </div>
        </div>
      </div>

      {/* Répartition des coûts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition des coûts
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Destinations</span>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="font-medium">{totalPlacesCost}€</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Activités</span>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="font-medium">{totalActivitiesCost}€</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 des dépenses
          </h4>
          <div className="space-y-2">
            {topExpenses.map((expense, index) => (
              <div
                key={expense.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600 truncate flex-1 mr-2">
                  {index + 1}. {expense.name}
                </span>
                <span className="font-medium text-gray-900">
                  {expense.price}€
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes */}
      {budgetUsagePercentage > 100 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">⚠️</div>
            <div>
              <h4 className="text-red-800 font-medium">Budget dépassé !</h4>
              <p className="text-red-700 text-sm">
                Vous avez dépassé votre budget de {Math.abs(remainingBudget)}€.
                Considérez ajuster vos plans ou augmenter votre budget.
              </p>
            </div>
          </div>
        </div>
      )}

      {budgetUsagePercentage > 80 && budgetUsagePercentage <= 100 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="text-orange-500 mr-3">⚠️</div>
            <div>
              <h4 className="text-orange-800 font-medium">
                Budget presque épuisé
              </h4>
              <p className="text-orange-700 text-sm">
                Vous avez utilisé {budgetUsagePercentage.toFixed(1)}% de votre
                budget. Il ne vous reste que {remainingBudget}€.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
