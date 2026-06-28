import { notFound } from "next/navigation";
import ShareView from "@/components/ShareView";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  
  if (!isSupabaseConfigured()) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Database not configured</h1>
        <p>Please configure Supabase to use this feature.</p>
      </div>
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("client_id", id)
      .single();

    if (error || !data) {
      notFound();
    }

    return <ShareView prediction={data} />;
  } catch {
    notFound();
  }
}
