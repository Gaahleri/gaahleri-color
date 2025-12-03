"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Palette, Droplet, Sparkles } from "lucide-react";

export default function GuestLanding() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          {/* Logo/Brand */}
          <div className="flex justify-center">
            <div className="relative">
              <Palette className="w-24 h-24 text-primary" />
              <Sparkles className="w-8 h-8 text-amber-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gaahleri Color Studio
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400">
              Professional Paint Color Mixing Simulator
            </p>
          </div>

          {/* Value Proposition */}
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-lg text-slate-700 dark:text-slate-300">
              Discover what colors you can create with paints from
              Gaahleri&apos;s professional collection. Mix, experiment, and save
              your perfect color combinations.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <SignUpButton mode="modal">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon={<Palette className="w-12 h-12 text-blue-600" />}
            title="Mix Colors Virtually"
            description="Experiment with different paint combinations from our professional series before purchasing."
          />
          <FeatureCard
            icon={<Droplet className="w-12 h-12 text-purple-600" />}
            title="Precise Proportions"
            description="Get exact ratios and proportions for recreating your perfect color mix."
          />
          <FeatureCard
            icon={<Sparkles className="w-12 h-12 text-amber-600" />}
            title="Save & Share"
            description="Save your favorite mixes to your personal dashboard and access them anytime."
          />
        </div>

        {/* About Gaahleri Section */}
        <div className="mt-24 bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-center mb-8">
            About Gaahleri
          </h2>
          <div className="max-w-3xl mx-auto space-y-6 text-slate-700 dark:text-slate-300">
            <p className="text-lg leading-relaxed">
              Gaahleri is a premium paint manufacturer specializing in
              professional-grade colors for artists, designers, and creative
              professionals. Our carefully curated color collections offer
              unmatched quality and consistency.
            </p>
            <p className="text-lg leading-relaxed">
              With decades of expertise in color science, we&apos;ve created
              this digital tool to help you explore the endless possibilities of
              color mixing using our paint collections. Whether you&apos;re an
              experienced artist or just starting your creative journey, our
              color mixer helps you achieve the perfect shade every time.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              <StatCard value="500+" label="Colors" />
              <StatCard value="20+" label="Series" />
              <StatCard value="10K+" label="Artists" />
              <StatCard value="50+" label="Countries" />
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Sign Up"
              description="Create your free account to access the color mixing studio."
            />
            <StepCard
              number="2"
              title="Select Colors"
              description="Choose colors from Gaahleri's professional paint collections."
            />
            <StepCard
              number="3"
              title="Mix & Save"
              description="Experiment with proportions and save your favorite combinations."
            />
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Creating?</h2>
          <SignUpButton mode="modal">
            <Button size="lg" className="text-lg px-12">
              Join Gaahleri Color Studio
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div className="mt-6 text-center space-y-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}
