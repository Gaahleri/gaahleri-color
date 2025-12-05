"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Globe } from "lucide-react";

interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  country: string | null;
}

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "China",
  "Australia",
  "Other",
];

export default function CountryInput() {
  // 使用 SWR 进行数据缓存
  const {
    data: profile,
    isLoading: loading,
    mutate: mutateProfile,
  } = useSWR<UserProfile>("/api/user/profile", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // 当 profile 加载完成后，设置 country 值
  useEffect(() => {
    if (profile) {
      setCountry(profile.country || "");
      
      // 如果用户没有设置国家，尝试自动检测
      if (!profile.country) {
        detectAndSaveCountry();
      }
    }
  }, [profile]);

  const detectAndSaveCountry = async () => {
    setDetecting(true);
    try {
      const res = await fetch("/api/user/detect-country");
      if (res.ok) {
        const data = await res.json();
        if (data.country) {
          // 自动保存检测到的国家
          await saveCountry(data.country);
          setCountry(data.country);
        }
      }
    } catch (error) {
      console.error("Failed to detect country:", error);
    } finally {
      setDetecting(false);
    }
  };

  const saveCountry = async (countryToSave: string) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: countryToSave || null }),
      });
      if (res.ok) {
        const data = await res.json();
        mutateProfile(data, false);
      }
    } catch (error) {
      console.error("Failed to save country:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveCountry(country);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      // Error handled in saveCountry
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
          {detecting 
            ? "Detecting your location..." 
            : "We use your location to provide better statistics. You can update it below."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="country" className="sr-only">
              Country
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving || !country}>
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
        {detecting && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Auto-detecting location...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
