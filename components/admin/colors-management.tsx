"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { createColor, updateColor, deleteColor } from "@/app/admin/actions";
import { toast } from "sonner";

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
  badge: string | null;
  badgeColor: string | null;
  status: string | null;
  statusColor: string | null;
  seriesId: string;
  series: Series;
}

export default function ColorsManagement() {
  // 使用 SWR 进行数据缓存
  const {
    data: colors = [],
    isLoading: colorsLoading,
    mutate: mutateColors,
  } = useSWR<Color[]>("/api/admin/colors", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 2000,  // 2秒内不重复请求
  });
  const { data: series = [], isLoading: seriesLoading } = useSWR<Series[]>(
    "/api/series",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
  const loading = colorsLoading || seriesLoading;
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    hex: "",
    rgb: "",
    description: "",
    buyLink: "",
    badge: "",
    badgeColor: "",
    status: "",
    statusColor: "",
    seriesId: "",
  });

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      const res = await createColor(formData);
      if (res.success && res.color) {
        // 使用 SWR mutate 刷新数据
        await mutateColors();
        setIsAddOpen(false);
        resetForm();
        toast.success("Color created successfully");
      } else {
        toast.error("Failed to create color");
      }
    } catch (error) {
      console.error("Failed to add color:", error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedColor) return;
    setSubmitting(true);
    try {
      const res = await updateColor(selectedColor.id, formData);

      if (res.success) {
        await mutateColors();
        setIsEditOpen(false);
        setSelectedColor(null);
        resetForm();
        toast.success("Color updated successfully");
      } else {
        toast.error("Failed to update color");
      }
    } catch (error) {
      console.error("Failed to update color:", error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedColor) return;
    setSubmitting(true);
    try {
      const res = await deleteColor(selectedColor.id);

      if (res.success) {
        // 乐观更新
        mutateColors(
          colors.filter((c) => c.id !== selectedColor.id),
          false
        );
        setIsDeleteOpen(false);
        setSelectedColor(null);
        toast.success("Color deleted successfully");
      } else {
        toast.error("Failed to delete color");
      }
    } catch (error) {
      console.error("Failed to delete color:", error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      hex: "",
      rgb: "",
      description: "",
      buyLink: "",
      badge: "",
      badgeColor: "",
      status: "",
      statusColor: "",
      seriesId: "",
    });
  };

  const openEdit = (color: Color) => {
    setSelectedColor(color);
    setFormData({
      name: color.name,
      hex: color.hex,
      rgb: color.rgb,
      description: color.description || "",
      buyLink: color.buyLink || "",
      badge: color.badge || "",
      badgeColor: color.badgeColor || "",
      status: color.status || "",
      statusColor: color.statusColor || "",
      seriesId: color.seriesId,
    });
    setIsEditOpen(true);
  };

  const filteredColors = colors.filter(
    (color) =>
      color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.series?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search colors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Color
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Color</DialogTitle>
              <DialogDescription>
                Add a new color to the catalog
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="series">Series *</Label>
                  <Select
                    value={formData.seriesId}
                    onValueChange={(val) =>
                      setFormData({ ...formData, seriesId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select series" />
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hex">HEX Code *</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded border shrink-0"
                      style={{
                        backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(formData.hex)
                          ? formData.hex
                          : "transparent",
                      }}
                    />
                    <Input
                      id="hex"
                      value={formData.hex}
                      onChange={(e) =>
                        setFormData({ ...formData, hex: e.target.value })
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rgb">RGB Values *</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge (Optional)</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    placeholder="e.g., New, Popular"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badgeColor">Badge Color (Optional)</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded border shrink-0"
                      style={{
                        backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(formData.badgeColor)
                          ? formData.badgeColor
                          : "#6b7280",
                      }}
                    />
                    <Input
                      id="badgeColor"
                      value={formData.badgeColor}
                      onChange={(e) =>
                        setFormData({ ...formData, badgeColor: e.target.value.toUpperCase() })
                      }
                      placeholder="#6B7280"
                      className="font-mono"
                    />
                    <Input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(formData.badgeColor) ? formData.badgeColor : "#6b7280"}
                      onChange={(e) =>
                        setFormData({ ...formData, badgeColor: e.target.value.toUpperCase() })
                      }
                      className="w-10 h-10 p-1 cursor-pointer shrink-0"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status (Optional)</Label>
                  <Input
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    placeholder="e.g., Available, Out of Stock"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusColor">Status Color (Optional)</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded border shrink-0"
                      style={{
                        backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(formData.statusColor)
                          ? formData.statusColor
                          : "#3b82f6",
                      }}
                    />
                    <Input
                      id="statusColor"
                      value={formData.statusColor}
                      onChange={(e) =>
                        setFormData({ ...formData, statusColor: e.target.value.toUpperCase() })
                      }
                      placeholder="#3B82F6"
                      className="font-mono"
                    />
                    <Input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(formData.statusColor) ? formData.statusColor : "#3b82f6"}
                      onChange={(e) =>
                        setFormData({ ...formData, statusColor: e.target.value.toUpperCase() })
                      }
                      className="w-10 h-10 p-1 cursor-pointer shrink-0"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyLink">Buy Link (Optional)</Label>
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
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={
                  !formData.name ||
                  !formData.hex ||
                  !formData.rgb ||
                  !formData.seriesId ||
                  submitting
                }
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Color
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredColors.map((color) => (
              <TableRow key={color.id}>
                <TableCell>
                  <div
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: color.hex }}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {color.name}
                  <div className="text-xs text-muted-foreground font-mono">
                    {color.hex}
                  </div>
                </TableCell>
                <TableCell>{color.series?.name}</TableCell>
                <TableCell>
                  {color.badge && (
                    <Badge variant="secondary">{color.badge}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {color.status && (
                    <Badge variant="outline" className="capitalize">
                      {color.status.replace("_", " ")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(color)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedColor(color);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Color</DialogTitle>
            <DialogDescription>Edit color details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="edit-series">Series *</Label>
                <Select
                  value={formData.seriesId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, seriesId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select series" />
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-hex">HEX Code *</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded border shrink-0"
                    style={{
                      backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(formData.hex)
                        ? formData.hex
                        : "transparent",
                    }}
                  />
                  <Input
                    id="edit-hex"
                    value={formData.hex}
                    onChange={(e) =>
                      setFormData({ ...formData, hex: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rgb">RGB Values *</Label>
                <Input
                  id="edit-rgb"
                  value={formData.rgb}
                  onChange={(e) =>
                    setFormData({ ...formData, rgb: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-badge">Badge (Optional)</Label>
                <Input
                  id="edit-badge"
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                  placeholder="e.g., New, Popular"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-badgeColor">Badge Color (Optional)</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded border shrink-0"
                    style={{
                      backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(formData.badgeColor)
                        ? formData.badgeColor
                        : "#6b7280",
                    }}
                  />
                  <Input
                    id="edit-badgeColor"
                    value={formData.badgeColor}
                    onChange={(e) =>
                      setFormData({ ...formData, badgeColor: e.target.value.toUpperCase() })
                    }
                    placeholder="#6B7280"
                    className="font-mono"
                  />
                  <Input
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(formData.badgeColor) ? formData.badgeColor : "#6b7280"}
                    onChange={(e) =>
                      setFormData({ ...formData, badgeColor: e.target.value.toUpperCase() })
                    }
                    className="w-10 h-10 p-1 cursor-pointer shrink-0"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status (Optional)</Label>
                <Input
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  placeholder="e.g., Available, Out of Stock"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-statusColor">Status Color (Optional)</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded border shrink-0"
                    style={{
                      backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(formData.statusColor)
                        ? formData.statusColor
                        : "#3b82f6",
                    }}
                  />
                  <Input
                    id="edit-statusColor"
                    value={formData.statusColor}
                    onChange={(e) =>
                      setFormData({ ...formData, statusColor: e.target.value.toUpperCase() })
                    }
                    placeholder="#3B82F6"
                    className="font-mono"
                  />
                  <Input
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(formData.statusColor) ? formData.statusColor : "#3b82f6"}
                    onChange={(e) =>
                      setFormData({ ...formData, statusColor: e.target.value.toUpperCase() })
                    }
                    className="w-10 h-10 p-1 cursor-pointer shrink-0"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-buyLink">Buy Link (Optional)</Label>
              <Input
                id="edit-buyLink"
                value={formData.buyLink}
                onChange={(e) =>
                  setFormData({ ...formData, buyLink: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
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
                submitting
              }
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              color &quot;{selectedColor?.name}&quot; and remove it from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
