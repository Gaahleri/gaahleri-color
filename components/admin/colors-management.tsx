"use client";

import { useState, useEffect } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";

interface Series {
  id: string;
  name: string;
}

interface Color {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  description: string | null;
  buyLink: string | null;
  seriesId: string;
  series: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function ColorsManagement() {
  const [colors, setColors] = useState<Color[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [filterSeriesId, setFilterSeriesId] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    hex: "#000000",
    rgb: "0,0,0",
    description: "",
    buyLink: "",
    seriesId: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSeriesId]);

  const fetchData = async () => {
    await Promise.all([fetchColors(), fetchSeries()]);
    setLoading(false);
  };

  const fetchColors = async () => {
    try {
      const url =
        filterSeriesId && filterSeriesId !== "all"
          ? `/api/admin/colors?seriesId=${filterSeriesId}`
          : "/api/admin/colors";
      const res = await fetch(url);
      const data = await res.json();
      setColors(data);
    } catch (error) {
      console.error("Failed to fetch colors:", error);
    }
  };

  const fetchSeries = async () => {
    try {
      const res = await fetch("/api/admin/series");
      const data = await res.json();
      setSeries(data);
    } catch (error) {
      console.error("Failed to fetch series:", error);
    }
  };

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(
        result[3],
        16
      )}`;
    }
    return "0,0,0";
  };

  const handleHexChange = (hex: string) => {
    setFormData({
      ...formData,
      hex,
      rgb: hexToRgb(hex),
    });
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        resetForm();
        fetchColors();
      }
    } catch (error) {
      console.error("Failed to create color:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedColor) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/colors/${selectedColor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditOpen(false);
        setSelectedColor(null);
        resetForm();
        fetchColors();
      }
    } catch (error) {
      console.error("Failed to update color:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedColor) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/colors/${selectedColor.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteOpen(false);
        setSelectedColor(null);
        fetchColors();
      }
    } catch (error) {
      console.error("Failed to delete color:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      hex: "#000000",
      rgb: "0,0,0",
      description: "",
      buyLink: "",
      seriesId: "",
    });
  };

  const openEditDialog = (c: Color) => {
    setSelectedColor(c);
    setFormData({
      name: c.name,
      hex: c.hex,
      rgb: c.rgb,
      description: c.description || "",
      buyLink: c.buyLink || "",
      seriesId: c.seriesId,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (c: Color) => {
    setSelectedColor(c);
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Colors Management</CardTitle>
          <CardDescription>Manage individual paint colors</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filterSeriesId} onValueChange={setFilterSeriesId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by series" />
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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Color
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Color</DialogTitle>
                <DialogDescription>
                  Add a new paint color to the collection
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="series">Series *</Label>
                  <Select
                    value={formData.seriesId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, seriesId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a series" />
                    </SelectTrigger>
                    <SelectContent>
                      {series.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Crimson Red"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hex">Hex Color *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="hex"
                        type="color"
                        value={formData.hex}
                        onChange={(e) => handleHexChange(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.hex}
                        onChange={(e) => handleHexChange(e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rgb">RGB *</Label>
                    <Input
                      id="rgb"
                      value={formData.rgb}
                      onChange={(e) =>
                        setFormData({ ...formData, rgb: e.target.value })
                      }
                      placeholder="0,0,0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyLink">Buy Link</Label>
                  <Input
                    id="buyLink"
                    value={formData.buyLink}
                    onChange={(e) =>
                      setFormData({ ...formData, buyLink: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe this color..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    !formData.name ||
                    !formData.hex ||
                    !formData.rgb ||
                    !formData.seriesId ||
                    saving
                  }
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>Hex / RGB</TableHead>
              <TableHead>Buy Link</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No colors found. Create your first color!
                </TableCell>
              </TableRow>
            ) : (
              colors.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div
                      className="w-10 h-10 rounded-md border shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.series.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{c.hex}</div>
                      <div className="text-muted-foreground">RGB: {c.rgb}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.buyLink ? (
                      <a
                        href={c.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(c)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(c)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Color</DialogTitle>
            <DialogDescription>Update color information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-series">Series *</Label>
              <Select
                value={formData.seriesId}
                onValueChange={(v) => setFormData({ ...formData, seriesId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {series.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-hex">Hex Color *</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-hex"
                    type="color"
                    value={formData.hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rgb">RGB *</Label>
                <Input
                  id="edit-rgb"
                  value={formData.rgb}
                  onChange={(e) =>
                    setFormData({ ...formData, rgb: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-buyLink">Buy Link</Label>
              <Input
                id="edit-buyLink"
                value={formData.buyLink}
                onChange={(e) =>
                  setFormData({ ...formData, buyLink: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={
                !formData.name ||
                !formData.hex ||
                !formData.rgb ||
                !formData.seriesId ||
                saving
              }
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Color</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedColor?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
