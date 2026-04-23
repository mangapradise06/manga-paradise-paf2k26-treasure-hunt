import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getParticipantSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/onboarding-seen
 *
 * Marque onboarding_seen = true pour le participant courant et pose un cookie
 * pp_onboarding=1 (lecture rapide côté serveur sans DB).
 */
export async function POST() {
  const sess = await getParticipantSession();
  if (!sess) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("participants")
    .update({ onboarding_seen: true })
    .eq("id", sess.participantId);

  if (error) {
    console.error("[onboarding-seen] update error", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer la progression." },
      { status: 500 }
    );
  }

  cookies().set("pp_onboarding", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30j
  });

  return NextResponse.json({ success: true, ok: true });
}
