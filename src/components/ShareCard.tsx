"use client";

import { forwardRef } from "react";
import { getTeam } from "@/lib/teams";
import {
  MATCHES,
  ROUNDS,
  resolveTeams,
  type Picks,
} from "@/lib/bracket";
import styles from "./predictor.module.css";

const ROUND_LABEL: Record<string, string> = {
  R32: "R32",
  R16: "R16",
  QF: "QF",
  SF: "SF",
  F: "FINAL",
};

function championPath(picks: Picks, champ: string) {
  const path: { round: string; opponent?: string }[] = [];
  for (const round of ROUNDS) {
    const match = MATCHES.find(
      (m) => m.round === round.id && picks[m.id] === champ
    );
    if (!match) continue;
    const { team1, team2 } = resolveTeams(match, picks);
    const opponent = team1 === champ ? team2 : team1;
    path.push({ round: round.id, opponent });
  }
  return path;
}

type Props = { name: string; picks: Picks; champ: string };

const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { name, picks, champ },
  ref
) {
  const team = getTeam(champ);
  const path = championPath(picks, champ);
  const displayName = name.trim() || "Anonymous";

  return (
    <div className={styles.shareCard} ref={ref}>
      <div className={styles.shareGrid} />

      <div className={styles.shareHead}>
        <div className={styles.shareKicker}>FIFA World Cup 2026</div>
        <div className={styles.shareTitle}>My Winner Prediction</div>
      </div>

      <div className={styles.championWrap}>
        <div className={styles.championLabel}>★ Champion ★</div>
        <div className={styles.championFlag}>{team.flag}</div>
        <div className={styles.championName}>{team.name}</div>
        <div className={styles.trophyRow}>🏆 ⚽ 🏆</div>
      </div>

      <div className={styles.pathTitle}>Road to glory</div>
      <div className={styles.pathList}>
        {path.map((p) => (
          <div className={styles.pathRow} key={p.round}>
            <span className={styles.pathRound}>{ROUND_LABEL[p.round]}</span>
            <span className={styles.pathTeam}>
              <span>{team.flag}</span>
              {team.name}
            </span>
            {p.opponent && (
              <span className={styles.pathBeat}>
                beat {getTeam(p.opponent).flag} {getTeam(p.opponent).name}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.watermark}>
        <div className={styles.wmName}>
          <span className={styles.wmBy}>Predicted by</span>
          <span className={styles.wmUser}>{displayName}</span>
        </div>
        <div className={styles.wmBrand}>
          <b>WC26 PREDICTOR</b>
          App by @maheenur13
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
