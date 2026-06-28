export type Team = {
  id: string;
  name: string;
  /** ISO-ish short code shown on compact cards */
  code: string;
  /** Emoji flag — renders crisply and screenshots cleanly */
  flag: string;
  /** Accent color used for glow / gradient treatment */
  color: string;
};

/**
 * 2026 FIFA World Cup — the 32 teams confirmed for the Round of 32.
 * Source: 2026 FIFA World Cup knockout stage (Wikipedia), confirmed 2026-06-28.
 */
export const TEAMS: Record<string, Team> = {
  rsa: { id: "rsa", name: "South Africa", code: "RSA", flag: "🇿🇦", color: "#007a4d" },
  can: { id: "can", name: "Canada", code: "CAN", flag: "🇨🇦", color: "#ff3b3b" },
  bra: { id: "bra", name: "Brazil", code: "BRA", flag: "🇧🇷", color: "#ffdf00" },
  jpn: { id: "jpn", name: "Japan", code: "JPN", flag: "🇯🇵", color: "#ff4d6d" },
  ger: { id: "ger", name: "Germany", code: "GER", flag: "🇩🇪", color: "#f5f5f5" },
  par: { id: "par", name: "Paraguay", code: "PAR", flag: "🇵🇾", color: "#ff5252" },
  ned: { id: "ned", name: "Netherlands", code: "NED", flag: "🇳🇱", color: "#ff7a00" },
  mar: { id: "mar", name: "Morocco", code: "MAR", flag: "🇲🇦", color: "#e63946" },
  civ: { id: "civ", name: "Ivory Coast", code: "CIV", flag: "🇨🇮", color: "#ff8c2b" },
  nor: { id: "nor", name: "Norway", code: "NOR", flag: "🇳🇴", color: "#5b8cff" },
  fra: { id: "fra", name: "France", code: "FRA", flag: "🇫🇷", color: "#3a86ff" },
  swe: { id: "swe", name: "Sweden", code: "SWE", flag: "🇸🇪", color: "#ffcf33" },
  mex: { id: "mex", name: "Mexico", code: "MEX", flag: "🇲🇽", color: "#1faa59" },
  ecu: { id: "ecu", name: "Ecuador", code: "ECU", flag: "🇪🇨", color: "#ffd23f" },
  eng: { id: "eng", name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#f1f5ff" },
  cod: { id: "cod", name: "DR Congo", code: "COD", flag: "🇨🇩", color: "#3ddc97" },
  bel: { id: "bel", name: "Belgium", code: "BEL", flag: "🇧🇪", color: "#ffd24a" },
  sen: { id: "sen", name: "Senegal", code: "SEN", flag: "🇸🇳", color: "#21c065" },
  usa: { id: "usa", name: "United States", code: "USA", flag: "🇺🇸", color: "#5b9bff" },
  bih: { id: "bih", name: "Bosnia & Herz.", code: "BIH", flag: "🇧🇦", color: "#ffd23f" },
  esp: { id: "esp", name: "Spain", code: "ESP", flag: "🇪🇸", color: "#ff4d4d" },
  aut: { id: "aut", name: "Austria", code: "AUT", flag: "🇦🇹", color: "#ff6b6b" },
  por: { id: "por", name: "Portugal", code: "POR", flag: "🇵🇹", color: "#ff3860" },
  cro: { id: "cro", name: "Croatia", code: "CRO", flag: "🇭🇷", color: "#ff5c8a" },
  sui: { id: "sui", name: "Switzerland", code: "SUI", flag: "🇨🇭", color: "#ff4757" },
  alg: { id: "alg", name: "Algeria", code: "ALG", flag: "🇩🇿", color: "#2ecc71" },
  aus: { id: "aus", name: "Australia", code: "AUS", flag: "🇦🇺", color: "#ffcf33" },
  egy: { id: "egy", name: "Egypt", code: "EGY", flag: "🇪🇬", color: "#ff5252" },
  arg: { id: "arg", name: "Argentina", code: "ARG", flag: "🇦🇷", color: "#6cc4ff" },
  cpv: { id: "cpv", name: "Cape Verde", code: "CPV", flag: "🇨🇻", color: "#5b8cff" },
  col: { id: "col", name: "Colombia", code: "COL", flag: "🇨🇴", color: "#ffd23f" },
  gha: { id: "gha", name: "Ghana", code: "GHA", flag: "🇬🇭", color: "#ffcf33" },
};

export function getTeam(id: string): Team {
  return TEAMS[id];
}
