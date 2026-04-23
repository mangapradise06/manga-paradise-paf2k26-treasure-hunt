import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createParticipantSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IS_DEV = process.env.NODE_ENV === "development";

interface RegisterBody {
  pseudo?: string;
  rgpd?: boolean;
}

interface PgError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

function clean(s: unknown, max = 120): string {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, max);
}

function logPg(ctx: string, err: unknown) {
  const pg = err as PgError;
  console.error(`[register] ${ctx}`, {
    code: pg?.code,
    message: pg?.message ?? (err instanceof Error ? err.message : String(err)),
    details: pg?.details,
    hint: pg?.hint,
  });
}

function serverError(err: unknown, ctx: string) {
  logPg(ctx, err);
  const pg = err as PgError;
  const payload: Record<string, unknown> = { error: "Erreur serveur." };
  if (IS_DEV) {
    payload.dev = {
      context: ctx,
      code: pg?.code,
      message: pg?.message ?? (err instanceof Error ? err.message : String(err)),
      details: pg?.details,
      hint: pg?.hint,
    };
  }
  return NextResponse.json(payload, { status: 500 });
}

export async function POST(req: Request) {
  try {
    const rl = checkRateLimit(`register:${getClientIp(req.headers)}`);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: "Trop de tentatives, réessaie dans une minute.",
          retryInMs: rl.resetInMs,
        },
        { status: 429 }
      );
    }

    let body: RegisterBody;
    try {
      body = (await req.json()) as RegisterBody;
    } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const pseudo = clean(body.pseudo, 40);
    const rgpd = body.rgpd === true;

    if (!pseudo)
      return NextResponse.json(
        { error: "Pseudo requis", field: "pseudo" },
        { status: 400 }
      );
    if (!rgpd)
      return NextResponse.json(
        {
          error: "Vous devez accepter la politique RGPD pour continuer.",
          field: "rgpd",
        },
        { status: 400 }
      );

    const sb = getSupabaseAdmin();

    // Pas d'unicité sur le pseudo : un même pseudo peut être utilisé par
    // plusieurs participants (pour éviter de bloquer les utilisateurs en cas
    // de reprise d'inscription après un incident). Les participants sont
    // distingués en base par leur id, et reliés aux coordonnées via Tally.
    const { data: inserted, error: insErr } = await sb
      .from("participants")
      .insert({
        pseudo,
        rgpd_consent: true,
      })
      .select("id")
      .single();

    if (insErr || !inserted) {
      return serverError(insErr, "insert participant");
    }

    await createParticipantSession(inserted.id as string);

    return NextResponse.json({ ok: true, participantId: inserted.id });
  } catch (err) {
    return serverError(err, "unhandled");
  }
}
