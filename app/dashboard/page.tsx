import { requireAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Palette, History } from "lucide-react";

export default async function DashboardPage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            View your saved colors and color mixing history
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="mixes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="mixes" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>My Mixes</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Saved Colors</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Recent Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mixes" className="space-y-4">
            <div className="bg-card rounded-lg p-8 text-center">
              <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Color Mixes Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating color mixes to see them here. Your mixes will be saved automatically.
              </p>
              <a href="/make-color" className="text-primary hover:underline font-medium">
                Create Your First Mix →
              </a>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <div className="bg-card rounded-lg p-8 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Saved Colors Yet</h3>
              <p className="text-muted-foreground mb-6">
                Browse Gaahleri colors and save your favorites to see them here.
              </p>
              <a href="/make-color" className="text-primary hover:underline font-medium">
                Browse Colors →
              </a>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="bg-card rounded-lg p-8 text-center">
              <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
              <p className="text-muted-foreground">
                Your recent activity will appear here once you start using the app.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            About Your Dashboard
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>My Mixes:</strong> All color combinations you&apos;ve created</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Saved Colors:</strong> Individual Gaahleri colors you&apos;ve saved</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Recent Activity:</strong> Your latest actions in the app</span>
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
