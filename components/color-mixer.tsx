"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  Save,
  Trash2,
  ShoppingCart,
  Loader2,
  Palette,
} from "lucide-react";
import mixbox from "mixbox";

interface Color {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  buyLink: string | null;
  series: {
    id: string;
    name: string;
  };
}

interface MixIngredient {
  color: Color;
  parts: number;
}

export default function ColorMixer() {
  const [colors, setColors] = useState<Color[]>([]);
  const [ingredients, setIngredients] = useState<MixIngredient[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [mixedColor, setMixedColor] = useState<{
    hex: string;
    rgb: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");

  useEffect(() => {
    fetchColors();
  }, []);

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

    // Use mixbox to mix colors based on parts using latent space
    const totalParts = ingredients.reduce((sum, ing) => sum + ing.parts, 0);

    // Convert to latent space and mix based on parts
    const z_mix = [0, 0, 0, 0, 0, 0, 0];

    for (const ing of ingredients) {
      const rgb = hexToRgb(ing.color.hex);
      const z = mixbox.rgbToLatent(rgb);
      const weight = ing.parts / totalParts;

      for (let i = 0; i < z_mix.length; i++) {
        z_mix[i] += z[i] * weight;
      }
    }

    // Convert back to RGB
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

  const fetchColors = async () => {
    try {
      const res = await fetch("/api/colors");
      const data = await res.json();
      setColors(data);
    } catch (error) {
      console.error("Failed to fetch colors:", error);
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    if (!selectedColorId) return;

    const color = colors.find((c) => c.id === selectedColorId);
    if (!color) return;

    // Check if already added
    if (ingredients.some((ing) => ing.color.id === color.id)) {
      return;
    }

    setIngredients([...ingredients, { color, parts: 1 }]);
    setSelectedColorId("");
  };

  const updateParts = (colorId: string, delta: number) => {
    setIngredients(
      ingredients.map((ing) => {
        if (ing.color.id === colorId) {
          const newParts = Math.max(1, Math.min(10, ing.parts + delta));
          return { ...ing, parts: newParts };
        }
        return ing;
      })
    );
  };

  const removeIngredient = (colorId: string) => {
    setIngredients(ingredients.filter((ing) => ing.color.id !== colorId));
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
        alert("Recipe saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
    } finally {
      setSaving(false);
    }
  };

  const clearAll = () => {
    setIngredients([]);
    setMixedColor(null);
  };

  // Group colors by series
  const colorsBySeries = colors.reduce((acc, color) => {
    const seriesName = color.series.name;
    if (!acc[seriesName]) {
      acc[seriesName] = [];
    }
    acc[seriesName].push(color);
    return acc;
  }, {} as Record<string, Color[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Color Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Select Colors
          </CardTitle>
          <CardDescription>
            Choose colors from the Gaahleri collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedColorId} onValueChange={setSelectedColorId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a color to add" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(colorsBySeries).map(
                  ([seriesName, seriesColors]) => (
                    <div key={seriesName}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {seriesName}
                      </div>
                      {seriesColors.map((color) => (
                        <SelectItem
                          key={color.id}
                          value={color.id}
                          disabled={ingredients.some(
                            (ing) => ing.color.id === color.id
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  )
                )}
              </SelectContent>
            </Select>
            <Button onClick={addIngredient} disabled={!selectedColorId}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Ingredients */}
          <div className="space-y-3">
            <Label>Selected Colors ({ingredients.length})</Label>
            {ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No colors selected. Add colors to start mixing.
              </p>
            ) : (
              <div className="space-y-2">
                {ingredients.map((ing) => (
                  <div
                    key={ing.color.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div
                      className="w-10 h-10 rounded-md border shadow-sm shrink-0"
                      style={{ backgroundColor: ing.color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {ing.color.name}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {ing.color.series.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateParts(ing.color.id, -1)}
                        disabled={ing.parts <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-bold">
                        {ing.parts}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateParts(ing.color.id, 1)}
                        disabled={ing.parts >= 10}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeIngredient(ing.color.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {ingredients.length > 0 && (
            <Button variant="outline" onClick={clearAll} className="w-full">
              Clear All
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Right: Result */}
      <Card>
        <CardHeader>
          <CardTitle>Mixed Result</CardTitle>
          <CardDescription>
            See the result of mixing your selected colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Preview */}
          <div className="aspect-square rounded-xl border-4 border-border shadow-lg overflow-hidden">
            {mixedColor ? (
              <div
                className="w-full h-full"
                style={{ backgroundColor: mixedColor.hex }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">
                  Add colors to see the mix
                </p>
              </div>
            )}
          </div>

          {/* Color Info */}
          {mixedColor && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>HEX</Label>
                  <div className="font-mono text-lg">{mixedColor.hex}</div>
                </div>
                <div>
                  <Label>RGB</Label>
                  <div className="font-mono text-lg">{mixedColor.rgb}</div>
                </div>
              </div>

              {/* Recipe Summary */}
              <div className="pt-4 border-t">
                <Label>Recipe</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  {ingredients.map((ing, idx) => (
                    <span key={ing.color.id}>
                      {ing.parts} part{ing.parts > 1 ? "s" : ""}{" "}
                      {ing.color.name}
                      {idx < ingredients.length - 1 ? " + " : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => setIsSaveOpen(true)}
              disabled={!mixedColor || ingredients.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Recipe
            </Button>

            {/* Buy Links */}
            {ingredients.length > 0 && (
              <div className="space-y-2">
                <Label>Buy Colors</Label>
                <div className="grid gap-2">
                  {ingredients
                    .filter((ing) => ing.color.buyLink)
                    .map((ing) => (
                      <a
                        key={ing.color.id}
                        href={ing.color.buyLink!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Buy {ing.color.name}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                  className="w-16 h-16 rounded-md border shadow-sm"
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
