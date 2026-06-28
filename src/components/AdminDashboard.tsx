"use client";

import { useCallback, useState, Fragment } from "react";
import { getTeam } from "@/lib/teams";
import type { PredictionRow } from "@/lib/predictions";
import styles from "./admin.module.css";

type Props = {
  initialAuthenticated: boolean;
  initialPredictions: PredictionRow[];
};

export default function AdminDashboard({
  initialAuthenticated,
  initialPredictions,
}: Props) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] =
    useState<PredictionRow[]>(initialPredictions);
  const [fetchError, setFetchError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadPredictions = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/predictions");
      const data = (await res.json()) as {
        ok?: boolean;
        predictions?: PredictionRow[];
        error?: string;
      };
      if (!res.ok || !data.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
        }
        setFetchError(data.error ?? "Could not load predictions.");
        return;
      }
      setPredictions(data.predictions ?? []);
    } catch {
      setFetchError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setLoginError(data.error ?? "Login failed.");
        return;
      }
      setAuthenticated(true);
      setPassword("");
      await loadPredictions();
    } catch {
      setLoginError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setPredictions([]);
    setExpandedId(null);
  }

  if (!authenticated) {
    return (
      <main className={styles.shell}>
        <div className={styles.login}>
          <span className={styles.tag}>Admin</span>
          <h1 className={styles.title}>Predictions dashboard</h1>
          <p className={styles.sub}>
            Sign in to view everyone&apos;s bracket picks synced from the app.
          </p>
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <input
              className={styles.input}
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button className={styles.btn} type="submit" disabled={loading || !password}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          {loginError ? <p className={styles.error}>{loginError}</p> : null}
        </div>
      </main>
    );
  }

  const complete = predictions.filter((p) => p.picks_count === 31).length;
  const champions = new Map<string, number>();
  for (const p of predictions) {
    if (p.champion) {
      champions.set(p.champion, (champions.get(p.champion) ?? 0) + 1);
    }
  }
  const topChamps = [...champions.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <main className={styles.shellWide}>
      <header className={styles.header}>
        <div>
          <span className={styles.tag}>Admin</span>
          <h1 className={styles.titleSm}>Predictions</h1>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.btnGhost}
            type="button"
            onClick={() => void loadPredictions()}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button className={styles.btnGhost} type="button" onClick={() => void handleLogout()}>
            Sign out
          </button>
        </div>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{predictions.length}</span>
          <span className={styles.statLabel}>Synced users</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{complete}</span>
          <span className={styles.statLabel}>Complete brackets</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{champions.size}</span>
          <span className={styles.statLabel}>Unique champions</span>
        </div>
      </div>

      {topChamps.length > 0 ? (
        <section className={styles.champStrip}>
          <h2 className={styles.sectionTitle}>Popular champions</h2>
          <div className={styles.champList}>
            {topChamps.map(([id, count]) => {
              const team = getTeam(id);
              return (
                <div key={id} className={styles.champChip}>
                  <span>{team?.flag ?? "🏳️"}</span>
                  <b>{team?.name ?? id.toUpperCase()}</b>
                  <span className={styles.champCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {fetchError ? <p className={styles.error}>{fetchError}</p> : null}

      <section className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Champion</th>
              <th>Progress</th>
              <th>Phase</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {predictions.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  No predictions synced yet. Users can tap &quot;Sync to cloud&quot; in the app.
                </td>
              </tr>
            ) : null}
            {predictions.map((row) => {
              const team = row.champion ? getTeam(row.champion) : null;
              const open = expandedId === row.id;
              return (
                <Fragment key={row.id}>
                  <tr>
                    <td>
                      <b>{row.name}</b>
                    </td>
                    <td className={styles.email}>{row.email}</td>
                    <td>
                      {team ? (
                        <span className={styles.champCell}>
                          {team.flag} {team.name}
                        </span>
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>
                    <td>{row.picks_count}/31</td>
                    <td className={styles.phase}>{row.phase}</td>
                    <td className={styles.muted}>
                      {new Date(row.updated_at).toLocaleString()}
                    </td>
                    <td>
                      <button
                        className={styles.linkbtn}
                        type="button"
                        onClick={() => setExpandedId(open ? null : row.id)}
                      >
                        {open ? "Hide" : "Picks"}
                      </button>
                    </td>
                  </tr>
                  {open ? (
                    <tr key={`${row.id}-detail`} className={styles.detailRow}>
                      <td colSpan={7}>
                        <pre className={styles.picksJson}>
                          {JSON.stringify(row.picks, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
