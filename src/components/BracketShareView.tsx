"use client";

import { forwardRef } from "react";
import BracketTree from "./BracketTree";
import type { Picks } from "@/lib/bracket";
import styles from "./predictor.module.css";

type Props = {
  name: string;
  picks: Picks;
  champ?: string;
  onPick: (matchId: number, teamId: string) => void;
  onCrown: () => void;
};

const BracketShareView = forwardRef<HTMLDivElement, Props>(
  ({ name, picks, champ, onPick, onCrown }, ref) => {
    return (
      <div ref={ref} className={styles.bracketShareWrapper}>
        {/* Header with branding */}
        <div className={styles.bracketShareHeader}>
          <div className={styles.bracketShareBrand}>
            <span className={styles.bracketShareKicker}>WC26 · KNOCKOUT PREDICTOR</span>
            <span className={styles.bracketShareTitle}>ROAD TO THE FINAL</span>
          </div>
        </div>

        {/* The actual bracket */}
        <BracketTree
          picks={picks}
          onPick={onPick}
          champ={champ}
          onCrown={onCrown}
        />

        {/* Footer with user name */}
        <div className={styles.bracketShareFooter}>
          <div className={styles.bracketShareCredit}>
            <span className={styles.bracketShareBy}>PREDICTED BY</span>
            <span className={styles.bracketShareName}>{name || "Anonymous"}</span>
          </div>
          <div className={styles.bracketShareBrandmark}>
            <span>WC26</span>
            <span>PREDICTOR</span>
          </div>
        </div>
      </div>
    );
  }
);

BracketShareView.displayName = "BracketShareView";

export default BracketShareView;
