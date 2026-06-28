export type RoundId = "R32" | "R16" | "QF" | "SF" | "F";

export type RoundMeta = {
  id: RoundId;
  name: string;
  short: string;
};

export const ROUNDS: RoundMeta[] = [
  { id: "R32", name: "Round of 32", short: "R32" },
  { id: "R16", name: "Round of 16", short: "R16" },
  { id: "QF", name: "Quarter-finals", short: "QF" },
  { id: "SF", name: "Semi-finals", short: "SF" },
  { id: "F", name: "Final", short: "Final" },
];

/**
 * A match either has fixed teams (Round of 32) or feeds from the winners
 * of two earlier matches. `meta` carries the real-world fixture info.
 */
export type Match = {
  id: number;
  round: RoundId;
  team1?: string;
  team2?: string;
  from1?: number;
  from2?: number;
  /** Scheduled kickoff as an absolute UTC instant (ISO 8601). */
  kickoff?: string;
  /** Minutes after kickoff before picks lock (default 0 = lock at kickoff). */
  lockGraceMin?: number;
  meta?: { date: string; time: string; venue: string };
};

/**
 * 2026 FIFA World Cup knockout bracket — confirmed Round of 32.
 * Match numbers, pairings and bracket flow per the official schedule.
 */
export const MATCHES: Match[] = [
  // ---- Round of 32 ---- (kickoff converted from local time + UTC offset)
  { id: 73, round: "R32", team1: "rsa", team2: "can", kickoff: "2026-06-28T19:00:00Z", lockGraceMin: 65, meta: { date: "Jun 28", time: "12:00 PT", venue: "SoFi Stadium · Inglewood" } },
  { id: 74, round: "R32", team1: "ger", team2: "par", kickoff: "2026-06-29T20:30:00Z", meta: { date: "Jun 29", time: "16:30 ET", venue: "Gillette Stadium · Foxborough" } },
  { id: 75, round: "R32", team1: "ned", team2: "mar", kickoff: "2026-06-30T01:00:00Z", meta: { date: "Jun 29", time: "19:00 CT", venue: "Estadio BBVA · Guadalupe" } },
  { id: 76, round: "R32", team1: "bra", team2: "jpn", kickoff: "2026-06-29T17:00:00Z", meta: { date: "Jun 29", time: "12:00 CT", venue: "NRG Stadium · Houston" } },
  { id: 77, round: "R32", team1: "fra", team2: "swe", kickoff: "2026-06-30T21:00:00Z", meta: { date: "Jun 30", time: "17:00 ET", venue: "MetLife Stadium · East Rutherford" } },
  { id: 78, round: "R32", team1: "civ", team2: "nor", kickoff: "2026-06-30T17:00:00Z", meta: { date: "Jun 30", time: "12:00 CT", venue: "AT&T Stadium · Arlington" } },
  { id: 79, round: "R32", team1: "mex", team2: "ecu", kickoff: "2026-07-01T01:00:00Z", meta: { date: "Jun 30", time: "19:00 CT", venue: "Estadio Azteca · Mexico City" } },
  { id: 80, round: "R32", team1: "eng", team2: "cod", kickoff: "2026-07-01T16:00:00Z", meta: { date: "Jul 1", time: "12:00 ET", venue: "Mercedes-Benz Stadium · Atlanta" } },
  { id: 81, round: "R32", team1: "usa", team2: "bih", kickoff: "2026-07-02T00:00:00Z", meta: { date: "Jul 1", time: "17:00 PT", venue: "Levi's Stadium · Santa Clara" } },
  { id: 82, round: "R32", team1: "bel", team2: "sen", kickoff: "2026-07-01T20:00:00Z", meta: { date: "Jul 1", time: "13:00 PT", venue: "Lumen Field · Seattle" } },
  { id: 83, round: "R32", team1: "por", team2: "cro", kickoff: "2026-07-02T23:00:00Z", meta: { date: "Jul 2", time: "19:00 ET", venue: "BMO Field · Toronto" } },
  { id: 84, round: "R32", team1: "esp", team2: "aut", kickoff: "2026-07-02T19:00:00Z", meta: { date: "Jul 2", time: "12:00 PT", venue: "SoFi Stadium · Inglewood" } },
  { id: 85, round: "R32", team1: "sui", team2: "alg", kickoff: "2026-07-03T03:00:00Z", meta: { date: "Jul 2", time: "20:00 PT", venue: "BC Place · Vancouver" } },
  { id: 86, round: "R32", team1: "arg", team2: "cpv", kickoff: "2026-07-03T22:00:00Z", meta: { date: "Jul 3", time: "18:00 ET", venue: "Hard Rock Stadium · Miami Gardens" } },
  { id: 87, round: "R32", team1: "col", team2: "gha", kickoff: "2026-07-04T01:30:00Z", meta: { date: "Jul 3", time: "20:30 CT", venue: "Arrowhead Stadium · Kansas City" } },
  { id: 88, round: "R32", team1: "aus", team2: "egy", kickoff: "2026-07-03T18:00:00Z", meta: { date: "Jul 3", time: "13:00 CT", venue: "AT&T Stadium · Arlington" } },

  // ---- Round of 16 ----
  { id: 90, round: "R16", from1: 73, from2: 75, kickoff: "2026-07-04T17:00:00Z", meta: { date: "Jul 4", time: "12:00 CT", venue: "Round of 16" } },
  { id: 89, round: "R16", from1: 74, from2: 77, kickoff: "2026-07-04T21:00:00Z", meta: { date: "Jul 4", time: "17:00 ET", venue: "Round of 16" } },
  { id: 91, round: "R16", from1: 76, from2: 78, kickoff: "2026-07-05T20:00:00Z", meta: { date: "Jul 5", time: "16:00 ET", venue: "Round of 16" } },
  { id: 92, round: "R16", from1: 79, from2: 80, kickoff: "2026-07-06T00:00:00Z", meta: { date: "Jul 5", time: "18:00 CT", venue: "Round of 16" } },
  { id: 93, round: "R16", from1: 83, from2: 84, kickoff: "2026-07-06T19:00:00Z", meta: { date: "Jul 6", time: "14:00 CT", venue: "Round of 16" } },
  { id: 94, round: "R16", from1: 81, from2: 82, kickoff: "2026-07-07T00:00:00Z", meta: { date: "Jul 6", time: "17:00 PT", venue: "Round of 16" } },
  { id: 95, round: "R16", from1: 86, from2: 88, kickoff: "2026-07-07T16:00:00Z", meta: { date: "Jul 7", time: "12:00 ET", venue: "Round of 16" } },
  { id: 96, round: "R16", from1: 85, from2: 87, kickoff: "2026-07-07T20:00:00Z", meta: { date: "Jul 7", time: "13:00 PT", venue: "Round of 16" } },

  // ---- Quarter-finals ----
  { id: 97, round: "QF", from1: 89, from2: 90, kickoff: "2026-07-09T20:00:00Z", meta: { date: "Jul 9", time: "16:00 ET", venue: "Quarter-final" } },
  { id: 98, round: "QF", from1: 93, from2: 94, kickoff: "2026-07-10T19:00:00Z", meta: { date: "Jul 10", time: "12:00 PT", venue: "Quarter-final" } },
  { id: 99, round: "QF", from1: 91, from2: 92, kickoff: "2026-07-11T21:00:00Z", meta: { date: "Jul 11", time: "17:00 ET", venue: "Quarter-final" } },
  { id: 100, round: "QF", from1: 95, from2: 96, kickoff: "2026-07-12T01:00:00Z", meta: { date: "Jul 11", time: "20:00 CT", venue: "Quarter-final" } },

  // ---- Semi-finals ----
  { id: 101, round: "SF", from1: 97, from2: 98, kickoff: "2026-07-14T19:00:00Z", meta: { date: "Jul 14", time: "14:00 CT", venue: "Semi-final" } },
  { id: 102, round: "SF", from1: 99, from2: 100, kickoff: "2026-07-15T19:00:00Z", meta: { date: "Jul 15", time: "15:00 ET", venue: "Semi-final" } },

  // ---- Final ----
  { id: 104, round: "F", from1: 101, from2: 102, kickoff: "2026-07-19T19:00:00Z", meta: { date: "Jul 19", time: "15:00 ET", venue: "MetLife Stadium · Final" } },
];

