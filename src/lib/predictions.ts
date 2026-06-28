import { champion, type Picks } from "@/lib/bracket";
import type { Phase } from "@/lib/storage";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export type PredictionRow = {
  id: string;
  client_id: string;
  name: string;
  picks: Picks;
  phase: Phase;
  champion: string | null;
  picks_count: number;
  created_at: string;
  updated_at: string;
};

export type PredictionPayload = {
  clientId: string;
  name: string;
  picks: Picks;
  phase: Phase;
};

export function pickCount(picks: Picks): number {
  return Object.values(picks).filter(Boolean).length;
}

export function toPredictionInsert(payload: PredictionPayload) {
  const champ = champion(payload.picks) ?? null;
  return {
    client_id: payload.clientId,
    name: payload.name.trim(),
    picks: payload.picks,
    phase: payload.phase,
    champion: champ,
    picks_count: pickCount(payload.picks),
    updated_at: new Date().toISOString(),
  };
}

export async function listPredictions(): Promise<PredictionRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Supabase list failed", error);
    return [];
  }

  return (data ?? []) as PredictionRow[];
}
