import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("participants")
    .select(
      "id, first_name, last_name, email, pseudo, rgpd_consent, newsletter_consent, created_at, completed_at, final_anime_guess, is_winner_eligible"
    )
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = (data ?? []).map((p) => p.id as string);
  const progressCounts = new Map<string, number>();
  if (ids.length) {
    const { data: prog } = await sb
      .from("progress")
      .select("participant_id")
      .in("participant_id", ids);
    for (const r of prog ?? []) {
      const pid = r.participant_id as string;
      progressCounts.set(pid, (progressCounts.get(pid) ?? 0) + 1);
    }
  }

  const headers = [
    "id",
    "prenom",
    "nom",
    "email",
    "pseudo",
    "rgpd",
    "newsletter",
    "inscrit_le",
    "fini_le",
    "reponse_finale",
    "eligible_tirage",
    "etapes_validees",
  ];
  const lines: string[] = [headers.join(",")];
  for (const p of data ?? []) {
    lines.push(
      [
        p.id,
        p.first_name,
        p.last_name,
        p.email,
        p.pseudo,
        p.rgpd_consent ? "oui" : "non",
        p.newsletter_consent ? "oui" : "non",
        p.created_at,
        p.completed_at ?? "",
        p.final_anime_guess ?? "",
        p.is_winner_eligible ? "oui" : "non",
        progressCounts.get(p.id as string) ?? 0,
      ]
        .map(csvEscape)
        .join(",")
    );
  }
  const bom = "\uFEFF";
  const csv = bom + lines.join("\r\n") + "\r\n";

  const filename = `paf2k26-participants-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
