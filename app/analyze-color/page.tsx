import { requireAuth } from "@/lib/auth";
import { BarChart3 } from "lucide-react";
import ColorAnalyzer from "@/components/color-analyzer";

export default async function AnalyzeColorPage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <BarChart3 className="w-12 h-12 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Analyse Your Color</h1>
            <p className="text-muted-foreground">
              Upload an image, pick a color, and find matching Gaahleri paints
            </p>
          </div>
        </div>

        {/* Color Analyzer */}
        <ColorAnalyzer />
      </div>
    </div>
  );
}
