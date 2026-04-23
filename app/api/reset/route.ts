import { NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/reset
 *
 * Permet au joueur de remettre sa progression à zéro UNE SEULE FOIS.
 * - 401 si non authentifié
 * - 403 si reset_used déjà à true
 * - Succès : vide progress + attempts du participant, pose reset_used = true.
 *
 * NB : la table de progression validée s'appelle `progress`, et les compteurs
 * d'essais sont dans `attempts`. On purge les deux pour un reset complet.
 */
export async function POST() {
  const sess = await getParticipantSession();
  if (!sess) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();

  // Vérifier l'état reset_used
  const { data: participant, error: readErr } = await sb
    .from("participants")
    .select("id, reset_used, completed_at")
    .eq("id", sess.participantId)
    .maybeSingle();

  if (readErr || !participant) {
    console.error("[reset] read participant error", readErr);
    return NextResponse.json(
      { error: "Participant introuvable" },
      { status: 404 }
    );
  }

  if (participant.reset_used === true) {
    return NextResponse.json(
      { error: "Reset déjà utilisé" },
      { status: 403 }
    );
  }

  // Purge progress + attempts
  const { error: delProgressErr } = await sb
    .from("progress")
    .delete()
    .eq("participant_id", sess.participantId);
  if (delProgressErr) {
    console.error("[reset] delete progress error", delProgressErr);
    return NextResponse.json(
      { error: "Erreur lors du reset (progress)." },
      { status: 500 }
    );
  }

  const { error: delAttemptsErr } = await sb
    .from("attempts")
    .delete()
    .eq("participant_id", sess.participantId);
  if (delAttemptsErr) {
    console.error("[reset] delete attempts error", delAttemptsErr);
    return NextResponse.json(
      { error: "Erreur lors du reset (attempts)." },
      { status: 500 }
    );
  }

  // Flag reset_used = true + reset éventuels champs de complétion
  const { error: updErr } = await sb
    .from("participants")
    .update({
      reset_used: true,
      completed_at: null,
      final_anime_guess: null,
      is_winner_eligible: false,
    })
    .eq("id", sess.participantId);
  if (updErr) {
    console.error("[reset] update participant error", updErr);
    return NextResponse.json(
      { error: "Erreur lors du reset (participant)." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, ok: true });
}
