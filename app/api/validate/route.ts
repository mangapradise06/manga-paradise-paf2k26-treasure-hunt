import { NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fuzzyMatch } from "@/lib/fuzzyMatch";
import {
  getNextStandForParticipant,
  incrementAttempts,
  getParticipantProgress,
} from "@/lib/stands";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  standId?: number;
  answer?: string;
}

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`validate:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques secondes." },
      { status: 429 }
    );
  }

  const sess = await getParticipantSession();
  if (!sess)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const standId = Number(body.standId);
  const answer = typeof body.answer === "string" ? body.answer.slice(0, 200) : "";
  if (!Number.isFinite(standId) || !answer.trim()) {
    return NextResponse.json(
      { error: "Paramètres manquants" },
      { status: 400 }
    );
  }

  const next = await getNextStandForParticipant(sess.participantId);
  if (!next) {
    return NextResponse.json(
      { ok: false, error: "Toutes les étapes sont déjà validées." },
      { status: 409 }
    );
  }
  if (next.id !== standId) {
    return NextResponse.json(
      { ok: false, error: "Ce n'est pas l'étape en cours." },
      { status: 403 }
    );
  }

  const ok = fuzzyMatch(answer, next.character_name);
  const attempts = await incrementAttempts(sess.participantId, standId);

  if (!ok) {
    return NextResponse.json({
      ok: false,
      attempts,
      error: "Réponse incorrecte. Relis bien les indices !",
    });
  }

  // Insère la progression. On ignore les violations d'unicité (déjà validé).
  const sb = getSupabaseAdmin();
  const { error: insErr } = await sb
    .from("progress")
    .insert({
      participant_id: sess.participantId,
      stand_id: standId,
    })
    .select("id")
    .single();

  // 23505 = unique_violation (pgcode). On ignore si déjà validé.
  if (insErr && insErr.code !== "23505") {
    console.error("[validate] insert progress error", insErr);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement." },
      { status: 500 }
    );
  }

  // Déterminer la suite
  const [updatedProgress, newNext] = await Promise.all([
    getParticipantProgress(sess.participantId),
    getNextStandForParticipant(sess.participantId),
  ]);

  const complete = newNext === null;

  return NextResponse.json({
    ok: true,
    attempts,
    validated: updatedProgress.length,
    total: 10,
    complete,
    nextStandId: newNext?.id ?? null,
  });
}
