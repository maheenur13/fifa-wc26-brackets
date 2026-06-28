"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MATCH_BY_ID,
  resolveTeams,
  isLocked,
  isLive,
  type Match,
  type Picks,
} from "@/lib/bracket";
import { getTeam } from "@/lib/teams";
import styles from "./predictor.module.css";

type Props = {
  picks: Picks;
  onPick: (matchId: number, teamId: string) => void;
  champ?: string;
  onCrown: () => void;
  /** Current time (ms) for kickoff-based locking; 0 disables locking. */
  now?: number;
  /** Static, full-size render for screenshot export (no scroll/zoom/toolbar). */
  capture?: boolean;
};

/** Walk a sub-tree from a root match into per-round levels (root → leaves). */
function levelsFrom(rootId: number): number[][] {
  const childrenOf = (id: number): number[] => {
    const m = MATCH_BY_ID[id];
    return m.from1 != null && m.from2 != null ? [m.from1, m.from2] : [];
  };
  const levels: number[][] = [];
  let cur = [rootId];
  while (cur.length) {
    levels.push(cur);
    const next = cur.flatMap(childrenOf);
    if (!next.length) break;
    cur = next;
  }
  return levels; // [SF],[QF],[R16],[R32]
}

type Conn = { child: number; parent: number; side: "left" | "right" };

function connectionsFor(rootId: number, side: "left" | "right"): Conn[] {
  const out: Conn[] = [];
  const levels = levelsFrom(rootId);
  // every level except the last (R32) has children to connect
  for (let i = 0; i < levels.length - 1; i++) {
    for (const parent of levels[i]) {
      const m = MATCH_BY_ID[parent];
      [m.from1, m.from2].forEach((child) => {
        if (child != null) out.push({ child, parent, side });
      });
    }
  }
  return out;
}

/** Rounded-elbow path: horizontal → vertical → horizontal with arc corners. */
function elbow(
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  radius = 9
): string {
  if (Math.abs(ey - sy) < 1) return `M ${sx} ${sy} L ${ex} ${ey}`;
  const mx = (sx + ex) / 2;
  const hx1 = Math.sign(mx - sx) || 1;
  const vy = Math.sign(ey - sy) || 1;
  const hx2 = Math.sign(ex - mx) || 1;
  const r = Math.min(radius, Math.abs(mx - sx), Math.abs(ey - sy) / 2);
  return [
    `M ${sx} ${sy}`,
    `L ${mx - hx1 * r} ${sy}`,
    `Q ${mx} ${sy} ${mx} ${sy + vy * r}`,
    `L ${mx} ${ey - vy * r}`,
    `Q ${mx} ${ey} ${mx + hx2 * r} ${ey}`,
    `L ${ex} ${ey}`,
  ].join(" ");
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="9"
      height="9"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CompactMatch({
  match,
  picks,
  onPick,
  emphasize,
  pulse,
  now = 0,
}: {
  match: Match;
  picks: Picks;
  onPick: (matchId: number, teamId: string) => void;
  emphasize?: boolean;
  pulse?: boolean;
  now?: number;
}) {
  const { team1, team2 } = resolveTeams(match, picks);
  const ready = Boolean(team1 && team2);
  const picked = picks[match.id];
  const locked = now > 0 && isLocked(match, now);
  const live = now > 0 && isLive(match, now);

  const renderRow = (teamId?: string) => {
    if (!teamId) {
      return (
        <div className={`${styles.crow} ${styles.ctbdRow}`}>
          <span className={styles.ctbdDot} />
          <span className={`${styles.ccode} ${styles.cawait}`}>TBD</span>
        </div>
      );
    }
    const team = getTeam(teamId);
    const isPicked = picked === teamId;
    const cls = [
      styles.crow,
      isPicked ? styles.cpicked : "",
      picked && !isPicked ? styles.cdimmed : "",
      !ready ? styles.cdisabled : "",
      locked ? styles.clocked : "",
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button
        type="button"
        className={cls}
        disabled={!ready || locked}
        onClick={() => onPick(match.id, teamId)}
        aria-pressed={isPicked}
        title={locked ? `${team.name} — locked at kickoff` : team.name}
      >
        <span className={styles.cflag}>{team.flag}</span>
        <span className={styles.ccode}>{team.code}</span>
        {isPicked && (
          <span className={styles.ccheck}>
            <CheckIcon />
          </span>
        )}
      </button>
    );
  };

  const cardCls = [
    styles.cmatch,
    emphasize ? styles.cmatchBig : "",
    picked ? styles.cdecided : "",
    pulse && !locked ? styles.cpulse : "",
    live ? styles.cmatchLive : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardCls} data-mid={match.id}>
      {live && <span className={styles.liveBadge}>● LIVE</span>}
      {locked && !live && <span className={styles.lockBadge}>🔒</span>}
      {renderRow(team1)}
      {renderRow(team2)}
    </div>
  );
}