export const MATCH_BY_ID: Record<number, Match> = Object.fromEntries(
  MATCHES.map((m) => [m.id, m])
);

export function matchesForRound(round: RoundId): Match[] {
  return MATCHES.filter((m) => m.round === round);
}

export type Picks = Record<number, string | undefined>;

/** Resolve the two competing team ids for a match given current picks. */
export function resolveTeams(
  match: Match,
  picks: Picks
): { team1?: string; team2?: string } {
  if (match.round === "R32") {
    return { team1: match.team1, team2: match.team2 };
  }
  return {
    team1: match.from1 != null ? picks[match.from1] : undefined,
    team2: match.from2 != null ? picks[match.from2] : undefined,
  };
}

/** When a pick changes, any downstream picks that are no longer valid are cleared. */
export function prunePicks(picks: Picks): Picks {
  const next: Picks = { ...picks };
  // Process rounds in order so upstream resolves before downstream.
  for (const round of ["R16", "QF", "SF", "F"] as RoundId[]) {
    for (const match of matchesForRound(round)) {
      const { team1, team2 } = resolveTeams(match, next);
      const valid = [team1, team2].filter(Boolean) as string[];
      if (next[match.id] && !valid.includes(next[match.id]!)) {
        next[match.id] = undefined;
      }
    }
  }
  return next;
}

export function isRoundComplete(round: RoundId, picks: Picks): boolean {
  return matchesForRound(round).every((m) => Boolean(picks[m.id]));
}

export function champion(picks: Picks): string | undefined {
  return picks[104];
}

/* ------------------------------------------------------------------ */
/* Time-based locking                                                  */
/* ------------------------------------------------------------------ */

/** A match is considered "live" for roughly this long after kickoff. */
export const LIVE_WINDOW_MS = 115 * 60 * 1000;

export type MatchStatus = "upcoming" | "live" | "finished";

export function kickoffMs(match: Match): number | null {
  if (!match.kickoff) return null;
  const t = Date.parse(match.kickoff);
  return Number.isNaN(t) ? null : t;
}

/**
 * Picks lock at kickoff by default. A match may set `lockGraceMin` to stay
 * open for some minutes into the game (e.g. RSA vs CAN allows 65 min).
 */
export function isLocked(match: Match, now: number): boolean {
  const ko = kickoffMs(match);
  if (ko == null) return false;
  const graceMs = (match.lockGraceMin ?? 0) * 60 * 1000;
  return now >= ko + graceMs;
}

export function isLive(match: Match, now: number): boolean {
  const ko = kickoffMs(match);
  return ko != null && now >= ko && now < ko + LIVE_WINDOW_MS;
}

export function matchStatus(match: Match, now: number): MatchStatus {
  const ko = kickoffMs(match);
  if (ko == null || now < ko) return "upcoming";
  if (now < ko + LIVE_WINDOW_MS) return "live";
  return "finished";
}

/** Matches currently in their live window, soonest kickoff first. */
export function liveMatches(now: number): Match[] {
  return MATCHES.filter((m) => isLive(m, now)).sort(
    (a, b) => (kickoffMs(a) ?? 0) - (kickoffMs(b) ?? 0),
  );
}
