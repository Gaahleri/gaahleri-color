"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Loader2, BookOpen } from "lucide-react";
import RecipeCard from "@/components/recipe-card";
import { toast } from "sonner";

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
    status: string | null;
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

export default function MyRecipes() {
  // 使用 SWR 进行数据缓存
  const {
    data: recipes = [],
    isLoading: loading,
    mutate: mutateRecipes,
  } = useSWR<Recipe[]>("/api/recipes", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = (updatedRecipe: Recipe) => {
    // 乐观更新
    mutateRecipes(
      recipes.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r)),
      false
    );
  };

  const handleDeleteClick = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecipeId) return;
    setDeleting(true);

    const previous = recipes || [];
    const recipeIdToDelete = selectedRecipeId;

    // Optimistic update: remove from UI immediately and close dialog
    mutateRecipes(
      previous.filter((r) => r.id !== recipeIdToDelete),
      false
    );
    setIsDeleteOpen(false);
    setSelectedRecipeId(null);

    try {
      const res = await fetch(`/api/recipes/${recipeIdToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        // Rollback on failure
        mutateRecipes(previous, false);
        toast.error("Failed to delete recipe");
      }
      // Success: no toast needed
    } catch (error) {
      // Rollback on exception
      mutateRecipes(previous, false);
      console.error("Failed to delete recipe:", error);
      toast.error("Failed to delete recipe");
    } finally {
      setDeleting(false);
    }
  };

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

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
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onUpdate={handleUpdate}
                onDelete={handleDeleteClick}
              />
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
              onClick={handleDeleteConfirm}
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
