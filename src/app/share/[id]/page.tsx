import { notFound } from "next/navigation";
import ShareView from "@/components/ShareView";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  
  console.log('[SharePage] Looking for prediction with client_id:', id);
  
  if (!isSupabaseConfigured()) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>
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

    console.log('[SharePage] Query result:', { data: !!data, error: error?.message });

    if (error) {
      console.error('[SharePage] Database error:', error);
      
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>
          <h1>Prediction Not Found</h1>
          <p>This prediction doesn&apos;t exist or hasn&apos;t been synced yet.</p>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '20px' }}>
            Error: {error.message}
          </p>
          <a href="/" style={{ color: '#ff2151', marginTop: '20px', display: 'inline-block' }}>
            ← Go Home
          </a>
        </div>
      );
    }
    
    if (!data) {
      console.error('[SharePage] No data found for client_id:', id);
      notFound();
    }

    return <ShareView prediction={data} />;
  } catch (err) {
    console.error('[SharePage] Unexpected error:', err);
    notFound();
  }
}
