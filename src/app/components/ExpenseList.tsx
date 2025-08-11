"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Expense {
  id: string;
  trip_id: string;
  paid_by_user_id: string;
  category_id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  date: string;
  is_split: boolean;
  created_at: string;
  paid_by_user?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  category?: {
    name: string;
    icon: string;
    color: string;
  };
  shares?: ExpenseShare[];
}

interface ExpenseShare {
  id: string;
  expense_id: string;
  user_id: string;
  share_amount: number;
  share_percentage?: number;
  user?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted: (expenseId: string) => void;
  onExpenseUpdated: () => void;
}

export default function ExpenseList({
  expenses,
  onExpenseDeleted,
  onExpenseUpdated,
}: ExpenseListProps) {
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null
  );

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      return;
    }

    setDeletingExpenseId(expenseId);
    try {
      // Supprimer d'abord les parts de dépense
      const { error: sharesError } = await supabase
        .from("expense_shares")
        .delete()
        .eq("expense_id", expenseId);

      if (sharesError) throw sharesError;

      // Puis supprimer la dépense
      const { error: expenseError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (expenseError) throw expenseError;

      onExpenseDeleted(expenseId);
    } catch (error: any) {
      console.error("Erreur suppression dépense:", error);
      alert("Erreur lors de la suppression de la dépense");
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">💰</div>
        <h4 className="text-xl font-semibold text-gray-900 mb-2">
          Aucune dépense enregistrée
        </h4>
        <p className="text-gray-600">
          Commencez par ajouter vos premières dépenses pour ce voyage !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:border-orange-300 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1">
              <div className="flex items-start space-x-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                  style={{
                    backgroundColor: expense.category?.color || "#6B7280",
                  }}
                >
                  {expense.category?.icon || "💰"}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {expense.title}
                  </h4>
                  {expense.description && (
                    <p className="text-gray-600 text-sm mb-2">
                      {expense.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center">
                      📅 {formatDate(expense.date)}
                    </span>
                    <span className="flex items-center">
                      👤{" "}
                      {expense.paid_by_user?.first_name ||
                        expense.paid_by_user?.email}
                    </span>
                    <span className="flex items-center">
                      🏷️ {expense.category?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Participants et parts */}
              {expense.shares && expense.shares.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Répartition entre {expense.shares.length} participant(s) :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {expense.shares.map((share) => (
                      <span
                        key={share.id}
                        className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600"
                      >
                        {share.user?.first_name || share.user?.email} :{" "}
                        {formatAmount(share.share_amount)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sm:ml-4 sm:text-right flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="text-2xl font-bold text-gray-900">
                {formatAmount(expense.amount)}
              </div>
              <button
                onClick={() => handleDeleteExpense(expense.id)}
                disabled={deletingExpenseId === expense.id}
                className="text-red-600 hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50 disabled:opacity-50 self-end sm:self-auto"
                title="Supprimer cette dépense"
              >
                {deletingExpenseId === expense.id ? (
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

      {/* Résumé des dépenses */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h4 className="text-lg font-semibold text-orange-800">
              Total des dépenses
            </h4>
            <p className="text-sm text-orange-600">
              {expenses.length} dépense{expenses.length > 1 ? "s" : ""}{" "}
              enregistrée{expenses.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {formatAmount(
              expenses.reduce((total, expense) => total + expense.amount, 0)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
