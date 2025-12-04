import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Droplet,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import CountryInput from "@/components/country-input";

export default async function UserHomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Your Color Studio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This is your personal space to explore the world of Gaahleri pigments. 
            Here you can manage your color library, simulate realistic color mixing, 
            and discover new possibilities for your artwork.
          </p>
        </div>

        {/* Profile Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <CountryInput />
        </div>



        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <QuickActionCard
            href="/make-color"
            icon={<Droplet className="w-12 h-12 text-blue-600" />}
            title="Create Your Color"
            description="Mix different Gaahleri paints and discover new color combinations"
            gradient="from-blue-500 to-cyan-500"
          />
          <QuickActionCard
            href="/analyze-color"
            icon={<BarChart3 className="w-12 h-12 text-purple-600" />}
            title="Analyse Your Color"
            description="Explore your saved color mixes and analyze their composition"
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        {/* Features Overview */}
        <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            What You Can Do
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureItem
              icon={<Palette className="w-8 h-8 text-primary" />}
              title="Browse Paint Collections"
              description="Explore all available Gaahleri paint series and colors"
            />
            <FeatureItem
              icon={<Droplet className="w-8 h-8 text-primary" />}
              title="Mix Colors"
              description="Virtually mix paints with precise proportions to see results instantly"
            />
            <FeatureItem
              icon={<Sparkles className="w-8 h-8 text-primary" />}
              title="Save & Track"
              description="Save your favorite combinations to your personal dashboard"
            />
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Getting Started
          </h2>
          <div className="space-y-6">
            <StepCard
              step="1"
              title="Explore Color Collections"
              description="Browse through our professional paint series to see all available colors"
            />
            <StepCard
              step="2"
              title="Mix Your Colors"
              description="Select colors and adjust proportions to create your perfect shade"
            />
            <StepCard
              step="3"
              title="Save Your Work"
              description="Save your favorite mixes and access them anytime from your dashboard"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center justify-center space-x-4">
            <Link href="/make-color">
              <Button size="lg" className="text-lg">
                Start Mixing Colors
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
  gradient,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <div className="group relative h-full bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
        <div
          className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
        />
        <div className="relative p-8 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary rounded-lg">{icon}</div>
            <h3 className="text-2xl font-bold">{title}</h3>
          </div>
          <p className="text-muted-foreground">{description}</p>
          <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="p-3 bg-secondary rounded-full">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start space-x-4 p-6 bg-card rounded-lg shadow">
      <div className="shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
        {step}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
