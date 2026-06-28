import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listPredictions } from "@/lib/predictions";

export const metadata: Metadata = {
  title: "Admin — WC26 Predictions",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  const initialPredictions = authenticated ? await listPredictions() : [];

  return (
    <AdminDashboard
      initialAuthenticated={authenticated}
      initialPredictions={initialPredictions}
    />
  );
}
