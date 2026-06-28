"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STORAGE_KEY } from "@/lib/storage";
import styles from "./predictor.module.css";

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load current user data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.email) setEmail(saved.email);
        if (saved.name) setName(saved.name);
      } else {
        // No user data, redirect to home
        router.push("/");
        return;
      }
    } catch {
      router.push("/");
      return;
    }
    setLoading(false);
  }, [router]);

  function handleSave() {
    if (!name.trim()) return;
    
    setSaving(true);
    
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        saved.name = name.trim();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    }
    
    setSaving(false);
    router.push("/");
  }

  function handleLogout() {
    // Clear all state
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("✅ LocalStorage cleared");
    } catch (err) {
      console.error("Error clearing localStorage:", err);
    }
    
    // Redirect to home
    router.push("/");
  }

  function handleCancel() {
    router.push("/");
  }

  if (loading) {
    return <div className={styles.shell} aria-busy="true" />;
  }

  return (
    <>
      <main className={styles.shell}>
        <div className={`${styles.intro} ${styles.fadeIn}`}>
          <span className={styles.introTag}>FIFA World Cup 2026 · Profile</span>
          <h1 className={styles.introTitle}>EDIT{"\n"}PROFILE</h1>
          <p className={styles.introSub}>
            Update your name. Your email is locked as it's used to identify your predictions across devices.
          </p>
          
          <div className={styles.nameRow}>
            <div className={styles.lockedField}>
              <label className={styles.fieldLabel}>Email (locked)</label>
              <div className={styles.lockedInput}>
                🔒 {email}
              </div>
            </div>
            
            <div className={styles.editField}>
              <label className={styles.fieldLabel}>Your Name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter your name"
                value={name}
                maxLength={28}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && handleSave()}
                autoComplete="name"
                autoFocus
              />
            </div>
            
            <div className={styles.editActions}>
              <button
                className={styles.btn}
                onClick={handleSave}
                disabled={!name.trim() || saving}
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
              
              <button
                className={styles.btnGhost}
                onClick={handleCancel}
              >
                ← Back to Bracket
              </button>
            </div>
          </div>

          <div className={styles.logoutSection}>
            <button 
              className={styles.logoutBtn}
              onClick={() => setShowLogoutConfirm(true)}
            >
              🚪 Logout
            </button>
            <p className={styles.logoutHint}>
              Your predictions are saved in the cloud with your email.
            </p>
          </div>
        </div>
      </main>

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
