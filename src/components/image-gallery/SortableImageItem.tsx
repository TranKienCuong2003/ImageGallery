"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageData } from "@/data/images";
import { ImageItem } from "./ImageItem";
import { GripVertical } from "lucide-react";

interface SortableImageItemProps {
  image: ImageData;
  onImageClick: (image: ImageData) => void;
  layout: "grid" | "masonry";
  isDraggable: boolean;
}

export function SortableImageItem({
  image,
  onImageClick,
  layout,
  isDraggable
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.id.toString()
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full relative">
      {isDraggable && (
        <div
          className="absolute top-2 right-2 cursor-move p-1 rounded-full bg-black/40 opacity-0 hover:opacity-100 z-30 transition-opacity duration-200"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-white" />
        </div>
      )}

      <ImageItem
        image={image}
        onImageClick={onImageClick}
        layout={layout}
      />
    </div>
  );
}
