"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageData } from "@/data/images";
import { Blurhash } from "react-blurhash";
import { getBlurhashFromImage } from "@/lib/blurhash-utils";

interface ImageItemProps {
  image: ImageData;
  onImageClick: (image: ImageData) => void;
  layout: "grid" | "masonry";
}

export function ImageItem({ image, onImageClick, layout }: ImageItemProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(true); // Always consider in view for simplicity
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Use a fixed aspect ratio of 3:2 for all images
  const aspectRatio = 3/2;

  // Reset error state when the image src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [image.src]);

  // Get blurhash from the image data or from our utility function - memoize to prevent recalculation
  const blurhash = useMemo(() =>
    image.blurhash || getBlurhashFromImage(image),
    [image]
  );

  // Card click handler - separated from the drag handler
  const handleCardClick = () => {
    onImageClick(image);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true); // Still mark as loaded to remove blur placeholder
    console.error(`Failed to load image: ${image.src}`);
  };

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-lg group cursor-pointer h-full"
      onClick={handleCardClick}
    >
      <CardContent className="p-2 h-full flex flex-col">
        <div ref={imageRef} className="relative overflow-hidden flex-grow">
          <AspectRatio ratio={aspectRatio} className="bg-muted overflow-hidden">
            {!isLoaded && (
              <div className="absolute inset-0 z-10">
                <Blurhash
                  hash={blurhash}
                  width="100%"
                  height="100%"
                  resolutionX={32}
                  resolutionY={32}
                  punch={1}
                />
              </div>
            )}

            <div className="relative w-full h-full">
              {hasError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                  Unable to load image
                </div>
              ) : (
                <Image
                  src={image.src}
                  alt={image.alt || "Gallery image"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-cover transition-opacity duration-500 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  } group-hover:scale-105 transition-transform`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  unoptimized
                  loading="eager"
                />
              )}
            </div>

            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-medium">View</span>
            </div>
          </AspectRatio>
        </div>

        <div className="p-2 mt-2 h-[5rem] flex flex-col">
          <h3 className="font-medium truncate">{image.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 h-[2.5rem]">{image.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
