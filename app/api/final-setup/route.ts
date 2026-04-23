import { NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAllStands, getParticipantProgress } from "@/lib/stands";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface NarrativeEntry {
  role: string;
  character: string;
  letter: string;
}

interface CharacterCard {
  character: string;
  anime: string;
}

/**
 * GET /api/final-setup
 *
 * Pré-condition : participant authentifié + a validé les 10 étapes.
 *
 * Réponse :
 *   {
 *     narrative_order: [{ role, character, letter }, ...]   // 10 rôles dans l'ordre ANGEL BEATS
 *     characters_to_place: [{ character, anime }, ...]      // 10 personnages mélangés
 *   }
 *
 * Le serveur connaît le mapping correct ; le client ne voit que l'ordre
 * narratif des rôles (slots) et un pool mélangé de personnages. Le client
 * peut valider localement en comparant position→personnage via les rôles,
 * mais la validation finale reste côté serveur via POST /api/final.
 */
export async function GET() {
  const sess = await getParticipantSession();
  if (!sess) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

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

  // Lire l'ordre narratif depuis la config.
  const sb = getSupabaseAdmin();
  const { data: cfgRow, error: cfgErr } = await sb
    .from("config")
    .select("value")
    .eq("key", "narrative_order")
    .maybeSingle();

  if (cfgErr) {
    console.error("[final-setup] config read error", cfgErr);
    return NextResponse.json(
      { error: "Erreur de configuration." },
      { status: 500 }
    );
  }

  let narrative_order: NarrativeEntry[] = [];
  if (cfgRow?.value) {
    try {
      const parsed: unknown = JSON.parse(String(cfgRow.value));
      if (Array.isArray(parsed)) {
        narrative_order = parsed
          .map((entry): NarrativeEntry | null => {
            if (
              entry &&
              typeof entry === "object" &&
              "role" in entry &&
              "character" in entry &&
              "letter" in entry
            ) {
              const e = entry as Record<string, unknown>;
              if (
                typeof e.role === "string" &&
                typeof e.character === "string" &&
                typeof e.letter === "string"
              ) {
                return {
                  role: e.role,
                  character: e.character,
                  letter: e.letter,
                };
              }
            }
            return null;
          })
          .filter((x): x is NarrativeEntry => x !== null);
      }
    } catch (err) {
      console.error("[final-setup] narrative_order parse error", err);
    }
  }

  // Fallback : reconstruire depuis stands si la config est absente/corrompue.
  if (narrative_order.length !== 10) {
    narrative_order = stands
      .filter((s) => s.narrative_role)
      .map((s) => ({
        role: s.narrative_role as string,
        character: s.character_name,
        letter: s.initial,
      }));
  }

  // Pool mélangé de personnages (nom + anime).
  const characters: CharacterCard[] = stands.map((s) => ({
    character: s.character_name,
    anime: s.anime_name,
  }));
  const characters_to_place = shuffle(characters);

  return NextResponse.json({
    narrative_order,
    characters_to_place,
  });
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
