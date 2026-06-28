import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listPredictions, toPredictionInsert } from "@/lib/predictions";
import type { Phase } from "@/lib/storage";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Picks } from "@/lib/bracket";

type PostBody = {
  clientId?: string;
  name?: string;
  email?: string;
  picks?: Picks;
  phase?: Phase;
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Database is not configured." },
      { status: 503 },
    );
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const clientId = body.clientId?.trim();
  const name = body.name?.trim();
  const email = body.email?.trim();
  const picks = body.picks ?? {};
  const phase = body.phase;

  if (!clientId || !name || !email) {
    return NextResponse.json(
      { ok: false, error: "clientId, name, and email are required." },
      { status: 400 },
    );
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email address." },
      { status: 400 },
    );
  }

  if (!phase || !["intro", "predict", "result"].includes(phase)) {
    return NextResponse.json(
      { ok: false, error: "Invalid phase." },
      { status: 400 },
    );
  }

  const row = toPredictionInsert({ clientId, name, email, picks, phase });

  try {
    const supabase = getSupabaseAdmin();

    console.log("[API] Saving prediction:", {
      client_id: row.client_id,
      email: row.email,
      name: row.name,
      picks_count: row.picks_count,
    });

    // The table has TWO unique constraints: client_id and lower(email).
    // A single upsert can only resolve one of them, so we identify the
    // canonical row manually — email is the user's identity in this app —
    // and update it in place, otherwise fall back to the device row, else
    // insert. This avoids "duplicate key" errors when the same email is
    // saved from a new device / fresh client_id.
    // row.email is already trimmed + lowercased, matching how rows are stored,
    // so an exact match is correct (and avoids ilike treating _/% as wildcards).
    const { data: byEmail, error: byEmailError } = await supabase
      .from("predictions")
      .select("id")
      .eq("email", row.email)
      .maybeSingle();

    if (byEmailError) {
      console.error("[API] Lookup by email failed:", byEmailError);
      return NextResponse.json(
        { ok: false, error: `Database error: ${byEmailError.message}` },
        { status: 500 },
      );
    }

    let data: { id: string; updated_at: string } | null = null;
    let error: { message: string } | null = null;

    if (byEmail) {
      // Canonical email row exists → update it. Keep its original client_id
      // so we never collide with the client_id unique constraint.
      ({ data, error } = await supabase
        .from("predictions")
        .update({
          name: row.name,
          email: row.email,
          picks: row.picks,
          phase: row.phase,
          champion: row.champion,
          picks_count: row.picks_count,
          updated_at: row.updated_at,
        })
        .eq("id", byEmail.id)
        .select("id, updated_at")
        .single());
    } else {
      // No row for this email. This device may have a row under a previous
      // email (same client_id) — reuse it; otherwise insert a fresh row.
      const { data: byClient } = await supabase
        .from("predictions")
        .select("id")
        .eq("client_id", row.client_id)
        .maybeSingle();

      if (byClient) {
        ({ data, error } = await supabase
          .from("predictions")
          .update(row)
          .eq("id", byClient.id)
          .select("id, updated_at")
          .single());
      } else {
        ({ data, error } = await supabase
          .from("predictions")
          .insert(row)
          .select("id, updated_at")
          .single());
      }
    }

    if (error || !data) {
      console.error("[API] Supabase save failed:", error);
      return NextResponse.json(
        { ok: false, error: `Database error: ${error?.message ?? "unknown"}` },
        { status: 500 },
      );
    }

    console.log("[API] Successfully saved prediction");

    return NextResponse.json({
      ok: true,
      id: data.id as string,
      updatedAt: data.updated_at as string,
    });
  } catch (err) {
    console.error("[API] Prediction sync error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  // If email param is provided, return that specific prediction (for cross-device sync)
  if (email) {
    console.log("[API] GET /api/predictions with email:", email);

    if (!isSupabaseConfigured()) {
      console.log("[API] Supabase not configured");
      return NextResponse.json(
        { ok: false, error: "Database is not configured." },
        { status: 503 },
      );
    }

    try {
      const supabase = getSupabaseAdmin();
      const normalizedEmail = email.toLowerCase().trim();
      console.log("[API] Searching for email:", normalizedEmail);

      // Use case-insensitive search to match database unique index
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .ilike("email", normalizedEmail)
        .single();

      if (error) {
        console.log("[API] Supabase error:", error.code, error.message);
        if (error.code === "PGRST116") {
          // No rows found
          console.log("[API] No prediction found for email:", normalizedEmail);
          return NextResponse.json({ ok: true, prediction: null });
        }
        console.error("Supabase fetch by email failed", error);
        return NextResponse.json(
          { ok: false, error: "Could not fetch prediction." },
          { status: 500 },
        );
      }

      console.log("[API] Found prediction:", {
        name: data.name,
        email: data.email,
        picks_count: data.picks_count,
      });
      return NextResponse.json({ ok: true, prediction: data });
    } catch (err) {
      console.error("Prediction fetch error", err);
      return NextResponse.json(
        { ok: false, error: "Server error." },
        { status: 500 },
      );
    }
  }

  // Otherwise, admin is fetching all predictions
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Database is not configured." },
      { status: 503 },
    );
  }

  try {
    const predictions = await listPredictions();
    return NextResponse.json({ ok: true, predictions });
  } catch (err) {
    console.error("Prediction list error", err);
    return NextResponse.json(
      { ok: false, error: "Server error." },
      { status: 500 },
    );
  }
}
