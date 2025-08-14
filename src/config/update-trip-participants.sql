-- Ajouter une colonne email à trip_participants
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Ajouter la colonne email
ALTER TABLE trip_participants
ADD COLUMN email TEXT;

-- Ajouter un index sur email pour les performances
CREATE INDEX idx_trip_participants_email ON trip_participants(email);

-- Ajouter un commentaire
COMMENT ON COLUMN trip_participants.email IS 'Email du participant (utilisé temporairement avant correspondance avec user_id)';

-- Mettre à jour les contraintes pour permettre user_id NULL quand on a un email
ALTER TABLE trip_participants
ALTER COLUMN user_id DROP NOT NULL;

-- Ajouter une contrainte pour s'assurer qu'on a soit user_id soit email
ALTER TABLE trip_participants
ADD CONSTRAINT check_user_id_or_email
CHECK (user_id IS NOT NULL OR email IS NOT NULL);
