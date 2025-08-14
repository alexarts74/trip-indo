import { supabase } from "./supabaseClient";

export async function syncUserParticipants(userEmail: string, userId: string) {
  try {
    console.log("Synchronisation des participants pour:", userEmail);

    // Chercher tous les voyages où cet email est dans trip_participants
    const { data: emailParticipants, error: fetchError } = await supabase
      .from("trip_participants")
      .select("id, trip_id, role")
      .eq("email", userEmail.toLowerCase());

    if (fetchError) {
      console.error("Erreur récupération participants par email:", fetchError);
      return;
    }

    if (!emailParticipants || emailParticipants.length === 0) {
      console.log("Aucun voyage trouvé pour cet email");
      return;
    }

    console.log("Voyages trouvés:", emailParticipants.length);

    // Pour chaque voyage, remplacer l'email par le vrai user_id
    for (const participant of emailParticipants) {
      const { error: updateError } = await supabase
        .from("trip_participants")
        .update({
          user_id: userId,
          email: null, // Supprimer l'email une fois qu'on a le user_id
        })
        .eq("id", participant.id);

      if (updateError) {
        console.error("Erreur mise à jour participant:", updateError);
      } else {
        console.log(
          "Participant mis à jour pour le voyage:",
          participant.trip_id
        );
      }
    }

    console.log("Synchronisation terminée");
  } catch (error) {
    console.error("Erreur synchronisation participants:", error);
  }
}
