import { NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/session";
import { getAllStands, getParticipantProgress } from "@/lib/stands";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/final/characters — retourne les 10 personnages dans l'ordre
 * (nom + initiale) pour l'écran final. Autorisé uniquement si le participant
 * a validé les 10 étapes.
 */
export async function GET() {
  const sess = await getParticipantSession();
  if (!sess)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [progress, stands] = await Promise.all([
    getParticipantProgress(sess.participantId),
    getAllStands(),
  ]);

  if (progress.length < 10) {
    return NextResponse.json(
      { error: "Tu dois d'abord valider les 10 étapes." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    characters: stands.map((s) => ({
      order_index: s.order_index,
      name: s.character_name,
      initial: s.initial,
      anime_name: s.anime_name,
    })),
  });
}
