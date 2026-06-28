"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { prunePicks, champion, type Picks } from "@/lib/bracket";
import BracketTree from "./BracketTree";
import ShareCard from "./ShareCard";
import styles from "./predictor.module.css";

type Phase = "intro" | "predict" | "result";
const STORAGE_KEY = "wc26-predictor-v1";

export default function Predictor() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [name, setName] = useState("");
  const [picks, setPicks] = useState<Picks>({});
  const [downloading, setDownloading] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  // Restore saved progress once on mount (syncing React with localStorage,
  // an external system — the canonical place for this is an effect).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.name) setName(saved.name);
        if (saved.picks) setPicks(saved.picks);
        if (saved.phase) setPhase(saved.phase);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist progress
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, picks, phase }));
    } catch {
      /* ignore */
    }
  }, [name, picks, phase, hydrated]);

  const totalPicked = Object.values(picks).filter(Boolean).length;
  const progress = Math.round((totalPicked / 31) * 100);
  const champ = champion(picks);

  function handlePick(matchId: number, teamId: string) {
    setPicks((prev) => prunePicks({ ...prev, [matchId]: teamId }));
  }

  function start() {
    setPhase("predict");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetAll() {
    setPicks({});
    setPhase("intro");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  async function download() {
    if (!shareRef.current) return;
    setShareError(false);
    setDownloading(true);
    try {
      // Make sure web fonts are ready so they rasterize correctly.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      const node = shareRef.current;
      const render = toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#060418",
        width: node.offsetWidth,
        height: node.offsetHeight,
      });
      const dataUrl = await Promise.race([
        render,
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("render-timeout")), 12000)
        ),
      ]);
      const link = document.createElement("a");
      const safe = (name.trim() || "anonymous").replace(/[^a-z0-9]+/gi, "-");
      link.download = `wc26-${safe}-${champ ?? "bracket"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Screenshot failed", err);
      setShareError(true);
    } finally {
      setDownloading(false);
    }
  }

  if (!hydrated) {
    return <div className={styles.shell} aria-busy="true" />;
  }

  // ---------------- INTRO ----------------
  if (phase === "intro") {
    return (
      <main className={styles.shell}>
        <div className={`${styles.intro} ${styles.fadeIn}`}>
          <span className={styles.introTag}>FIFA World Cup 2026 · Knockout</span>
          <h1 className={styles.introTitle}>
            PREDICT
            <br />
            THE BRACKET
          </h1>
          <p className={styles.introSub}>
            The Round of 32 is locked in. Call every knockout game from the last
            32 all the way to the Final — then crown your champion and share it.
          </p>
          <div className={styles.nameRow}>
            <input
              className={styles.input}
              placeholder="Enter your name"
              value={name}
              maxLength={28}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && start()}
            />
            <button
              className={styles.btn}
              onClick={start}
              disabled={!name.trim()}
            >
              Start →
            </button>
          </div>
          <div className={styles.statStrip}>
            <div className={styles.stat}>
              <span className={styles.statNum}>32</span>
              <span className={styles.statLabel}>Teams</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>31</span>
              <span className={styles.statLabel}>Games</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>5</span>
              <span className={styles.statLabel}>Rounds</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>1</span>
              <span className={styles.statLabel}>Champion</span>
            </div>
          </div>
          {totalPicked > 0 && (
            <button className={styles.linkbtn} onClick={() => setPhase("predict")}>
              ↩ Resume your bracket ({progress}% done)
            </button>
          )}
        </div>
      </main>
    );
  }

  // ---------------- RESULT ----------------
  if (phase === "result") {
    if (!champ) {
      return (
        <main className={styles.shell}>
          <div className={styles.intro}>
            <p className={styles.introSub}>Your bracket isn’t finished yet.</p>
            <button className={styles.btn} onClick={() => setPhase("predict")}>
              Back to picks
            </button>
          </div>
        </main>
      );
    }
    return (
      <main className={styles.shell}>
        <div className={`${styles.result} ${styles.pop}`}>
          <ShareCard ref={shareRef} name={name} picks={picks} champ={champ} />
          <div className={styles.resultActions}>
            <button className={styles.btn} onClick={download} disabled={downloading}>
              {downloading ? "Rendering…" : "📸 Save image"}
            </button>
            <button
              className={styles.btnGhost}
              onClick={() => setPhase("predict")}
            >
              Edit picks
            </button>
            <button className={styles.btnGhost} onClick={resetAll}>
              Start over
            </button>
          </div>
          <p className={styles.hint}>
            {shareError
              ? "Couldn’t generate the image — please try again."
              : "Your name is watermarked on the image. Long-press / right-click also works to save it."}
          </p>
        </div>
      </main>
    );
  }

  // ---------------- PREDICT ----------------
  return (
    <main className={styles.shellWide}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.kicker}>WC26 · Knockout Predictor</span>
          <span className={styles.logo}>ROAD TO THE FINAL</span>
        </div>
        <div className={styles.headRight}>
          <div className={styles.progressMini}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressTxt}>{totalPicked}/31</span>
          </div>
          <div className={styles.whoami}>
            <span>👤</span>
            <b>{name || "Player"}</b>
            <button className={styles.linkbtn} onClick={() => setPhase("intro")}>
              edit
            </button>
          </div>
        </div>
      </header>

      <BracketTree
        picks={picks}
        onPick={handlePick}
        champ={champ}
        onCrown={() => {
          setPhase("result");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {champ ? (
        <div className={styles.predictFoot}>
          <button
            className={styles.btn}
            onClick={() => {
              setPhase("result");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            👑 Crown champion & share
          </button>
        </div>
      ) : (
        <div className={styles.predictFoot}>
          <span className={styles.hint}>
            Pick a winner in every match — the bracket fills in as you go.
          </span>
        </div>
      )}
    </main>
  );
}
