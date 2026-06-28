import type { Picks } from "@/lib/bracket";
import { getOrCreateClientId, type Phase } from "@/lib/storage";

export type SyncResult =
  | { ok: true; id?: string; updatedAt: string }
  | { ok: false; error: string };

export async function syncPrediction(input: {
  name: string;
  email: string;
  picks: Picks;
  phase: Phase;
}): Promise<SyncResult> {
  const clientId = getOrCreateClientId();
  if (!clientId) {
    return { ok: false, error: "Could not create a device id for sync." };
  }
  if (!input.name.trim()) {
    return { ok: false, error: "Enter your name before syncing." };
  }
  if (!input.email.trim()) {
    return { ok: false, error: "Enter your email before syncing." };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email.trim())) {
    return { ok: false, error: "Enter a valid email address." };
  }

  try {
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        name: input.name.trim(),
        email: input.email.trim(),
        picks: input.picks,
        phase: input.phase,
      }),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      id?: string;
      updatedAt?: string;
      error?: string;
    };

    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? "Sync failed." };
    }

    return {
      ok: true,
      id: data.id,
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return { ok: false, error: "Network error — try again." };
  }
}
