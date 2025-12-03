"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Save, Globe } from "lucide-react";

interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  country: string | null;
}

export default function CountryInput() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setCountry(data.country || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: country || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save country:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Your Location
        </CardTitle>
        <CardDescription>
          Tell us your country to help us improve our service (optional)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="country" className="sr-only">
              Country
            </Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Enter your country (e.g., United States, China, Japan)"
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
        {saved && (
          <p className="text-sm text-green-600 mt-2">
            Country saved successfully!
          </p>
        )}
        {profile?.country && (
          <p className="text-sm text-muted-foreground mt-2">
            Current: {profile.country}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
