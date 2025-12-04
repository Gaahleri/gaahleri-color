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
  status: string | null;
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

export default function ColorCard({
  color,
  isSelected = false,
  isSaved = false,
  onCardClick,
  onSaveClick,
  showActions = true,
}: ColorCardProps) {
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
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-full shadow-sm"
              onClick={(e) => onSaveClick(color.id, e)}
              disabled={isSaved}
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5",
                  isSaved ? "fill-red-500 text-red-500" : ""
                )}
              />
            </Button>
          )}
          {color.buyLink && (
            <a
              href={color.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
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

      {/* Circular Color Swatch */}
      <div
        className="w-16 h-16 rounded-full shadow-sm mb-3 border"
        style={{ backgroundColor: color.hex }}
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
          <Badge variant="secondary" className="text-xs">
            {color.badge}
          </Badge>
        )}
        {color.status && (
          <Badge variant="outline" className="text-xs capitalize">
            {color.status.replace("_", " ")}
          </Badge>
        )}
      </div>
    </div>
  );
}
