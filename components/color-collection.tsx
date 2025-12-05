"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Badge removed — not used in this file
import { Plus, Trash2, Loader2, Palette, ShoppingCart } from "lucide-react";
import ColorCard from "@/components/color-card";
import VirtualizedColorGrid from "@/components/virtualized-color-grid";
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

interface UserRecord {
  id: string;
  isFavorite: boolean;
  note: string | null;
  color: Color;
  createdAt: string;
}

export default function ColorCollection() {
  // 使用 SWR 进行数据缓存
  const { data: colors = [], isLoading: colorsLoading } = useSWR<Color[]>(
    "/api/colors",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );
  const {
    data: records = [],
    isLoading: recordsLoading,
    mutate: mutateRecords,
  } = useSWR<UserRecord[]>("/api/user/colors", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const loading = colorsLoading || recordsLoading;
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const addColor = async () => {
    if (!selectedColorId) return;
    setAdding(true);
    // Optimistic update: show temp record immediately
    const previous = records || [];
    const colorToAdd = colors.find((c) => c.id === selectedColorId);
    const tempRecord: UserRecord = {
      id: `temp-${Date.now()}`,
      isFavorite: false,
      note: null,
      color: colorToAdd as Color,
      createdAt: new Date().toISOString(),
    };

    try {
      // Apply optimistic update (no revalidation yet)
      mutateRecords([tempRecord, ...previous], false);

      const res = await fetch("/api/user/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colorId: selectedColorId }),
      });

      if (res.ok) {
        const newRecord = await res.json();
        // Replace temp with server record
        mutateRecords([newRecord, ...previous], false);
        setSelectedColorId("");
      } else {
        // Rollback
        mutateRecords(previous, false);
        toast.error("Failed to add color");
      }
    } catch (error) {
      // Rollback
      mutateRecords(previous, false);
      console.error("Failed to add color:", error);
      toast.error("Failed to add color");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    setDeleting(true);
    const previous = records || [];

    // Optimistic update: remove from UI immediately
    mutateRecords(
      previous.filter((r) => r.id !== selectedRecord.id),
      false
    );
    // Close the dialog and clear selection right away
    setIsDeleteOpen(false);
    setSelectedRecord(null);

    try {
      const res = await fetch(`/api/user/colors/${selectedRecord.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        // Rollback on failure
        mutateRecords(previous, false);
        toast.error("Failed to remove color");
      }
    } catch (error) {
      // Rollback on exception
      mutateRecords(previous, false);
      console.error("Failed to delete record:", error);
      toast.error("Failed to remove color");
    } finally {
      setDeleting(false);
    }
  };

  // Group colors by series for selector
  const colorsBySeries = colors.reduce((acc, color) => {
    const seriesName = color.series.name;
    if (!acc[seriesName]) {
      acc[seriesName] = [];
    }
    acc[seriesName].push(color);
    return acc;
  }, {} as Record<string, Color[]>);

  // Get saved color IDs
  const savedColorIds = new Set(records.map((r) => r.color.id));

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
          <Palette className="h-5 w-5" />
          My Color Collection
        </CardTitle>
        <CardDescription>
          Save your favorite colors from the Gaahleri catalog
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Color */}
        <div className="flex gap-2">
          <Select value={selectedColorId} onValueChange={setSelectedColorId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a color to save" />
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
                        disabled={savedColorIds.has(color.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name}
                          {savedColorIds.has(color.id) && (
                            <span className="text-xs text-muted-foreground">
                              (saved)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                )
              )}
            </SelectContent>
          </Select>
          <Button onClick={addColor} disabled={!selectedColorId || adding}>
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Saved Colors */}
        {records.length === 0 ? (
          <div className="text-center py-8">
            <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No colors saved yet. Add some colors to your collection!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {records.map((record) => (
              <div key={record.id} className="space-y-2">
                <ColorCard
                  color={record.color}
                  isSelected={false}
                  isSaved={record.isFavorite}
                  onCardClick={() => {}}
                  showActions={false}
                />

                {/* Additional Actions Below Card */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    {record.color.buyLink ? (
                      <a
                        href={record.color.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackPurchaseClick(record.color.id)}
                      >
                        <Button variant="outline" size="sm">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Buy
                        </Button>
                      </a>
                    ) : (
                      <div />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedRecord(record);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
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
            <AlertDialogTitle>Remove Color</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &quot;{selectedRecord?.color.name}&quot; from your
              collection?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
