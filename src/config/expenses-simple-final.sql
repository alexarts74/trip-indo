-- Nettoyer les anciennes tables de dépenses
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Supprimer les anciennes tables de dépenses
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS expense_shares CASCADE;
DROP TABLE IF EXISTS reimbursements CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;

-- Créer la nouvelle table expenses simple
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category TEXT DEFAULT 'Autres',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  paid_for_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Désactiver RLS temporairement pour tester
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- Ajouter des commentaires pour clarifier les champs
COMMENT ON COLUMN expenses.paid_by_user_id IS 'Utilisateur qui a payé la dépense';
COMMENT ON COLUMN expenses.paid_for_user_id IS 'Utilisateur pour qui la dépense a été payée (NULL = tout le monde)';
