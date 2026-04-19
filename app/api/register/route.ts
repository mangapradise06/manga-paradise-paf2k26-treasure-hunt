import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createParticipantSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  pseudo?: string;
  rgpd?: boolean;
  newsletter?: boolean;
}

function clean(s: unknown, max = 120): string {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, max);
}

export async function POST(req: Request) {
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const firstName = clean(body.firstName, 60);
  const lastName = clean(body.lastName, 60);
  const email = clean(body.email, 180).toLowerCase();
  const pseudo = clean(body.pseudo, 40);
  const rgpd = body.rgpd === true;
  const newsletter = body.newsletter === true;

  if (!firstName) return NextResponse.json({ error: "Prénom requis" }, { status: 400 });
  if (!lastName) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  if (!pseudo) return NextResponse.json({ error: "Pseudo requis" }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  if (!rgpd)
    return NextResponse.json(
      { error: "Vous devez accepter la politique RGPD pour continuer." },
      { status: 400 }
    );

  const sb = getSupabaseAdmin();

  // Check existing by email
  const { data: existing, error: selErr } = await sb
    .from("participants")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (selErr) {
    console.error("[register] select error", selErr);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  let participantId: string;
  if (existing) {
    participantId = existing.id as string;
    // Mise à jour douce (newsletter / pseudo peuvent bouger) — optionnel
    await sb
      .from("participants")
      .update({
        first_name: firstName,
        last_name: lastName,
        pseudo,
        newsletter_consent: newsletter,
      })
      .eq("id", participantId);
  } else {
    const { data: inserted, error: insErr } = await sb
      .from("participants")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        pseudo,
        rgpd_consent: true,
        newsletter_consent: newsletter,
      })
      .select("id")
      .single();
    if (insErr || !inserted) {
      console.error("[register] insert error", insErr);
      return NextResponse.json(
        { error: "Impossible de créer le participant" },
        { status: 500 }
      );
    }
    participantId = inserted.id as string;
  }

  await createParticipantSession(participantId);

  return NextResponse.json({ ok: true, participantId });
}
