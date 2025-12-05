import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorData {
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
}

interface ColorCardProps {
  color: ColorData;
  isSelected?: boolean;
  isSaved?: boolean;
  onCardClick?: (color: ColorData) => void;
  onSaveClick?: (colorId: string, e: React.MouseEvent) => void;
  showActions?: boolean;
}

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

export default function ColorCard({
  color,
  isSelected = false,
  isSaved = false,
  onCardClick,
  onSaveClick,
  showActions = true,
}: ColorCardProps) {
  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Track the click asynchronously (fire-and-forget)
    trackPurchaseClick(color.id);
    // The actual navigation is handled by the <a> tag
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer bg-card h-[220px]",
        isSelected ? "ring-2 ring-primary border-primary" : ""
      )}
      onClick={() => onCardClick?.(color)}
    >
      {/* Action Buttons - Top Right Corner (Vertical Stack) */}
      {showActions && (
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {onSaveClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full shadow-sm"
              onClick={(e) => onSaveClick(color.id, e)}
              aria-pressed={isSaved}
              aria-label={isSaved ? "Remove from library" : "Save to library"}
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isSaved
                    ? "fill-pink-500 text-pink-500"
                    : "text-muted-foreground hover:text-pink-400"
                )}
              />
            </Button>
          )}
          {color.buyLink && (
            <a
              href={color.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleBuyClick}
            >
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 rounded-full shadow-sm"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>
      )}

      {/* Circular Color Swatch - Lazy loaded */}
      <div
        className="w-16 h-16 rounded-full shadow-sm mb-3 border"
        style={{ backgroundColor: color.hex }}
        data-color-id={color.id}
      />

      {/* Info */}
      <div className="text-center w-full space-y-1 mb-3">
        <div className="font-medium text-sm truncate w-full" title={color.name}>
          {color.name}
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {color.hex}
        </div>
        <div className="text-[10px] text-muted-foreground truncate w-full">
          {color.series.name}
        </div>
      </div>

      {/* Bottom Section: Badge and Status (Vertical Stack) */}
      <div className="w-full mt-auto flex flex-col gap-1 items-center min-h-[44px]">
        {color.badge && (
          <Badge 
            className="text-xs text-white"
            style={{ 
              backgroundColor: color.badgeColor || "#6b7280",
              borderColor: color.badgeColor || "#6b7280"
            }}
          >
            {color.badge}
          </Badge>
        )}
        {color.status && (
          <Badge 
            className="text-xs capitalize text-white"
            style={{ 
              backgroundColor: color.statusColor || "#3b82f6",
              borderColor: color.statusColor || "#3b82f6"
            }}
          >
            {color.status.replace("_", " ")}
          </Badge>
        )}
      </div>
    </div>
  );
}
