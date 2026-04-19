import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(
    200,
    Math.max(1, Number(url.searchParams.get("limit") ?? "25"))
  );
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const sb = getSupabaseAdmin();
  const { data, count, error } = await sb
    .from("participants")
    .select(
      "id, first_name, last_name, email, pseudo, newsletter_consent, created_at, completed_at, final_anime_guess, is_winner_eligible",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Décorer chaque participant avec son nb d'étapes validées
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

  const rows = (data ?? []).map((p) => ({
    ...p,
    progress_count: progressCounts.get(p.id as string) ?? 0,
  }));

  return NextResponse.json({
    total: count ?? rows.length,
    page,
    limit,
    rows,
  });
}
