"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit2, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Helper to track purchase click (fire-and-forget)
const trackPurchaseClick = async (colorId: string) => {
  try {
    await fetch("/api/purchase-clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colorId }),
    });
  } catch (error) {
    // Silently fail - this is just tracking
    console.error("Failed to track purchase click:", error);
  }
};

interface RecipeIngredient {
  id: string;
  parts: number;
  color: {
    id: string;
    name: string;
    hex: string;
    rgb: string;
    buyLink: string | null;
    badge: string | null;
    badgeColor: string | null;
    status: string | null;
    statusColor: string | null;
    series: {
      id: string;
      name: string;
    };
    updatedAt: string;
  };
}

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  resultHex: string;
  resultRgb: string;
  ingredients: RecipeIngredient[];
  createdAt: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  onUpdate: (updatedRecipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
}

export default function RecipeCard({
  recipe,
  onUpdate,
  onDelete,
}: RecipeCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(recipe.name);
  const [editDescription, setEditDescription] = useState(
    recipe.description || ""
  );
  const [saving, setSaving] = useState(false);

  const handleEdit = async () => {
    if (!editName) {
      toast.error("Recipe name is required");
      return;
    }

    setSaving(true);

    // Store previous state for rollback
    const previousRecipe = { ...recipe };

    // Optimistic update: apply changes to UI immediately and close dialog
    const optimisticRecipe: Recipe = {
      ...recipe,
      name: editName,
      description: editDescription || null,
    };
    onUpdate(optimisticRecipe);
    setIsEditOpen(false);

    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription || null,
        }),
      });

      if (res.ok) {
        // Replace with server response to ensure consistency
        const updated = await res.json();
        onUpdate(updated);
        // Success: no toast needed
      } else {
        // Rollback on failure
        onUpdate(previousRecipe);
        toast.error("Failed to update recipe");
      }
    } catch (error) {
      // Rollback on exception
      onUpdate(previousRecipe);
      console.error("Failed to update recipe:", error);
      toast.error("Failed to update recipe");
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = () => {
    setEditName(recipe.name);
    setEditDescription(recipe.description || "");
    setIsEditOpen(true);
  };

  return (
    <>
      <div className="group relative flex flex-col p-4 rounded-xl border transition-all hover:shadow-md bg-card h-auto">
        {/* Action Buttons - Top Right */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-full shadow-sm"
            onClick={openEditDialog}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-full shadow-sm"
            onClick={() => onDelete(recipe.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>

        {/* Result Color Swatch */}
        <div
          className="w-16 h-16 rounded-full shadow-sm mb-3 border mx-auto"
          style={{ backgroundColor: recipe.resultHex }}
        />

        {/* Recipe Info */}
        <div className="text-center w-full space-y-1 mb-3">
          <div
            className="font-medium text-sm truncate w-full px-8"
            title={recipe.name}
          >
            {recipe.name}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {recipe.resultHex}
          </div>
          {recipe.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 px-2">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Ingredients Section */}
        <div className="w-full space-y-2 mt-auto">
          <div className="text-xs font-medium text-muted-foreground">
            Ingredients:
          </div>
          <div className="space-y-1.5">
            {recipe.ingredients.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center gap-2 text-xs bg-secondary/50 rounded-md p-2"
              >
                {/* Shopping Cart Icon */}
                {ing.color.buyLink ? (
                  <a
                    href={ing.color.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      trackPurchaseClick(ing.color.id);
                    }}
                    title={`Buy ${ing.color.name}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0"
                    >
                      <ShoppingCart className="h-3 w-3" />
                    </Button>
                  </a>
                ) : (
                  <div className="h-5 w-5 shrink-0" />
                )}

                {/* Color Dot */}
                <div
                  className="w-3 h-3 rounded-full border shrink-0"
                  style={{ backgroundColor: ing.color.hex }}
                />

                {/* Color Info */}
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{ing.parts}×</span>{" "}
                  <span className="truncate">{ing.color.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
            <DialogDescription>
              Update your recipe name and description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Recipe Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g., My Perfect Pink"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description (Optional)</Label>
              <Textarea
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Notes about this color..."
              />
            </div>

            {/* Preview */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
              <div
                className="w-16 h-16 rounded-full border shadow-sm"
                style={{ backgroundColor: recipe.resultHex }}
              />
              <div>
                <div className="font-medium">{recipe.resultHex}</div>
                <div className="text-sm text-muted-foreground">
                  {recipe.ingredients.length} color
                  {recipe.ingredients.length > 1 ? "s" : ""} mixed
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!editName || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
