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

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            About Your Library
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>My Mixed Colors:</strong> All color combinations you&apos;ve
                created and saved
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Saved Colors:</strong> Individual Gaahleri colors
                you&apos;ve saved to your collection
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Your data is private and only visible to you</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
