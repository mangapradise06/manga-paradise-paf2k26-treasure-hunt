import "server-only";
import { getSupabaseAdmin } from "./supabase";
import type { Stand, Progress } from "./types";

export async function getAllStands(): Promise<Stand[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("stands")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Stand[];
}

export async function getStandById(id: number): Promise<Stand | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("stands").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Stand | null) ?? null;
}

export async function getParticipantProgress(
  participantId: string
): Promise<Progress[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("progress")
    .select("*")
    .eq("participant_id", participantId)
    .order("validated_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Progress[];
}

/**
 * Détermine le stand suivant à valider pour un participant.
 * On se base sur l'order_index : on renvoie le 1er stand dont l'id n'est pas dans progress.
 * Retourne null si tout est validé.
 */
export async function getNextStandForParticipant(
  participantId: string
): Promise<Stand | null> {
  const [stands, prog] = await Promise.all([
    getAllStands(),
    getParticipantProgress(participantId),
  ]);
  const done = new Set(prog.map((p) => p.stand_id));
  for (const s of stands) {
    if (!done.has(s.id)) return s;
  }
  return null;
}

/**
 * Retourne les stands "publics" (pas les réponses) : id, order, name, map_x, map_y.
 * Pour affichage carte uniquement.
 */
export async function getPublicStands() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("stands")
    .select("id, order_index, name, map_x, map_y")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function incrementAttempts(
  participantId: string,
  standId: number
): Promise<number> {
  const sb = getSupabaseAdmin();
  // Upsert incrémental : on ne peut pas faire ça en une requête sans rpc,
  // donc : lire → insert/update.
  const { data: existing } = await sb
    .from("attempts")
    .select("id, count")
    .eq("participant_id", participantId)
    .eq("stand_id", standId)
    .maybeSingle();

  if (existing) {
    const newCount = (existing.count as number) + 1;
    await sb
      .from("attempts")
      .update({ count: newCount, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    return newCount;
  }
  await sb.from("attempts").insert({
    participant_id: participantId,
    stand_id: standId,
    count: 1,
  });
  return 1;
}
