"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, ShoppingCart, BookOpen } from "lucide-react";

interface RecipeIngredient {
  id: string;
  parts: number;
  color: {
    id: string;
    name: string;
    hex: string;
    rgb: string;
    buyLink: string | null;
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

export default function MyRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/recipes");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecipe) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${selectedRecipe.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRecipes(recipes.filter((r) => r.id !== selectedRecipe.id));
        setIsDeleteOpen(false);
        setSelectedRecipe(null);
      }
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDeleteOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          My Saved Recipes
        </CardTitle>
        <CardDescription>Your saved color mixing recipes</CardDescription>
      </CardHeader>
      <CardContent>
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Recipes Yet</h3>
            <p className="text-muted-foreground">
              Create your first color mix and save it to see it here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Color Preview */}
                <div
                  className="h-32 w-full"
                  style={{ backgroundColor: recipe.resultHex }}
                />

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold">{recipe.name}</h3>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono">{recipe.resultHex}</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="font-mono text-muted-foreground">
                      RGB: {recipe.resultRgb}
                    </span>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Ingredients:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.map((ing) => (
                        <Badge
                          key={ing.id}
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: ing.color.hex }}
                          />
                          {ing.parts}x {ing.color.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-1">
                      {recipe.ingredients
                        .filter((ing) => ing.color.buyLink)
                        .slice(0, 3)
                        .map((ing) => (
                          <a
                            key={ing.id}
                            href={ing.color.buyLink!}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Buy ${ing.color.name}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </a>
                        ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openDeleteDialog(recipe)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedRecipe?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
