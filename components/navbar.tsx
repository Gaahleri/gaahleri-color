"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Palette,
  Home,
  Droplet,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/user-home", label: "Home", icon: Home },
    { href: "/make-color", label: "Create Your Color", icon: Droplet },
    { href: "/analyze-color", label: "Analyse Your Color", icon: BarChart3 },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mr-8">
          <Palette className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Gaahleri</span>
        </Link>

        {/* Navigation Links - Only show when signed in */}
        <SignedIn>
          <div className="flex items-center space-x-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "flex items-center space-x-2",
                      isActive && "bg-secondary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </SignedIn>

        {/* Right side - Theme toggle and User actions */}
        <div className="flex items-center space-x-4 ml-auto">
          <ThemeToggle />

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
