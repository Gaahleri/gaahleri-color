"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ColorMixer from "@/components/color-mixer";
import MyRecipes from "@/components/my-recipes";
import { Droplet, BookOpen } from "lucide-react";

export default function MakeColorTabs() {
  return (
    <Tabs defaultValue="mixer" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="mixer" className="flex items-center gap-2">
          <Droplet className="h-4 w-4" />
          Color Mixer
        </TabsTrigger>
        <TabsTrigger value="recipes" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          My Recipes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mixer">
        <ColorMixer />
      </TabsContent>

      <TabsContent value="recipes">
        <MyRecipes />
      </TabsContent>
    </Tabs>
  );
}
