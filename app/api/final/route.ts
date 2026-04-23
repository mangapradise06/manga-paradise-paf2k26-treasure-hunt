import { NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fuzzyMatch } from "@/lib/fuzzyMatch";
import { getParticipantProgress } from "@/lib/stands";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  guess?: string;
  answer?: string;
}

export async function POST(req: Request) {
  const sess = await getParticipantSession();
  if (!sess)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const raw =
    typeof body.guess === "string"
      ? body.guess
      : typeof body.answer === "string"
        ? body.answer
        : "";
  const guess = raw.slice(0, 120);
  if (!guess.trim())
    return NextResponse.json({ error: "Réponse vide" }, { status: 400 });

  const progress = await getParticipantProgress(sess.participantId);
  if (progress.length < 10) {
    return NextResponse.json(
      { error: "Tu dois d'abord valider les 10 étapes." },
      { status: 403 }
    );
  }

  const sb = getSupabaseAdmin();
  const { data: cfg, error: cfgErr } = await sb
    .from("config")
    .select("value")
    .eq("key", "final_anime")
    .maybeSingle();
  if (cfgErr || !cfg) {
    console.error("[final] config introuvable", cfgErr);
    return NextResponse.json({ error: "Configuration manquante" }, { status: 500 });
  }

  const target = String(cfg.value ?? "");
  const ok = fuzzyMatch(guess, target);

  if (!ok) {
    return NextResponse.json({
      ok: false,
      error: "Pas tout à fait… regarde bien les initiales !",
    });
  }

  await sb
    .from("participants")
    .update({
      completed_at: new Date().toISOString(),
      final_anime_guess: guess,
      is_winner_eligible: true,
    })
    .eq("id", sess.participantId);

  return NextResponse.json({ ok: true, success: true });
}
