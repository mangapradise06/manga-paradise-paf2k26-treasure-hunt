import { NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/session";
import {
  getNextStandForParticipant,
  getStandById,
  getParticipantProgress,
} from "@/lib/stands";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/stand/:id — retourne les infos nécessaires pour afficher la modale
 * énigme : nom, indices, order_index. Ne renvoie PAS le nom du personnage.
 * Vérifie que le participant a bien droit à ce stand (c'est son next, ou il l'a déjà validé).
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const sess = await getParticipantSession();
  if (!sess)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const stand = await getStandById(id);
  if (!stand)
    return NextResponse.json({ error: "Stand introuvable" }, { status: 404 });

  const [next, progress] = await Promise.all([
    getNextStandForParticipant(sess.participantId),
    getParticipantProgress(sess.participantId),
  ]);
  const already = progress.some((p) => p.stand_id === id);
  const isNext = next?.id === id;

  if (!isNext && !already) {
    return NextResponse.json({ error: "Stand verrouillé" }, { status: 403 });
  }

  return NextResponse.json({
    id: stand.id,
    order_index: stand.order_index,
    name: stand.name,
    hint_1: stand.hint_1,
    hint_2: stand.hint_2,
    map_x: stand.map_x,
    map_y: stand.map_y,
    already,
  });
}
