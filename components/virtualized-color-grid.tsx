"use client";

import { useEffect, useRef, useState } from "react";
import ColorCard from "@/components/color-card";

interface Color {
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

interface VirtualizedColorGridProps {
  colors: Color[];
  selectedColorIds?: Set<string>;
  savedColorIds?: Set<string>;
  onCardClick?: (color: Color) => void;
  onSaveClick?: (colorId: string, e: React.MouseEvent) => void;
  showActions?: boolean;
  className?: string;
}

export default function VirtualizedColorGrid({
  colors,
  selectedColorIds = new Set(),
  savedColorIds = new Set(),
  onCardClick,
  onSaveClick,
  showActions = true,
  className = "",
}: VirtualizedColorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 24 });
  const [columnCount, setColumnCount] = useState(4);

  // Constants
  const CARD_WIDTH = 200;
  const CARD_HEIGHT = 240;
  const MIN_COLUMNS = 2;
  const MAX_COLUMNS = 6;
  const ITEMS_PER_LOAD = 24;

  // Update column count on resize
  useEffect(() => {
    const updateColumns = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const cols = Math.max(
          MIN_COLUMNS,
          Math.min(MAX_COLUMNS, Math.floor(width / CARD_WIDTH))
        );
        setColumnCount(cols);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const sentinel = document.getElementById("scroll-sentinel");
    if (!sentinel || colors.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleRange.end < colors.length) {
          setVisibleRange((prev) => ({
            ...prev,
            end: Math.min(colors.length, prev.end + ITEMS_PER_LOAD),
          }));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [colors.length, visibleRange.end]);

  // Get visible colors
  const visibleColors = colors.slice(visibleRange.start, visibleRange.end);

  // Show empty state
  if (colors.length === 0) {
    return (
      <div ref={containerRef} className={className} style={{ minHeight: "400px" }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">No colors found</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
        {visibleColors.map((color) => {
          const isSelected = selectedColorIds.has(color.id);
          const isSaved = savedColorIds.has(color.id);

          return (
            <ColorCard
              key={color.id}
              color={color}
              isSelected={isSelected}
              isSaved={isSaved}
              onCardClick={onCardClick}
              onSaveClick={onSaveClick}
              showActions={showActions}
            />
          );
        })}
      </div>
      
      {/* Sentinel for intersection observer */}
      {visibleRange.end < colors.length && (
        <div
          id="scroll-sentinel"
          className="flex items-center justify-center py-4"
        >
          <div className="text-sm text-muted-foreground">Loading more...</div>
        </div>
      )}
    </div>
  );
}
