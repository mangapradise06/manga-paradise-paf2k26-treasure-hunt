import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createParticipantSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IS_DEV = process.env.NODE_ENV === "development";

interface RegisterBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  pseudo?: string;
  rgpd?: boolean;
  newsletter?: boolean;
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

    const firstName = clean(body.firstName, 60);
    const lastName = clean(body.lastName, 60);
    const email = clean(body.email, 180).toLowerCase();
    const pseudo = clean(body.pseudo, 40);
    const rgpd = body.rgpd === true;
    const newsletter = body.newsletter === true;

    if (!firstName)
      return NextResponse.json({ error: "Prénom requis", field: "firstName" }, { status: 400 });
    if (!lastName)
      return NextResponse.json({ error: "Nom requis", field: "lastName" }, { status: 400 });
    if (!pseudo)
      return NextResponse.json({ error: "Pseudo requis", field: "pseudo" }, { status: 400 });
    if (!EMAIL_RE.test(email))
      return NextResponse.json({ error: "Email invalide", field: "email" }, { status: 400 });
    if (!rgpd)
      return NextResponse.json(
        {
          error: "Vous devez accepter la politique RGPD pour continuer.",
          field: "rgpd",
        },
        { status: 400 }
      );

    const sb = getSupabaseAdmin();

    const { data: emailRow, error: emailErr } = await sb
      .from("participants")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (emailErr) return serverError(emailErr, "select email");
    if (emailRow) {
      return NextResponse.json(
        {
          error: "Un participant est déjà inscrit avec cet email.",
          field: "email",
        },
        { status: 409 }
      );
    }

    const { data: pseudoRow, error: pseudoErr } = await sb
      .from("participants")
      .select("id")
      .eq("pseudo", pseudo)
      .maybeSingle();
    if (pseudoErr) return serverError(pseudoErr, "select pseudo");
    if (pseudoRow) {
      return NextResponse.json(
        {
          error: "Ce pseudo est déjà pris, choisis-en un autre.",
          field: "pseudo",
        },
        { status: 409 }
      );
    }

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
      const pg = insErr as PgError | null;
      if (pg?.code === "23505") {
        const detail = (pg.details ?? "") + " " + (pg.message ?? "");
        const isEmail = /email/i.test(detail);
        logPg("insert 23505", insErr);
        return NextResponse.json(
          {
            error: isEmail
              ? "Un participant est déjà inscrit avec cet email."
              : "Ce pseudo est déjà pris, choisis-en un autre.",
            field: isEmail ? "email" : "pseudo",
          },
          { status: 409 }
        );
      }
      return serverError(insErr, "insert participant");
    }

    await createParticipantSession(inserted.id as string);

    return NextResponse.json({ ok: true, participantId: inserted.id });
  } catch (err) {
    return serverError(err, "unhandled");
  }
}
