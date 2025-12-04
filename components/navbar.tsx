"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Palette,
  Home,
  Droplet,
  BarChart3,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 使用 useSyncExternalStore 来安全地检测客户端
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Navbar() {
  const pathname = usePathname();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/user-home", label: "Home", icon: Home },
    { href: "/make-color", label: "Create Your Color", icon: Droplet },
    { href: "/analyze-color", label: "Analyse Your Color", icon: BarChart3 },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Mobile: Hamburger Menu (Left) */}
        <div className="md:hidden">
          {isClient && (
            <SignedIn>
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Gaahleri
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-2 mt-6">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        pathname?.startsWith(item.href + "/");

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive
                              ? "bg-secondary text-secondary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </SignedIn>
          )}
        </div>

        {/* Logo (Center on mobile, Left on desktop) */}
        <Link
          href="/"
          className={cn(
            "flex items-center space-x-2",
            "md:mr-8", // Desktop: margin right
            "flex-1 md:flex-none justify-center md:justify-start" // Mobile: centered
          )}
        >
          <Palette className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Gaahleri</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:block">
          {isClient && (
            <SignedIn>
              <div className="flex items-center space-x-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/");

                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "flex items-center space-x-2",
                        isActive && "bg-secondary"
                      )}
                      asChild
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </SignedIn>
          )}
        </div>

        {/* Right side - Theme toggle and User actions */}
        <div className="flex items-center space-x-2 md:space-x-4 ml-auto md:ml-auto">
          <ThemeToggle />

          {isClient && (
            <>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8 md:h-9 md:w-9",
                    },
                  }}
                />
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm">Sign In</Button>
                </SignInButton>
              </SignedOut>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
