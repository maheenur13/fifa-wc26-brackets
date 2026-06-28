import type { Picks } from "@/lib/bracket";

export type Phase = "intro" | "predict" | "result";

export const STORAGE_KEY = "wc26-predictor-v1";
export const CLIENT_ID_KEY = "wc26-client-id";

export type SavedPrediction = {
  name: string;
  email: string;
  picks: Picks;
  phase: Phase;
};

export function loadSavedPrediction(): SavedPrediction | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<SavedPrediction>;
    return {
      name: saved.name ?? "",
      email: saved.email ?? "",
      picks: saved.picks ?? {},
      phase: saved.phase ?? "intro",
    };
  } catch {
    return null;
  }
}

export function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `wc26-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch {
    return "";
  }
}
