"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ImageData } from "@/data/images";
import { Play, Pause, SkipBack, SkipForward, X, Settings } from "lucide-react";
import Image from "next/image";

interface SlideshowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageData[];
  initialImageIndex?: number;
}

export function SlideshowDialog({
  isOpen,
  onClose,
  images,
  initialImageIndex = 0,
}: SlideshowDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [interval, setInterval] = useState(5); // seconds
  const [showSettings, setShowSettings] = useState(false);

  // Use ref for timeout instead of state to avoid dependency issues
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle manual navigation
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  // Auto-advance slides when playing
  useEffect(() => {
    if (!isOpen) return;

    let intervalId: number | null = null;

    if (isPlaying && typeof window !== 'undefined') {
      intervalId = window.setInterval(() => {
        goToNext();
      }, interval * 1000);
    }

    return () => {
      if (intervalId !== null && typeof window !== 'undefined') {
        window.clearInterval(intervalId);
      }
    };
  }, [isPlaying, interval, goToNext, isOpen]);

  // Hide controls after a delay
  useEffect(() => {
    // Exit early if window is not available
    if (typeof window === 'undefined') return;

    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }

    // Only set a timeout if controls are visible
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        // Only hide controls when playing
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    }

    // Cleanup function
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
  }, [showControls, isPlaying]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        goToNext();
      } else if (event.key === "ArrowLeft") {
        goToPrevious();
      } else if (event.key === " ") {
        setIsPlaying((prev) => !prev);
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, goToNext, goToPrevious]);

  // Safe check in case images array is empty
  if (images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <div
          className="relative w-full h-[80vh] bg-black"
          onMouseMove={() => setShowControls(true)}
          onClick={() => setShowControls(true)}
        >
          {/* Image display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Image caption */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 transform transition-transform duration-300 ${
              showControls ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <h3 className="text-xl font-bold">{currentImage.title}</h3>
            <p className="text-sm opacity-80">{currentImage.description}</p>
          </div>

          {/* Close button */}
          <button
            className={`absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white transform transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Controls overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-between px-6 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            } pointer-events-none`}
          >
            <Button
              variant="outline"
              className="rounded-full bg-black/50 border-white/30 text-white pointer-events-auto"
              onClick={goToPrevious}
            >
              <SkipBack className="h-6 w-6" />
            </Button>

            <Button
              variant="outline"
              className="rounded-full bg-black/50 border-white/30 text-white h-16 w-16 pointer-events-auto"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>

            <Button
              variant="outline"
              className="rounded-full bg-black/50 border-white/30 text-white pointer-events-auto"
              onClick={goToNext}
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* Bottom controls */}
          <div
            className={`absolute bottom-24 left-0 right-0 flex items-center justify-center gap-4 px-6 py-3 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2 bg-black/70 rounded-full px-4 py-2">
              <Button
                variant="ghost"
                className="h-8 text-white hover:bg-white/20"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </Button>

              {showSettings && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white">Speed:</span>
                  <Slider
                    value={[interval]}
                    min={1}
                    max={10}
                    step={0.5}
                    className="w-24"
                    onValueChange={(value) => setInterval(value[0])}
                  />
                  <span className="text-xs text-white">{interval}s</span>
                </div>
              )}

              <div className="text-sm text-white">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
