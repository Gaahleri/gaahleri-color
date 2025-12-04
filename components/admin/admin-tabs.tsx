"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SeriesManagement from "@/components/admin/series-management";
import ColorsManagement from "@/components/admin/colors-management";
import TopColorsStats from "@/components/admin/top-colors-stats";
import { Palette, List, BarChart3 } from "lucide-react";

export default function AdminTabs() {
  return (
    <Tabs defaultValue="series" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="series" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Series
        </TabsTrigger>
        <TabsTrigger value="colors" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          Colors
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Stats
        </TabsTrigger>
      </TabsList>

      <TabsContent value="series">
        <SeriesManagement />
      </TabsContent>

      <TabsContent value="colors">
        <ColorsManagement />
      </TabsContent>

      <TabsContent value="stats">
        <TopColorsStats />
      </TabsContent>
    </Tabs>
  );
}
