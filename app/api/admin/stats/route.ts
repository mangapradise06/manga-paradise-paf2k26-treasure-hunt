import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();

  const { count: totalParticipants } = await sb
    .from("participants")
    .select("*", { head: true, count: "exact" });

  const { count: completed } = await sb
    .from("participants")
    .select("*", { head: true, count: "exact" })
    .not("completed_at", "is", null);

  const { count: eligible } = await sb
    .from("participants")
    .select("*", { head: true, count: "exact" })
    .eq("is_winner_eligible", true);

  const { count: newsletterOptins } = await sb
    .from("participants")
    .select("*", { head: true, count: "exact" })
    .eq("newsletter_consent", true);

  // Nombre de validations par étape
  const { data: byStepRows } = await sb
    .from("progress")
    .select("stand_id");

  const counts = new Map<number, number>();
  for (const r of byStepRows ?? []) {
    const id = r.stand_id as number;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const { data: stands } = await sb
    .from("stands")
    .select("id, order_index, name")
    .order("order_index", { ascending: true });

  const byStep = (stands ?? []).map((s) => ({
    standId: s.id as number,
    order: s.order_index as number,
    name: s.name as string,
    count: counts.get(s.id as number) ?? 0,
  }));

  return NextResponse.json({
    totalParticipants: totalParticipants ?? 0,
    completed: completed ?? 0,
    eligible: eligible ?? 0,
    newsletterOptins: newsletterOptins ?? 0,
    byStep,
  });
}
