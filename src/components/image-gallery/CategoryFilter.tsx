"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group categories to ensure "nature" and other common categories are first
  const priorityCategories = ["nature", "landscape", "urban", "water", "winter"];
  const sortedCategories = [...categories].sort((a, b) => {
    const aIndex = priorityCategories.indexOf(a);
    const bIndex = priorityCategories.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  // Decide how many categories to show when collapsed
  const collapsedCount = 8;
  const visibleCategories = isExpanded ? sortedCategories : sortedCategories.slice(0, collapsedCount);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Categories</h3>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => onSelectCategory(null)}
          >
            Clear filter
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleCategories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer hover:bg-primary/10 ${
              selectedCategory === category ? "" : "hover:text-foreground"
            }`}
            onClick={() => onSelectCategory(selectedCategory === category ? null : category)}
          >
            {category}
            {selectedCategory === category && <X className="ml-1 h-3 w-3" />}
          </Badge>
        ))}

        {sortedCategories.length > collapsedCount && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-1 h-3 w-3" />
                Show fewer
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-3 w-3" />
                Show more ({sortedCategories.length - collapsedCount})
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
