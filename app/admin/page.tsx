import { requireAdmin } from "@/lib/auth";
import AdminTabsWrapper from "@/components/admin/admin-tabs-wrapper";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage color series and paint colors for Gaahleri store
        </p>
      </div>

      <AdminTabsWrapper />
    </div>
  );
}
