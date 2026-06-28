import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listPredictions, toPredictionInsert } from "@/lib/predictions";
import type { Phase } from "@/lib/storage";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Picks } from "@/lib/bracket";

type PostBody = {
  clientId?: string;
  name?: string;
  picks?: Picks;
  phase?: Phase;
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Database is not configured." },
      { status: 503 }
    );
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const clientId = body.clientId?.trim();
  const name = body.name?.trim();
  const picks = body.picks ?? {};
  const phase = body.phase;

  if (!clientId || !name) {
    return NextResponse.json(
      { ok: false, error: "clientId and name are required." },
      { status: 400 }
    );
  }

  if (!phase || !["intro", "predict", "result"].includes(phase)) {
    return NextResponse.json(
      { ok: false, error: "Invalid phase." },
      { status: 400 }
    );
  }

  const row = toPredictionInsert({ clientId, name, picks, phase });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("predictions")
      .upsert(row, { onConflict: "client_id" })
      .select("updated_at")
      .single();

    if (error) {
      console.error("Supabase upsert failed", error);
      return NextResponse.json(
        { ok: false, error: "Could not save prediction." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      updatedAt: data.updated_at as string,
    });
  } catch (err) {
    console.error("Prediction sync error", err);
    return NextResponse.json(
      { ok: false, error: "Server error." },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Database is not configured." },
      { status: 503 }
    );
  }

  try {
    const predictions = await listPredictions();
    return NextResponse.json({ ok: true, predictions });
  } catch (err) {
    console.error("Prediction list error", err);
    return NextResponse.json(
      { ok: false, error: "Server error." },
      { status: 500 }
    );
  }
}