export default function BracketTree({
  picks,
  onPick,
  champ,
  onCrown,
  now = 0,
  capture = false,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [size, setSize] = useState({ w: 0, h: 940 });
  const [scale, setScale] = useState(1);
  const [autoFit, setAutoFit] = useState(!capture);

  const leftLevels = levelsFrom(101); // [SF],[QF],[R16],[R32]
  const rightLevels = levelsFrom(102);
  const leftColumns = [...leftLevels].reverse(); // R32 → SF (left to right)
  const rightColumns = rightLevels; // SF → R32 (left to right, center-out)

  const connections = useMemo<Conn[]>(
    () => [
      ...connectionsFor(101, "left"),
      ...connectionsFor(102, "right"),
      { child: 101, parent: 104, side: "left" },
      { child: 102, parent: 104, side: "right" },
    ],
    []
  );

  const recompute = useCallback(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const W = inner.offsetWidth;
    const H = inner.offsetHeight;
    setSize({ w: W, h: H });

    const cardOf = (id: number) =>
      inner.querySelector<HTMLElement>(`[data-mid="${id}"]`);

    const next: string[] = [];
    for (const c of connections) {
      const childEl = cardOf(c.child);
      const parentEl = cardOf(c.parent);
      if (!childEl || !parentEl) continue;
      const cx = childEl.offsetLeft;
      const cy = childEl.offsetTop;
      const cw = childEl.offsetWidth;
      const ch = childEl.offsetHeight;
      const px = parentEl.offsetLeft;
      const py = parentEl.offsetTop;
      const pw = parentEl.offsetWidth;
      const ph = parentEl.offsetHeight;

      if (c.side === "left") {
        // child on the left, parent on the right
        next.push(
          elbow(cx + cw, cy + ch / 2, px, py + ph / 2)
        );
      } else {
        // child on the right, parent on the left
        next.push(
          elbow(cx, cy + ch / 2, px + pw, py + ph / 2)
        );
      }
    }
    setPaths(next);
  }, [connections]);

  // Measure after layout + on resize / font load.
  useLayoutEffect(() => {
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picks]);

  useEffect(() => {
    recompute();
    const ro = new ResizeObserver(() => recompute());
    if (innerRef.current) ro.observe(innerRef.current);
    if (document.fonts?.ready) document.fonts.ready.then(() => recompute());
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fit width on first measure and on viewport resize.
  const fit = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp || !size.w) return;
    const usable = vp.clientWidth - 8;
    // Fit the whole bracket to width; allow a smaller floor on phones so the
    // entire tree is visible at a glance (overview-first), then zoom in.
    const floor = vp.clientWidth < 700 ? 0.2 : 0.32;
    const s = Math.min(1.1, Math.max(floor, usable / size.w));
    setScale(s);
  }, [size.w]);

  useEffect(() => {
    if (autoFit) fit();
  }, [autoFit, fit]);

  useEffect(() => {
    const onResize = () => autoFit && fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [autoFit, fit]);

  const zoom = (delta: number) => {
    setAutoFit(false);
    setScale((s) => Math.min(1.6, Math.max(0.3, +(s + delta).toFixed(2))));
  };

  // First-visit affordance: pulse the very first match until a pick is made.
  const anyPick = Object.values(picks).some(Boolean);
  const pulseId = anyPick ? -1 : leftColumns[0]?.[0];

  // Champion's route: connectors where the champ won both ends light up gold.
  const goldSet = connections.map((c) =>
    Boolean(champ && picks[c.child] === champ && picks[c.parent] === champ)
  );

  const renderColumn = (ids: number[], key: string) => (
    <div className={styles.col} key={key}>
      {ids.map((id) => (
        <CompactMatch
          key={id}
          match={MATCH_BY_ID[id]}
          picks={picks}
          onPick={onPick}
          pulse={id === pulseId}
          now={now}
        />
      ))}
    </div>
  );

  return (
    <div className={styles.bracketWrap}>
      {!capture && (
        <div className={styles.bracketBar}>
          <span className={styles.bracketHint}>
            Tap a team to advance it. <b>Pinch / drag</b> to explore the bracket.
          </span>
          <div className={styles.zoomBtns}>
            <button
              className={`${styles.zoomBtn} ${styles.zoomFit}`}
              onClick={() => setAutoFit(true)}
            >
              Fit
            </button>
            <button className={styles.zoomBtn} onClick={() => zoom(-0.15)} aria-label="Zoom out">
              −
            </button>
            <button className={styles.zoomBtn} onClick={() => zoom(0.15)} aria-label="Zoom in">
              +
            </button>
          </div>
        </div>
      )}

      <div
        className={styles.viewport}
        ref={viewportRef}
        style={
          capture
            ? { height: "auto", overflow: "visible", cursor: "default" }
            : { height: `min(78vh, ${Math.max(280, size.h * scale + 8)}px)` }
        }
      >
        <div
          className={styles.sizer}
          style={{ width: size.w * scale, height: size.h * scale }}
        >
          <div
            className={styles.inner}
            ref={innerRef}
            style={{ transform: `scale(${scale})` }}
          >
            <svg
              className={styles.connSvg}
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}
              fill="none"
            >
              <defs>
                <linearGradient id="connGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#15c06a" />
                  <stop offset="100%" stopColor="#2a7bff" />
                </linearGradient>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffe08a" />
                  <stop offset="100%" stopColor="#f5a623" />
                </linearGradient>
                <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="2.4"
                    floodColor="#ffc83d"
                    floodOpacity="0.9"
                  />
                </filter>
              </defs>

              {/* base connectors */}
              {paths.map((d, i) =>
                goldSet[i] ? null : (
                  <path
                    key={i}
                    d={d}
                    stroke="url(#connGrad)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                )
              )}
              {/* champion's golden route, drawn on top */}
              {paths.map((d, i) =>
                goldSet[i] ? (
                  <path
                    key={`g${i}`}
                    d={d}
                    stroke="url(#goldGrad)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    filter="url(#goldGlow)"
                  />
                ) : null
              )}
            </svg>

            <div className={styles.cols}>
              {/* Left half: R32 → SF */}
              {leftColumns.map((ids, i) => renderColumn(ids, `L${i}`))}

              {/* Center: Final + champion */}
              <div className={styles.centerCol}>
                <div className={styles.finalLabel}>★ The Final ★</div>
                <div className={styles.finalCard}>
                  <CompactMatch
                    match={MATCH_BY_ID[104]}
                    picks={picks}
                    onPick={onPick}
                    emphasize
                    now={now}
                  />
                </div>
                {champ && (
                  <div className={`${styles.crownCard} ${styles.pop}`}>
                    <button className={styles.crownBtn} onClick={onCrown}>
                      👑 Crown Champion
                    </button>
                    <div className={styles.crownName}>
                      <span className={styles.cflag}>{getTeam(champ).flag}</span>
                      {getTeam(champ).name}
                    </div>
                    <span className={styles.crownTip}>Tap to view & share →</span>
                  </div>
                )}
              </div>

              {/* Right half: SF → R32 */}
              {rightColumns.map((ids, i) => renderColumn(ids, `R${i}`))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
