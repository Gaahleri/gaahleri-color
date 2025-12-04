"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Trash2,
  Loader2,
  Palette,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import mixbox from "mixbox";
// cn helper not needed here
import { toast } from "sonner";
import ColorCard from "@/components/color-card";

interface Series {
  id: string;
  name: string;
}

interface Color {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  buyLink: string | null;
  badge: string | null;
  status: string | null;
  series: {
    id: string;
    name: string;
  };
  updatedAt: string;
}

interface MixIngredient {
  color: Color;
  parts: number;
}

const ITEMS_PER_PAGE = 24;

export default function ColorMixer() {
  // 使用 SWR 进行数据缓存
  const { data: colors = [], isLoading: colorsLoading } = useSWR<Color[]>(
    "/api/colors",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );
  const { data: series = [], isLoading: seriesLoading } = useSWR<Series[]>(
    "/api/series",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
  const { data: userRecords = [], mutate: mutateRecords } = useSWR<
    { colorId: string }[]
  >("/api/user/colors", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const loading = colorsLoading || seriesLoading;
  const savedColorIds = new Set(userRecords.map((r) => r.colorId));

  const [ingredients, setIngredients] = useState<MixIngredient[]>([]);
  const [mixedColor, setMixedColor] = useState<{
    hex: string;
    rgb: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");

  // Filter & Pagination States
  const [source, setSource] = useState<"catalog" | "library">("catalog");
  const [selectedSeries, setSelectedSeries] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to convert hex to RGB array
  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  // Helper to convert RGB array to hex
  const rgbToHex = (rgb: [number, number, number]): string => {
    return `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1]
      .toString(16)
      .padStart(2, "0")}${rgb[2].toString(16).padStart(2, "0")}`;
  };

  const calculateMix = useCallback(() => {
    if (ingredients.length === 0) {
      setMixedColor(null);
      return;
    }

    if (ingredients.length === 1) {
      setMixedColor({
        hex: ingredients[0].color.hex,
        rgb: ingredients[0].color.rgb,
      });
      return;
    }

    const totalParts = ingredients.reduce((sum, ing) => sum + ing.parts, 0);
    const z_mix = [0, 0, 0, 0, 0, 0, 0];

    for (const ing of ingredients) {
      const rgb = hexToRgb(ing.color.hex);
      const z = mixbox.rgbToLatent(rgb);
      const weight = ing.parts / totalParts;

      for (let i = 0; i < z_mix.length; i++) {
        z_mix[i] += z[i] * weight;
      }
    }

    const result = mixbox.latentToRgb(
      z_mix as [number, number, number, number, number, number, number]
    );
    const hex = rgbToHex(result);

    setMixedColor({
      hex,
      rgb: `${result[0]},${result[1]},${result[2]}`,
    });
  }, [ingredients]);

  useEffect(() => {
    calculateMix();
  }, [calculateMix]);

  const addIngredient = (color: Color) => {
    if (ingredients.some((ing) => ing.color.id === color.id)) {
      return;
    }
    setIngredients([...ingredients, { color, parts: 1 }]);
  };

  const updateParts = (colorId: string, newParts: number[]) => {
    setIngredients(
      ingredients.map((ing) => {
        if (ing.color.id === colorId) {
          return { ...ing, parts: newParts[0] };
        }
        return ing;
      })
    );
  };

  const removeIngredient = (colorId: string) => {
    setIngredients(ingredients.filter((ing) => ing.color.id !== colorId));
  };

  const handleSaveColor = async (colorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedColorIds.has(colorId)) return;
    // 乐观更新：先在本地把 colorId 添加到 userRecords，失败时回滚并提示
    const previous = userRecords || [];
    const optimistic = [...previous, { colorId }];
    try {
      // Apply optimistic update without revalidation
      mutateRecords(optimistic, false);

      const res = await fetch("/api/user/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colorId }),
      });

      if (res.ok) {
        // 成功：后台重新验证并替换为真实数据 (不需要提示成功)
        await mutateRecords();
      } else {
        // 失败：回滚并提示错误
        mutateRecords(previous, false);
        console.error("Failed to save color, status:", res.status);
        toast.error("Failed to save color");
      }
    } catch (error) {
      // 回滚并提示错误
      mutateRecords(previous, false);
      console.error("Failed to save color:", error);
      toast.error("Failed to save color");
    }
  };

  const saveRecipe = async () => {
    if (!mixedColor || !recipeName || ingredients.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: recipeName,
          description: recipeDescription || null,
          resultHex: mixedColor.hex,
          resultRgb: mixedColor.rgb,
          ingredients: ingredients.map((ing) => ({
            colorId: ing.color.id,
            parts: ing.parts,
          })),
        }),
      });

      if (res.ok) {
        setIsSaveOpen(false);
        setRecipeName("");
        setRecipeDescription("");
        toast.success("Recipe saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
      toast.error("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  const clearAll = () => {
    setIngredients([]);
    setMixedColor(null);
  };

  // Filter and Sort Colors
  const getFilteredColors = () => {
    let filtered = colors;

    // Filter by Source
    if (source === "library") {
      filtered = filtered.filter((c) => savedColorIds.has(c.id));
    }

    // Filter by Series
    if (selectedSeries !== "all") {
      filtered = filtered.filter((c) => c.series.id === selectedSeries);
    }

    // Sort by updatedAt desc
    return filtered.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  const filteredColors = getFilteredColors();
  const totalPages = Math.ceil(filteredColors.length / ITEMS_PER_PAGE);
  const paginatedColors = filteredColors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [source, selectedSeries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:h-[calc(100vh-12rem)]">
      {/* Left: Color Selection */}
      <Card className="lg:col-span-7 flex flex-col overflow-hidden lg:h-full">
        <CardHeader className="shrink-0 space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Select Colors
            </CardTitle>
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                variant={source === "catalog" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSource("catalog")}
                className="h-7 text-xs"
              >
                Gaahleri Color
              </Button>
              <Button
                variant={source === "library" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSource("library")}
                className="h-7 text-xs"
              >
                My Color
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  {series.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredColors.length} colors
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto min-h-0 max-h-[50vh] lg:max-h-none">
          {paginatedColors.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
              <p>No colors found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
              {paginatedColors.map((color) => {
                const isSelected = ingredients.some(
                  (ing) => ing.color.id === color.id
                );
                const isSaved = savedColorIds.has(color.id);

                return (
                  <ColorCard
                    key={color.id}
                    color={color}
                    isSelected={isSelected}
                    isSaved={isSaved}
                    onCardClick={addIngredient}
                    onSaveClick={handleSaveColor}
                    showActions={true}
                  />
                );
              })}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between bg-card">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>

      {/* Right: Mixing Area */}
      <div className="lg:col-span-5 flex flex-col gap-6 lg:h-full overflow-visible lg:overflow-hidden">
        {/* Selected Ingredients */}
        <Card className="flex-1 flex flex-col overflow-visible lg:overflow-hidden min-h-[200px]">
          <CardHeader className="shrink-0 pb-2">
            <CardTitle className="text-lg">Mixing Palette</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-visible lg:overflow-y-auto custom-scrollbar">
            {ingredients.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                <Palette className="h-12 w-12 mb-4 opacity-20" />
                <p>Select colors from the left to start mixing</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ingredients.map((ing) => (
                  <div key={ing.color.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border shadow-sm"
                          style={{ backgroundColor: ing.color.hex }}
                        />
                        <span className="font-medium text-sm">
                          {ing.color.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeIngredient(ing.color.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[ing.parts]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(val: number[]) =>
                          updateParts(ing.color.id, val)
                        }
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-mono text-sm">
                        {ing.parts} pts
                      </span>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="w-full mt-4"
                >
                  Clear Palette
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Preview */}
        <Card className="shrink-0">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-full border shadow-sm shrink-0 overflow-hidden">
                {mixedColor ? (
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: mixedColor.hex }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center rounded-full">
                    <span className="text-xs text-muted-foreground">
                      No Mix
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Result Hex
                  </Label>
                  <div className="font-mono font-medium">
                    {mixedColor?.hex || "---"}
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => setIsSaveOpen(true)}
                  disabled={!mixedColor || ingredients.length === 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Recipe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Dialog */}
      <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Recipe</DialogTitle>
            <DialogDescription>
              Give your color mix a name to save it
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipe-name">Recipe Name *</Label>
              <Input
                id="recipe-name"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="e.g., My Perfect Pink"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipe-desc">Description (Optional)</Label>
              <Textarea
                id="recipe-desc"
                value={recipeDescription}
                onChange={(e) => setRecipeDescription(e.target.value)}
                placeholder="Notes about this color..."
              />
            </div>
            {mixedColor && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                <div
                  className="w-16 h-16 rounded-full border shadow-sm"
                  style={{ backgroundColor: mixedColor.hex }}
                />
                <div>
                  <div className="font-medium">{mixedColor.hex}</div>
                  <div className="text-sm text-muted-foreground">
                    {ingredients.length} color
                    {ingredients.length > 1 ? "s" : ""} mixed
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveRecipe} disabled={!recipeName || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
