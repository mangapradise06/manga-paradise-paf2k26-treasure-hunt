import { NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  getParticipantProgress,
  getPublicStands,
  getNextStandForParticipant,
} from "@/lib/stands";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sess = await getParticipantSession();
  if (!sess) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  const { data: participant, error } = await sb
    .from("participants")
    .select(
      "id, first_name, last_name, email, pseudo, rgpd_consent, newsletter_consent, created_at, completed_at, final_anime_guess, is_winner_eligible, onboarding_seen, reset_used"
    )
    .eq("id", sess.participantId)
    .maybeSingle();

  if (error || !participant) {
    return NextResponse.json({ error: "Participant introuvable" }, { status: 404 });
  }

  const [progress, stands, next] = await Promise.all([
    getParticipantProgress(sess.participantId),
    getPublicStands(),
    getNextStandForParticipant(sess.participantId),
  ]);

  return NextResponse.json({
    participant,
    progress,
    stands,
    nextStandId: next?.id ?? null,
  });
}
