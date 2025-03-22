"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Masonry from "react-masonry-css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { SortableImageItem } from "./SortableImageItem";
import { ImageData, allCategories, filterByCategory } from "@/data/images";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Grid3X3,
  Grid2X2,
  X,
  Upload,
  SlidersHorizontal,
  Download,
  Share,
  Edit,
  Play,
  Tag
} from "lucide-react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ImageUploader } from "./ImageUploader";
import { ImageItem } from "./ImageItem";
import { CategoryFilter } from "./CategoryFilter";
import { ImageEditor } from "./ImageEditor";
import { SharingDialog } from "./SharingDialog";
import { SlideshowDialog } from "./SlideshowDialog";

interface ImageGalleryProps {
  images: ImageData[];
  columns?: number;
}

type LayoutType = "grid" | "masonry";

export function ImageGallery({
  images: initialImages,
  columns = 3
}: ImageGalleryProps) {
  // Basic layout and display states
  const [selectedLayout, setSelectedLayout] = useState(columns);
  const [layoutType, setLayoutType] = useState<LayoutType>("grid");

  // Image collection state
  const [images, setImages] = useState<ImageData[]>(initialImages);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Lightbox states
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Feature dialog states
  const [showUploader, setShowUploader] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [sharingImage, setSharingImage] = useState<ImageData | null>(null);
  const [slideshowOpen, setSlideshowOpen] = useState(false);

  // References
  const galleryRef = useRef<HTMLDivElement>(null);

  // Derived state for filtered images - calculated on demand rather than stored in state
  const filteredImages = useMemo(() => {
    let filtered = [...images];

    // Apply category filter
    if (selectedCategory) {
      filtered = filterByCategory(filtered, selectedCategory);
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(image =>
        image.title.toLowerCase().includes(query) ||
        image.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [images, selectedCategory, searchQuery]);

  // URL for sharing
  const galleryUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '';

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 8 pixels before activating
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with 8px tolerance for movement
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    })
  );

  // Handle image click to open lightbox
  const handleImageClick = useCallback((clickedImage: ImageData) => {
    // Find image index in a safer way
    const index = filteredImages.findIndex(img => img.id === clickedImage.id);
    if (index !== -1) {
      setCurrentImageIndex(index);
      setLightboxOpen(true);
    }
  }, [filteredImages]);

  // Handle download of current image in lightbox
  const handleDownload = useCallback((image: ImageData) => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `${image.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle sharing of current image
  const handleShare = useCallback((image: ImageData) => {
    setSharingImage(image);
  }, []);

  // Handle editing of an image
  const handleEdit = useCallback((image: ImageData) => {
    setEditingImage(image);
  }, []);

  // Handle saving edited image
  const handleSaveEdit = useCallback((editedImage: ImageData) => {
    setImages(prevImages =>
      prevImages.map(img => img.id === editedImage.id ? editedImage : img)
    );
    setEditingImage(null);
  }, []);

  // Handle start slideshow
  const handleStartSlideshow = useCallback(() => {
    setSlideshowOpen(true);
  }, []);

  // Get grid class based on selected layout (for grid layout)
  const getGridClass = () => {
    switch (selectedLayout) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case 5:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      case 6:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  // Break points for masonry layout - more fine-grained
  const breakpointColumnsObj = {
    default: selectedLayout,
    2560: selectedLayout,
    1920: selectedLayout > 5 ? 5 : selectedLayout,
    1536: selectedLayout > 4 ? 4 : selectedLayout,
    1280: selectedLayout > 4 ? 3 : selectedLayout,
    1024: selectedLayout > 3 ? 3 : selectedLayout,
    768: 2,
    640: 1
  };

  // Format images for lightbox
  const lightboxSlides = useMemo(() => filteredImages.map(image => ({
    src: image.src,
    alt: image.alt,
    width: image.width,
    height: image.height,
    title: image.title,
    description: image.description
  })), [filteredImages]);

  // Toggle between grid and masonry layout
  const toggleLayout = () => {
    setLayoutType(layoutType === "grid" ? "masonry" : "grid");
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end for reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;
    if (active.id === over.id) return;

    try {
      setImages((prevItems) => {
        const oldIndex = prevItems.findIndex(item => item.id.toString() === active.id);
        const newIndex = prevItems.findIndex(item => item.id.toString() === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return prevItems; // No change if either index is invalid
        }

        return arrayMove(prevItems, oldIndex, newIndex);
      });
    } catch (error) {
      console.error("Error during drag and drop:", error);
      // Continue with application, no need to throw or alert
    }
  }, []);

  // Handle new image upload
  const handleImageUploaded = (newImage: ImageData) => {
    setImages(prevImages => [
      {
        ...newImage,
        id: Date.now(), // Ensure unique ID
        editable: true, // Mark as editable since it's a user upload
        categories: newImage.categories || [] // Initialize with no categories if not provided
      },
      ...prevImages
    ]);
    setShowUploader(false);
  };

  // Get the active image for the drag overlay
  const getActiveImage = () => {
    if (!activeId) return null;
    return images.find(image => image.id.toString() === activeId) || null;
  };

  // Get current image for lightbox actions
  const getCurrentImage = useMemo(() => {
    if (!filteredImages.length || currentImageIndex < 0 || currentImageIndex >= filteredImages.length) {
      return null;
    }
    return filteredImages[currentImageIndex];
  }, [filteredImages, currentImageIndex]);

  // Show additional layout options for larger screens
  const [showExtraLayoutOptions, setShowExtraLayoutOptions] = useState(false);

  // Set up window size only once on mount
  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined') {
      // Define the handler function
      const updateLayoutOptions = () => {
        if (isMounted) {
          const shouldShowExtra = window.innerWidth >= 1280;
          if (showExtraLayoutOptions !== shouldShowExtra) {
            setShowExtraLayoutOptions(shouldShowExtra);
          }
        }
      };

      // Initial check
      updateLayoutOptions();

      // Debounce resize events to improve performance
      let resizeTimer: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateLayoutOptions, 100);
      };

      // Add resize listener
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        isMounted = false;
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer);
      };
    }
  }, [showExtraLayoutOptions]); // Include in dependencies to prevent unnecessary updates

  // Add lightbox buttons
  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  return (
    <div ref={galleryRef} className="w-full space-y-6">
      {/* Upload section */}
      {showUploader && (
        <ImageUploader onImageUploaded={handleImageUploaded} />
      )}

      {/* Header with controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Image Gallery</h2>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {searchQuery ? (
                <X
                  className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => setSearchQuery("")}
                />
              ) : (
                <Search className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={allCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Gallery controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Add image button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowUploader(prevState => !prevState);
              }}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              <span>{showUploader ? "Cancel" : "Add Image"}</span>
            </Button>

            {/* Reorder toggle */}
            <Button
              variant={isDraggable ? "default" : "outline"}
              size="sm"
              onClick={() => setIsDraggable(!isDraggable)}
              className="flex items-center gap-1"
              disabled={filteredImages.length <= 1}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{isDraggable ? "Done Reordering" : "Reorder"}</span>
            </Button>

            {/* Slideshow button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartSlideshow}
              className="flex items-center gap-1"
              disabled={filteredImages.length === 0}
            >
              <Play className="h-4 w-4" />
              <span>Slideshow</span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Layout type toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLayout}
              className="flex items-center gap-1"
            >
              {layoutType === "grid" ? (
                <>
                  <Grid3X3 className="h-4 w-4" />
                  <span>Grid</span>
                </>
              ) : (
                <>
                  <Grid2X2 className="h-4 w-4" />
                  <span>Masonry</span>
                </>
              )}
            </Button>

            {/* Column count selector */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium hidden sm:inline">Columns:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, ...(showExtraLayoutOptions ? [5, 6] : [])].map((layout) => (
                  <button
                    key={layout}
                    onClick={() => setSelectedLayout(layout)}
                    className={`h-8 w-8 rounded border ${
                      selectedLayout === layout
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    } flex items-center justify-center transition-colors`}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show result count when filtering */}
      {(searchQuery || selectedCategory) && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredImages.length} {filteredImages.length === 1 ? 'result' : 'results'}
          </Badge>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              for "{searchQuery}"
            </span>
          )}
          {selectedCategory && (
            <span className="text-sm text-muted-foreground">
              in category "{selectedCategory}"
            </span>
          )}
        </div>
      )}

      {/* No results message */}
      {filteredImages.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No images found matching your criteria.</p>
          <div className="flex gap-2 justify-center mt-2">
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            )}
            {selectedCategory && (
              <Button
                variant="link"
                onClick={() => setSelectedCategory(null)}
              >
                Clear category filter
              </Button>
            )}
          </div>
        </div>
      )}

      {/* DnD Context for drag and drop reordering */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Image grid */}
        {filteredImages.length > 0 && layoutType === 'grid' && (
          <SortableContext
            items={filteredImages.map(img => img.id.toString())}
            strategy={rectSortingStrategy}
          >
            <div className={`grid gap-6 ${getGridClass()}`}>
              {filteredImages.map((image) => (
                <div key={image.id} className="h-full w-full">
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    onImageClick={handleImageClick}
                    layout="grid"
                    isDraggable={isDraggable}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        )}

        {/* Masonry layout */}
        {filteredImages.length > 0 && layoutType === 'masonry' && (
          <SortableContext
            items={filteredImages.map(img => img.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex w-auto -ml-6" // Increased negative margin for wider gap
              columnClassName="pl-6 bg-clip-content" // Increased padding for wider gap
            >
              {filteredImages.map((image) => (
                <div key={image.id} className="mb-6"> {/* Increased margin for consistent gap */}
                  <SortableImageItem
                    image={image}
                    onImageClick={handleImageClick}
                    layout="masonry"
                    isDraggable={isDraggable}
                  />
                </div>
              ))}
            </Masonry>
          </SortableContext>
        )}

        {/* Drag overlay for the currently dragged item */}
        <DragOverlay>
          {activeId && getActiveImage() && (
            <div className="opacity-80 scale-95 shadow-xl h-full">
              <ImageItem
                image={getActiveImage()!}
                onImageClick={() => {}}
                layout={layoutType}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Lightbox with custom action buttons */}
      <Lightbox
        open={lightboxOpen}
        close={handleLightboxClose}
        slides={lightboxSlides}
        index={currentImageIndex}
        plugins={[Zoom, Captions, Thumbnails]}
        captions={{ descriptionTextAlign: "center" }}
        controller={{ closeOnBackdropClick: true }}
        carousel={{ finite: filteredImages.length <= 1 }}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
        thumbnails={{
          position: 'bottom',
          width: 120,
          height: 80,
        }}
        render={{
          iconPrev: () => <span className="lightbox-nav-btn">←</span>,
          iconNext: () => <span className="lightbox-nav-btn">→</span>,
          iconClose: () => <span className="lightbox-close-btn">×</span>,
        }}
      />

      {/* Action buttons for the current image in lightbox */}
      {lightboxOpen && getCurrentImage && (
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-[9999] flex gap-2 bg-black/70 rounded-full p-2">
          <button
            className="p-2 bg-black/50 rounded-full text-white"
            onClick={() => {
              if (getCurrentImage) handleDownload(getCurrentImage);
            }}
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            className="p-2 bg-black/50 rounded-full text-white"
            onClick={() => {
              setLightboxOpen(false);
              if (getCurrentImage) handleShare(getCurrentImage);
            }}
            title="Share"
          >
            <Share className="w-5 h-5" />
          </button>

          {getCurrentImage?.editable && (
            <button
              className="p-2 bg-black/50 rounded-full text-white"
              onClick={() => {
                setLightboxOpen(false);
                if (getCurrentImage) handleEdit(getCurrentImage);
              }}
              title="Edit"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}

          <button
            className="p-2 bg-black/50 rounded-full text-white"
            onClick={() => {
              setLightboxOpen(false);
              handleStartSlideshow();
            }}
            title="Slideshow"
          >
            <Play className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Editing Dialog */}
      {editingImage && (
        <ImageEditor
          image={editingImage}
          isOpen={!!editingImage}
          onClose={() => setEditingImage(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Sharing Dialog */}
      {sharingImage && (
        <SharingDialog
          isOpen={!!sharingImage}
          onClose={() => setSharingImage(null)}
          image={sharingImage}
          galleryUrl={galleryUrl}
        />
      )}

      {/* Slideshow Dialog */}
      <SlideshowDialog
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
        images={filteredImages}
        initialImageIndex={currentImageIndex}
      />

      {/* Instructions for keyboard navigation */}
      {lightboxOpen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-full z-[9999]">
          Use keyboard: ← → to navigate, Esc to close
        </div>
      )}
    </div>
  );
}
