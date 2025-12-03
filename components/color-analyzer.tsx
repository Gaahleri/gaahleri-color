"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Pipette,
  Search,
  Loader2,
  ShoppingCart,
  Palette,
  ImageIcon,
  X,
} from "lucide-react";

interface ColorMatch {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  buyLink: string | null;
  series: { id: string; name: string };
  parts: number;
}

interface MixSuggestion {
  colors: ColorMatch[];
  resultHex: string;
  resultRgb: number[];
  matchPercentage: number;
}

interface ClosestMatch {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  buyLink: string | null;
  series: { id: string; name: string };
  matchPercentage: number;
}

export default function ColorAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<{
    r: number;
    g: number;
    b: number;
    hex: string;
  } | null>(null);
  const [closestMatches, setClosestMatches] = useState<ClosestMatch[]>([]);
  const [mixSuggestions, setMixSuggestions] = useState<MixSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      setPickedColor(null);
      setClosestMatches([]);
      setMixSuggestions([]);

      // Draw image on canvas
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size to match image while limiting max size
        const maxSize = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isPicking) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Scale coordinates to canvas size
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = Math.floor(x * scaleX);
      const canvasY = Math.floor(y * scaleY);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      const hex = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

      setPickedColor({ r, g, b, hex });
      setIsPicking(false);
    },
    [isPicking]
  );

  const handleManualColorInput = (hex: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    setPickedColor({ r, g, b, hex });
  };

  const analyzeColor = async () => {
    if (!pickedColor) return;

    setLoading(true);
    try {
      // Find closest matches
      const closestRes = await fetch("/api/colors/find-closest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          r: pickedColor.r,
          g: pickedColor.g,
          b: pickedColor.b,
        }),
      });

      if (closestRes.ok) {
        const closestData = await closestRes.json();
        setClosestMatches(closestData.matches);
      }

      // Get mix suggestions
      const suggestRes = await fetch("/api/colors/suggest-mix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          r: pickedColor.r,
          g: pickedColor.g,
          b: pickedColor.b,
        }),
      });

      if (suggestRes.ok) {
        const suggestData = await suggestRes.json();
        setMixSuggestions(suggestData.suggestions);
      }
    } catch (error) {
      console.error("Failed to analyze color:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPickedColor(null);
    setClosestMatches([]);
    setMixSuggestions([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload Image
          </CardTitle>
          <CardDescription>
            Upload an image to pick colors from, or manually enter a color code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Image
            </Button>
            {image && (
              <>
                <Button
                  variant={isPicking ? "default" : "outline"}
                  onClick={() => setIsPicking(!isPicking)}
                >
                  <Pipette className="mr-2 h-4 w-4" />
                  {isPicking ? "Click to Pick" : "Pick Color"}
                </Button>
                <Button variant="ghost" size="icon" onClick={clearImage}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Manual Color Input */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="manual-hex">Or enter color code</Label>
              <Input
                id="manual-hex"
                type="text"
                placeholder="#FF5733"
                onChange={(e) => handleManualColorInput(e.target.value)}
              />
            </div>
            <Input
              type="color"
              className="w-16 h-10 p-1 cursor-pointer"
              onChange={(e) => handleManualColorInput(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Canvas Display */}
      {image && (
        <Card>
          <CardContent className="p-4">
            <div
              className={`relative inline-block ${
                isPicking ? "cursor-crosshair" : ""
              }`}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full h-auto border rounded-lg"
              />
              {isPicking && (
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  Click to pick a color
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Picked Color Display */}
      {pickedColor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Selected Color
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 rounded-lg border-2 shadow-lg"
                style={{ backgroundColor: pickedColor.hex }}
              />
              <div className="space-y-1">
                <p className="font-mono text-lg">{pickedColor.hex}</p>
                <p className="text-muted-foreground">
                  RGB: {pickedColor.r}, {pickedColor.g}, {pickedColor.b}
                </p>
                <Button
                  onClick={analyzeColor}
                  disabled={loading}
                  className="mt-2"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Find Matches
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {(closestMatches.length > 0 || mixSuggestions.length > 0) && (
        <Tabs defaultValue="closest" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="closest">Closest Colors</TabsTrigger>
            <TabsTrigger value="mix">Mix Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="closest" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Closest Matching Colors</CardTitle>
                <CardDescription>
                  Gaahleri colors that are closest to your selected color
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {closestMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div
                        className="w-16 h-16 rounded-lg border shadow"
                        style={{ backgroundColor: match.hex }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{match.name}</h4>
                          <Badge variant="secondary">{match.series.name}</Badge>
                          <Badge
                            variant={
                              match.matchPercentage > 80 ? "default" : "outline"
                            }
                          >
                            {match.matchPercentage}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {match.hex} | RGB: {match.rgb}
                        </p>
                      </div>
                      {match.buyLink && (
                        <a
                          href={match.buyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mix" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Mix Suggestions</CardTitle>
                <CardDescription>
                  Try mixing these colors to achieve your target color
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mixSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {suggestion.colors.map((color, colorIdx) => (
                            <div key={colorIdx} className="text-center">
                              <div
                                className="w-12 h-12 rounded border shadow"
                                style={{ backgroundColor: color.hex }}
                              />
                              <p className="text-xs mt-1">
                                {color.parts} parts
                              </p>
                            </div>
                          ))}
                        </div>
                        <span className="text-2xl text-muted-foreground">
                          =
                        </span>
                        <div className="text-center">
                          <div
                            className="w-16 h-16 rounded-lg border-2 shadow"
                            style={{ backgroundColor: suggestion.resultHex }}
                          />
                          <Badge className="mt-2">
                            {suggestion.matchPercentage}% match
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.colors.map((color, colorIdx) => (
                          <div
                            key={colorIdx}
                            className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full"
                          >
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-sm font-medium">
                              {color.name} ({color.parts} parts)
                            </span>
                            {color.buyLink && (
                              <a
                                href={color.buyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                <ShoppingCart className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
