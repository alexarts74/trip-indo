"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import AddExpenseModal from "./AddExpenseModal";

interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paid_by_user_id: string;
  paid_for_user_id: string | null;
}

interface ExpenseManagerProps {
  tripId: string;
  tripName: string;
}

export default function ExpenseManager({
  tripId,
  tripName,
}: ExpenseManagerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [tripId]);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      console.error("Erreur récupération dépenses:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Dépenses du voyage
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Gérez et suivez toutes les dépenses du voyage
            </p>
          </div>
          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
          >
            + Ajouter une dépense
          </button>
        </div>
      </div>

      {/* Liste simple des dépenses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Dépenses enregistrées
        </h4>

        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucune dépense enregistrée pour ce voyage.
          </p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">
                      {expense.title}
                    </h5>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        {expense.amount}€
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {expense.category}
                      </span>
                      {expense.paid_for_user_id ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Personnelle
                        </span>
                      ) : (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                          Commune
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">
                    {new Date(expense.date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        tripId={tripId}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  );
}
