"use client";

import { useState } from "react";
import { syncPrediction } from "@/lib/sync-prediction";
import type { Phase } from "@/lib/storage";
import type { Picks } from "@/lib/bracket";
import styles from "./predictor.module.css";

type Props = {
  name: string;
  picks: Picks;
  phase: Phase;
  compact?: boolean;
};

export default function SyncButton({ name, picks, phase, compact }: Props) {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const picked = Object.values(picks).filter(Boolean).length;
  if (!name.trim() || picked === 0) return null;

  async function handleSync() {
    setStatus("syncing");
    setMessage("");
    const result = await syncPrediction({ name, picks, phase });
    if (result.ok) {
      setStatus("done");
      setMessage(
        `Synced ${new Date(result.updatedAt).toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short",
        })}`
      );
      return;
    }
    setStatus("error");
    setMessage(result.error);
  }

  const label =
    status === "syncing"
      ? "Syncing…"
      : status === "done"
        ? "Synced ✓"
        : "☁ Sync to cloud";

  return (
    <div className={compact ? styles.syncCompact : styles.syncBlock}>
      <button
        className={status === "done" ? styles.btnGhost : styles.btn}
        type="button"
        onClick={() => void handleSync()}
        disabled={status === "syncing"}
      >
        {label}
      </button>
      {message ? (
        <span
          className={status === "error" ? styles.syncError : styles.syncHint}
        >
          {message}
        </span>
      ) : status === "idle" ? (
        <span className={styles.syncHint}>
          Save your bracket so it shows in the admin dashboard.
        </span>
      ) : null}
    </div>
  );
}
