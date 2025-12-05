import { requireAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Palette } from "lucide-react";
import ColorCollection from "@/components/color-collection";
import MyRecipes from "@/components/my-recipes";

export default async function DashboardPage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Color Library</h1>
          <p className="text-muted-foreground">
            View your saved colors and color mixing history
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="mixes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md">
            <TabsTrigger value="mixes" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>My Mixed Colors</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Saved Colors</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mixes" className="space-y-4">
            <MyRecipes />
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <ColorCollection />
          </TabsContent>
        </Tabs>


      </div>
    </div>
  );
}
