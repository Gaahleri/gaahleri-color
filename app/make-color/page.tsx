import { requireAuth } from "@/lib/auth";
import MakeColorTabs from "@/components/make-color-tabs";

export default async function MakeColorPage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Your Color</h1>
        <p className="text-muted-foreground">
          Mix Gaahleri paints and discover new color combinations
        </p>
      </div>

      <MakeColorTabs />
    </div>
  );
}
