"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Heart,
  Trash2,
  Loader2,
  Palette,
  ShoppingCart,
} from "lucide-react";
import ColorCard from "@/components/color-card";

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
  const [colors, setColors] = useState<Color[]>([]);
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchColors(), fetchRecords()]);
    setLoading(false);
  };

  const fetchColors = async () => {
    try {
      const res = await fetch("/api/colors");
      if (res.ok) {
        const data = await res.json();
        setColors(data);
      }
    } catch (error) {
      console.error("Failed to fetch colors:", error);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/user/colors");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    }
  };

  const addColor = async () => {
    if (!selectedColorId) return;
    setAdding(true);
    try {
      const res = await fetch("/api/user/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colorId: selectedColorId }),
      });
      if (res.ok) {
        const newRecord = await res.json();
        setRecords([newRecord, ...records]);
        setSelectedColorId("");
      }
    } catch (error) {
      console.error("Failed to add color:", error);
    } finally {
      setAdding(false);
    }
  };

  const toggleFavorite = async (record: UserRecord) => {
    try {
      const res = await fetch(`/api/user/colors/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !record.isFavorite }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRecords(records.map((r) => (r.id === record.id ? updated : r)));
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/user/colors/${selectedRecord.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRecords(records.filter((r) => r.id !== selectedRecord.id));
        setIsDeleteOpen(false);
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
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
                  onSaveClick={(_, e) => {
                    e.stopPropagation();
                    toggleFavorite(record);
                  }}
                  showActions={true}
                />
                
                {/* Additional Actions Below Card */}
                <div className="flex items-center justify-between px-2">
                  {record.color.buyLink ? (
                    <a
                      href={record.color.buyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Buy
                      </Button>
                    </a>
                  ) : (
                    <div />
                  )}
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
