import { requireAuth } from "@/lib/auth";
import { Droplet, Info } from "lucide-react";

export default async function MakeColorPage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Droplet className="w-12 h-12 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Create Your Color</h1>
            <p className="text-muted-foreground">
              Mix Gaahleri paints and discover new color combinations
            </p>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-card rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Droplet className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            The color mixing studio is currently under development. 
            You&apos;ll soon be able to:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
            <li className="flex items-start">
              <span className="text-primary mr-3">✓</span>
              <span>Select multiple colors from Gaahleri collections</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">✓</span>
              <span>Adjust proportions with precise controls</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">✓</span>
              <span>See real-time color mixing results</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">✓</span>
              <span>Save your favorite combinations</span>
            </li>
          </ul>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 flex items-start space-x-4">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              What to Expect
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              This feature will simulate color mixing based on real paint properties. 
              You&apos;ll be able to experiment with different ratios and see the resulting 
              color before making a purchase from Gaahleri&apos;s store.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
