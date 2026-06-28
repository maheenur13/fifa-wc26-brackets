"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { PredictionRow } from "@/lib/predictions";
import { champion } from "@/lib/bracket";
import ShareCard from "./ShareCard";
import BracketShareView from "./BracketShareView";
import styles from "./predictor.module.css";

type Props = {
  prediction: PredictionRow;
};

export default function ShareView({ prediction }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState<"card" | "bracket">("card");
  const shareRef = useRef<HTMLDivElement>(null);
  const bracketShareRef = useRef<HTMLDivElement>(null);
  
  const champ = champion(prediction.picks);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  async function download() {
    setShareError(false);
    setDownloading(true);
    
    const targetRef = screenshotMode === "bracket" ? bracketShareRef.current : shareRef.current;
    
    if (!targetRef) {
      console.error("Target ref not available");
      setDownloading(false);
      return;
    }
    
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      
      // For bracket, wait a bit for layout
      if (screenshotMode === "bracket") {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const node = targetRef;
      const actualWidth = Math.max(node.scrollWidth, node.offsetWidth);
      const actualHeight = Math.max(node.scrollHeight, node.offsetHeight);
      
      const render = toPng(node, {
        pixelRatio: 3,
        backgroundColor: screenshotMode === "bracket" ? "#0a1230" : "#060418",
        width: actualWidth,
        height: actualHeight,
        cacheBust: true,
      });
      
      const dataUrl = await Promise.race([
        render,
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("render-timeout")), 25000)
        ),
      ]);
      
      const link = document.createElement("a");
      const safe = prediction.name.replace(/[^a-z0-9]+/gi, "-");
      const type = screenshotMode === "bracket" ? "bracket" : "card";
      link.download = `wc26-${safe}-${type}-${champ ?? "prediction"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Screenshot failed", err);
      setShareError(true);
    } finally {
      setDownloading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      alert("Link copied to clipboard!");
    }
  }

  return (
    <>
      <main className={styles.shell}>
        <div className={`${styles.result} ${styles.fadeIn}`}>
          <div className={styles.shareViewHeader}>
            <h1 className={styles.shareViewTitle}>
              {prediction.name}&apos;s Prediction
            </h1>
            <p className={styles.shareViewSub}>
              FIFA World Cup 2026 Knockout Stage
            </p>
          </div>

          <ShareCard ref={shareRef} name={prediction.name} picks={prediction.picks} champ={champ!} />
          
          {/* Hidden bracket for screenshots */}
          <div style={{ 
            position: 'fixed', 
            left: '0',
            top: '0',
            zIndex: -9999,
            opacity: 0.01,
            pointerEvents: 'none',
            width: 'auto',
            minWidth: '2000px'
          }}>
            <BracketShareView
              ref={bracketShareRef}
              name={prediction.name}
              picks={prediction.picks}
              champ={champ}
              onPick={() => {}}
              onCrown={() => {}}
            />
          </div>

          <div className={styles.shareViewActions}>
            <button 
              className={styles.btn} 
              onClick={() => {
                setScreenshotMode("card");
                download();
              }} 
              disabled={downloading}
            >
              {downloading && screenshotMode === "card" ? "Rendering…" : "📸 Save Card"}
            </button>
            <button 
              className={styles.btn} 
              onClick={() => {
                setScreenshotMode("bracket");
                download();
              }} 
              disabled={downloading}
            >
              {downloading && screenshotMode === "bracket" ? "Rendering…" : "🗂️ Save Bracket"}
            </button>
            <button className={styles.btnGhost} onClick={copyLink}>
              🔗 Copy Link
            </button>
            <a href="/" className={styles.btnGhost} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              🏠 Make Your Own
            </a>
          </div>

          <p className={styles.hint}>
            {shareError
              ? "Couldn't generate the image — please try again."
              : "Share this link with friends or save the images!"}
          </p>
        </div>
      </main>
    </>
  );
}
