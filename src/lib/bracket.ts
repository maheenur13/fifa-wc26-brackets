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
  meta?: { date: string; time: string; venue: string };
};

/**
 * 2026 FIFA World Cup knockout bracket — confirmed Round of 32.
 * Match numbers, pairings and bracket flow per the official schedule.
 */
export const MATCHES: Match[] = [
  // ---- Round of 32 ----
  { id: 73, round: "R32", team1: "rsa", team2: "can", meta: { date: "Jun 28", time: "12:00 PT", venue: "SoFi Stadium · Inglewood" } },
  { id: 74, round: "R32", team1: "ger", team2: "par", meta: { date: "Jun 29", time: "16:30 ET", venue: "Gillette Stadium · Foxborough" } },
  { id: 75, round: "R32", team1: "ned", team2: "mar", meta: { date: "Jun 29", time: "19:00 CT", venue: "Estadio BBVA · Guadalupe" } },
  { id: 76, round: "R32", team1: "bra", team2: "jpn", meta: { date: "Jun 29", time: "12:00 CT", venue: "NRG Stadium · Houston" } },
  { id: 77, round: "R32", team1: "fra", team2: "swe", meta: { date: "Jun 30", time: "17:00 ET", venue: "MetLife Stadium · East Rutherford" } },
  { id: 78, round: "R32", team1: "civ", team2: "nor", meta: { date: "Jun 30", time: "12:00 CT", venue: "AT&T Stadium · Arlington" } },
  { id: 79, round: "R32", team1: "mex", team2: "ecu", meta: { date: "Jun 30", time: "19:00 CT", venue: "Estadio Azteca · Mexico City" } },
  { id: 80, round: "R32", team1: "eng", team2: "cod", meta: { date: "Jul 1", time: "12:00 ET", venue: "Mercedes-Benz Stadium · Atlanta" } },
  { id: 81, round: "R32", team1: "usa", team2: "bih", meta: { date: "Jul 1", time: "17:00 PT", venue: "Levi's Stadium · Santa Clara" } },
  { id: 82, round: "R32", team1: "bel", team2: "sen", meta: { date: "Jul 1", time: "13:00 PT", venue: "Lumen Field · Seattle" } },
  { id: 83, round: "R32", team1: "por", team2: "cro", meta: { date: "Jul 2", time: "19:00 ET", venue: "BMO Field · Toronto" } },
  { id: 84, round: "R32", team1: "esp", team2: "aut", meta: { date: "Jul 2", time: "12:00 PT", venue: "SoFi Stadium · Inglewood" } },
  { id: 85, round: "R32", team1: "sui", team2: "alg", meta: { date: "Jul 2", time: "20:00 PT", venue: "BC Place · Vancouver" } },
  { id: 86, round: "R32", team1: "arg", team2: "cpv", meta: { date: "Jul 3", time: "18:00 ET", venue: "Hard Rock Stadium · Miami Gardens" } },
  { id: 87, round: "R32", team1: "col", team2: "gha", meta: { date: "Jul 3", time: "20:30 CT", venue: "Arrowhead Stadium · Kansas City" } },
  { id: 88, round: "R32", team1: "aus", team2: "egy", meta: { date: "Jul 3", time: "13:00 CT", venue: "AT&T Stadium · Arlington" } },

  // ---- Round of 16 ----
  { id: 90, round: "R16", from1: 73, from2: 75 },
  { id: 89, round: "R16", from1: 74, from2: 77 },
  { id: 91, round: "R16", from1: 76, from2: 78 },
  { id: 92, round: "R16", from1: 79, from2: 80 },
  { id: 93, round: "R16", from1: 83, from2: 84 },
  { id: 94, round: "R16", from1: 81, from2: 82 },
  { id: 95, round: "R16", from1: 86, from2: 88 },
  { id: 96, round: "R16", from1: 85, from2: 87 },

  // ---- Quarter-finals ----
  { id: 97, round: "QF", from1: 89, from2: 90 },
  { id: 98, round: "QF", from1: 93, from2: 94 },
  { id: 99, round: "QF", from1: 91, from2: 92 },
  { id: 100, round: "QF", from1: 95, from2: 96 },

  // ---- Semi-finals ----
  { id: 101, round: "SF", from1: 97, from2: 98 },
  { id: 102, round: "SF", from1: 99, from2: 100 },

  // ---- Final ----
  { id: 104, round: "F", from1: 101, from2: 102 },
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
