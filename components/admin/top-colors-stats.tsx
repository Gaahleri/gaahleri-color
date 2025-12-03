"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp } from "lucide-react";

interface TopColor {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  buyLink: string | null;
  series: {
    name: string;
  };
  addCount: number;
}

export default function TopColorsStats() {
  const [topColors, setTopColors] = useState<TopColor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopColors();
  }, []);

  const fetchTopColors = async () => {
    try {
      const res = await fetch("/api/admin/stats/top-colors");
      if (res.ok) {
        const data = await res.json();
        setTopColors(data);
      }
    } catch (error) {
      console.error("Failed to fetch top colors:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 10 Colors (Last 30 Days)
          </CardTitle>
        </CardHeader>
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
          <TrendingUp className="h-5 w-5" />
          Top 10 Colors (Last 30 Days)
        </CardTitle>
        <CardDescription>
          Most saved colors by users in the past month
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topColors.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No data available yet. Colors will appear here once users start
            saving them.
          </p>
        ) : (
          <div className="space-y-3">
            {topColors.map((color, index) => (
              <div
                key={color.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <span className="text-2xl font-bold text-muted-foreground w-8">
                  #{index + 1}
                </span>
                <div
                  className="w-12 h-12 rounded-md border shadow-sm shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{color.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {color.series?.name}
                    </Badge>
                    <span>{color.hex}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {color.addCount}
                  </div>
                  <div className="text-xs text-muted-foreground">saves</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
