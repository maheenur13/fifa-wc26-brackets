"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { prunePicks, champion, type Picks } from "@/lib/bracket";
import { syncPrediction } from "@/lib/sync-prediction";
import {
  STORAGE_KEY,
  type Phase,
} from "@/lib/storage";
import type { PredictionRow } from "@/lib/predictions";
import BracketTree from "./BracketTree";
import ShareCard from "./ShareCard";
import SyncButton from "./SyncButton";
import styles from "./predictor.module.css";

export default function Predictor() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [picks, setPicks] = useState<Picks>({});
  const [downloading, setDownloading] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [autoSyncing, setAutoSyncing] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [emailModalInput, setEmailModalInput] = useState("");
  const [nameModalInput, setNameModalInput] = useState("");
  const [emailModalError, setEmailModalError] = useState("");
  const [nameModalError, setNameModalError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  // Restore saved progress once on mount (syncing React with localStorage,
  // an external system — the canonical place for this is an effect).
  useEffect(() => {
    async function loadAndRefresh() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          
          // Check if existing user needs to add email
          if (!saved.email && saved.phase !== "intro") {
            setShowEmailModal(true);
          }
          
          // Auto-refresh from cloud if user is logged in
          if (saved.email && saved.phase !== "intro") {
            console.log('🔄 Checking cloud for updates...');
            try {
              const res = await fetch(`/api/predictions?email=${encodeURIComponent(saved.email)}`);
              if (res.ok) {
                const data = await res.json() as { ok?: boolean; prediction?: PredictionRow | null };
                if (data.ok && data.prediction) {
                  console.log('✅ Found cloud data, using it as source of truth');
                  console.log('Cloud name:', data.prediction.name);
                  console.log('Local name:', saved.name);
                  
                  // Use cloud data as source of truth
                  const cloudData = {
                    name: data.prediction.name,
                    email: data.prediction.email,
                    picks: data.prediction.picks,
                    phase: data.prediction.phase
                  };
                  
                  // Update state with cloud data
                  setName(cloudData.name);
                  setEmail(cloudData.email);
                  setPicks(cloudData.picks);
                  setPhase(cloudData.phase === 'result' ? 'result' : 'predict');
                  
                  // Save cloud data to localStorage
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
                  console.log('✅ Cloud data synced to state and localStorage');
                  setHydrated(true);
                  return;
                }
              }
            } catch (err) {
              console.log('⚠️ Could not refresh from cloud:', err);
            }
          }
          
          // No cloud data or not logged in - use localStorage
          console.log('Using localStorage data');
          if (saved.name) setName(saved.name);
          if (saved.email) setEmail(saved.email);
          if (saved.picks) setPicks(saved.picks);
          if (saved.phase) setPhase(saved.phase);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
      setHydrated(true);
    }
    
    void loadAndRefresh();
  }, []);

  // Persist progress
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email, picks, phase }));
    } catch {
      /* ignore */
    }
  }, [name, email, picks, phase, hydrated]);

  // Auto-sync when a user crowns their champion (once per visit to result).
  const prevPhaseRef = useRef<Phase>("intro");
  useEffect(() => {
    if (!hydrated) return;
    const justFinished =
      prevPhaseRef.current !== "result" && phase === "result";
    prevPhaseRef.current = phase;
    if (justFinished && champion(picks) && name.trim() && email.trim()) {
      void syncPrediction({ name, email, picks, phase });
    }
  }, [hydrated, phase, name, email, picks]);

  // Auto-sync on every pick change (debounced)
  const autoSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!hydrated || phase !== "predict") return;
    if (!name.trim() || !email.trim()) return;
    
    const pickedCount = Object.values(picks).filter(Boolean).length;
    if (pickedCount === 0) return;

    // Clear previous timeout
    if (autoSyncTimeoutRef.current) {
      clearTimeout(autoSyncTimeoutRef.current);
    }

    // Debounce auto-sync by 2 seconds
    autoSyncTimeoutRef.current = setTimeout(() => {
      setAutoSyncing(true);
      syncPrediction({ name, email, picks, phase })
        .then(() => {
          setAutoSyncing(false);
        })
        .catch(() => {
          setAutoSyncing(false);
        });
    }, 2000);

    return () => {
      if (autoSyncTimeoutRef.current) {
        clearTimeout(autoSyncTimeoutRef.current);
      }
    };
  }, [hydrated, phase, name, email, picks]);

  // Debug: log modal state
  useEffect(() => {
    console.log('showNameModal changed to:', showNameModal);
  }, [showNameModal]);

  const totalPicked = Object.values(picks).filter(Boolean).length;
  const progress = Math.round((totalPicked / 31) * 100);
  const champ = champion(picks);

  function handlePick(matchId: number, teamId: string) {
    setPicks((prev) => prunePicks({ ...prev, [matchId]: teamId }));
  }

  async function start() {
    console.log('=== START CLICKED ===');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Picks count:', Object.keys(picks).length);
    
    if (!email.trim()) {
      console.log('❌ No email provided');
      return;
    }
    
    setCheckingEmail(true);
    
    // ALWAYS check database first for cross-device sync
    console.log('🔍 Checking if email exists in database...');
    console.log('API URL:', `/api/predictions?email=${encodeURIComponent(email.trim())}`);
    
    try {
      const res = await fetch(`/api/predictions?email=${encodeURIComponent(email.trim())}`);
      console.log('API Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json() as { ok?: boolean; prediction?: PredictionRow | null };
        console.log('API Response data:', data);
        
        if (data.ok && data.prediction) {
          // Found existing prediction in database! Load it
          console.log('✅ Found existing prediction in cloud!');
          console.log('- Name:', data.prediction.name);
          console.log('- Email:', data.prediction.email);
          console.log('- Picks count:', data.prediction.picks_count);
          console.log('- Phase:', data.prediction.phase);
          
          // Update local state with cloud data
          setName(data.prediction.name);
          setPicks(data.prediction.picks);
          setPhase(data.prediction.phase === 'result' ? 'result' : 'predict');
          setCheckingEmail(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        } else {
          console.log('📝 No existing prediction found in cloud for this email');
        }
      } else {
        console.log('❌ API request failed with status:', res.status);
        const errorData = await res.text();
        console.log('Error response:', errorData);
      }
    } catch (err) {
      console.error('❌ Error checking email:', err);
    }
    
    // No cloud data found - check if we have local name
    if (name.trim()) {
      console.log('✅ No cloud data, but have local name. Going to predict phase');
      setCheckingEmail(false);
      setPhase("predict");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    // No cloud data, no local name - ask for name via modal
    const emailUser = email.split('@')[0];
    console.log('📝 Showing name modal, prefilling with:', emailUser);
    setNameModalInput(emailUser);
    setCheckingEmail(false);
    setShowNameModal(true);
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

  function handleLogout() {
    console.log('Logout initiated');
    
    // Clear all state
    setEmail("");
    setName("");
    setPicks({});
    setPhase("intro");
    setAutoSyncing(false);
    setShowLogoutConfirm(false);
    
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('✅ LocalStorage cleared');
    } catch (err) {
      console.error('Error clearing localStorage:', err);
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log('✅ Logged out successfully');
  }

  async function handleRefreshFromCloud() {
    if (!email || refreshing) return;
    
    setRefreshing(true);
    console.log('🔄 Manual refresh from cloud...');
    
    try {
      const res = await fetch(`/api/predictions?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json() as { ok?: boolean; prediction?: PredictionRow | null };
        if (data.ok && data.prediction) {
          console.log('✅ Loaded latest data from cloud');
          setName(data.prediction.name);
          setPicks(data.prediction.picks);
          setPhase(data.prediction.phase === 'result' ? 'result' : 'predict');
          
          // Update localStorage
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              name: data.prediction.name,
              email: data.prediction.email,
              picks: data.prediction.picks,
              phase: data.prediction.phase
            }));
          } catch {
            /* ignore */
          }
        }
      }
    } catch (err) {
      console.error('Error refreshing from cloud:', err);
    }
    
    setRefreshing(false);
  }

  function handleEmailModalSubmit() {
    setEmailModalError("");
    const trimmedEmail = emailModalInput.trim();
    
    if (!trimmedEmail) {
      setEmailModalError("Email is required to continue.");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailModalError("Please enter a valid email address.");
      return;
    }
    
    setEmail(trimmedEmail);
    setShowEmailModal(false);
    setEmailModalInput("");
  }

  function handleNameModalSubmit() {
    setNameModalError("");
    const trimmedName = nameModalInput.trim();
    
    if (!trimmedName) {
      setNameModalError("Name is required to continue.");
      return;
    }
    
    if (trimmedName.length < 2) {
      setNameModalError("Name must be at least 2 characters.");
      return;
    }
    
    setName(trimmedName);
    setShowNameModal(false);
    setNameModalInput("");
    setPhase("predict");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <>
        <main className={styles.shell}>
          <div className={`${styles.intro} ${styles.fadeIn}`}>
            <span className={styles.introTag}>FIFA World Cup 2026 · Knockout</span>
            <h1 className={styles.introTitle}>
              PREDICT{"\n"}THE BRACKET
            </h1>
            <p className={styles.introSub}>
              The Round of 32 is locked in. Call every knockout game from the last 32 all the way to the Final — then crown your champion and share it.
            </p>
            <div className={styles.nameRow}>
              <input
                className={styles.input}
                type="email"
                placeholder="Enter your email"
                value={email}
                maxLength={60}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && email.trim() && start()}
                autoComplete="email"
                autoFocus
              />
              <button
                className={styles.btn}
                onClick={() => void start()}
                disabled={!email.trim() || checkingEmail}
              >
                {checkingEmail ? "Checking..." : "Start →"}
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
              <>
                <button className={styles.linkbtn} onClick={() => setPhase("predict")}>
                  ↩ Resume your bracket ({progress}% done)
                </button>
                <SyncButton name={name} email={email} picks={picks} phase={phase} />
              </>
            )}
          </div>
        </main>

        {/* Name Modal */}
        {showNameModal && (
          <div className={styles.modalOverlay} onClick={(e) => {
            console.log('Modal overlay clicked');
            e.stopPropagation();
          }}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>👤 What&apos;s Your Name?</h2>
              <p className={styles.modalText}>
                Your name will be displayed on your bracket and used to identify your predictions.
              </p>
              <div className={styles.modalForm}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter your name"
                  value={nameModalInput}
                  maxLength={28}
                  onChange={(e) => setNameModalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNameModalSubmit()}
                  autoFocus
                />
                <button
                  className={styles.btn}
                  onClick={handleNameModalSubmit}
                >
                  Start Predicting →
                </button>
                {nameModalError && (
                  <p className={styles.modalError}>{nameModalError}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </>
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
          <SyncButton name={name} email={email} picks={picks} phase={phase} />
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
    <>
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
            {autoSyncing && (
              <span className={styles.autoSyncIndicator}>
                ☁ Syncing...
              </span>
            )}
            {!autoSyncing && (
              <button 
                className={styles.refreshBtn}
                onClick={() => void handleRefreshFromCloud()}
                disabled={refreshing}
                title="Refresh from cloud"
              >
                {refreshing ? "↻" : "🔄"}
              </button>
            )}
            <div className={styles.whoami}>
              <span>👤</span>
              <b>{name || "Player"}</b>
              <button className={styles.linkbtn} onClick={() => router.push("/edit")}>
                edit
              </button>
              <span className={styles.divider}>|</span>
              <button className={styles.linkbtn} onClick={() => setShowLogoutConfirm(true)}>
                logout
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

        <div className={styles.predictFoot}>
          {champ ? (
            <button
              className={styles.btn}
              onClick={() => {
                setPhase("result");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              👑 Crown champion & share
            </button>
          ) : (
            <span className={styles.hint}>
              Pick a winner in every match — the bracket fills in as you go.
            </span>
          )}
          <SyncButton name={name} email={email} picks={picks} phase={phase} compact />
        </div>
      </main>

      {/* Email Modal for Existing Users */}
      {showEmailModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>📧 Add Your Email</h2>
            <p className={styles.modalText}>
              We now require an email address to sync your predictions. This helps ensure unique identification and better data management.
            </p>
            <div className={styles.modalForm}>
              <input
                className={styles.input}
                type="email"
                placeholder="Enter your email"
                value={emailModalInput}
                maxLength={60}
                onChange={(e) => setEmailModalInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailModalSubmit()}
                autoFocus
              />
              <button
                className={styles.btn}
                onClick={handleEmailModalSubmit}
              >
                Continue
              </button>
              {emailModalError && (
                <p className={styles.modalError}>{emailModalError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Name Modal after Email */}
      {showNameModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>👤 What&apos;s Your Name?</h2>
            <p className={styles.modalText}>
              Your name will be displayed on your bracket and used to identify your predictions.
            </p>
            <div className={styles.modalForm}>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter your name"
                value={nameModalInput}
                maxLength={28}
                onChange={(e) => setNameModalInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameModalSubmit()}
                autoFocus
              />
              <button
                className={styles.btn}
                onClick={handleNameModalSubmit}
              >
                Start Predicting →
              </button>
              {nameModalError && (
                <p className={styles.modalError}>{nameModalError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>🚪 Logout</h2>
            <p className={styles.modalText}>
              Are you sure you want to logout? Your predictions are saved to the cloud with your email (<strong>{email}</strong>), so you can login again anytime.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnGhost}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.btnDanger}
                onClick={handleLogout}
              >
                Yes, Logout
              </button>
            </div>
            <p className={styles.hint}>
              💡 Tip: Your predictions will remain in the cloud. Login with the same email to access them.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
