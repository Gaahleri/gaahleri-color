import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Palette, Plus, List } from "lucide-react";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage color series and paint colors for Gaahleri store
          </p>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <AdminActionCard
            href="/admin/series"
            icon={<Palette className="w-8 h-8 text-blue-600" />}
            title="Manage Series"
            description="Create, edit, or delete color series collections"
            actions={["View all series", "Add new series", "Edit series details"]}
          />
          <AdminActionCard
            href="/admin/colors"
            icon={<List className="w-8 h-8 text-purple-600" />}
            title="Manage Colors"
            description="Add, edit, or remove individual paint colors"
            actions={["View all colors", "Add new colors", "Update color info"]}
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-card rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Total Series" value="—" />
            <StatCard label="Total Colors" value="—" />
            <StatCard label="Active Users" value="—" />
            <StatCard label="Total Mixes" value="—" />
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Note: Statistics will be populated once data is migrated to the database
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-amber-900 dark:text-amber-100">
            Admin Instructions
          </h3>
          <ul className="space-y-2 text-amber-800 dark:text-amber-200">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Only users with admin role can access this page</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use the Series management to organize colors into collections</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Each color must belong to a series</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Users can only view and mix colors, not modify them</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AdminActionCard({
  href,
  icon,
  title,
  description,
  actions,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  actions: string[];
}) {
  return (
    <div className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-secondary rounded-lg">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-muted-foreground mb-4">{description}</p>
      <ul className="space-y-2 mb-6">
        {actions.map((action, index) => (
          <li key={index} className="flex items-center text-sm">
            <Plus className="w-4 h-4 mr-2 text-primary" />
            {action}
          </li>
        ))}
      </ul>
      <Link href={href}>
        <Button className="w-full">Manage {title.split(" ")[1]}</Button>
      </Link>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
