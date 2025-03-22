"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { HexColorPicker } from "react-colorful";
import Cropper from "react-easy-crop";
import { ImageData } from "@/data/images";
import { RotateCw, RotateCcw, Crop, Palette, Image as ImageIcon, Check, X } from "lucide-react";
import Image from "next/image";

// Define types locally instead of importing from react-easy-crop/types
interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageEditorProps {
  image: ImageData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImage: ImageData) => void;
}

// Helper function to create a canvas from cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = typeof window !== 'undefined' ? new window.Image() : {} as HTMLImageElement;
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string> => {
  if (typeof window === 'undefined') {
    return imageSrc; // Return original image on server side
  }

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return imageSrc;
  }

  // Set canvas dimensions to match the cropped image
  const maxSize = Math.max(image.width, image.height);
  canvas.width = maxSize;
  canvas.height = maxSize;

  // Translate canvas to center
  ctx.translate(maxSize / 2, maxSize / 2);

  // Apply rotation
  ctx.rotate(rotation * (Math.PI / 180));

  // Apply flips
  if (flip.horizontal) {
    ctx.scale(-1, 1);
  }
  if (flip.vertical) {
    ctx.scale(1, -1);
  }

  // Draw the image centered
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Extract cropped area
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // Create new canvas for the actual crop
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Paint cropped image
  ctx.putImageData(data, 0, 0);

  // As Base64 string
  return canvas.toDataURL("image/jpeg");
};

// Filter functions
const applyFilter = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  filter: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    overlay?: string;
  }
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Draw original image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Apply CSS filters
  let filterString = "";
  if (filter.brightness !== undefined) {
    filterString += `brightness(${filter.brightness}%) `;
  }
  if (filter.contrast !== undefined) {
    filterString += `contrast(${filter.contrast}%) `;
  }
  if (filter.saturation !== undefined) {
    filterString += `saturate(${filter.saturation}%) `;
  }
  if (filter.blur !== undefined) {
    filterString += `blur(${filter.blur}px) `;
  }

  if (filterString) {
    ctx.filter = filterString;
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
  }

  // Apply color overlay
  if (filter.overlay) {
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = filter.overlay;
    ctx.globalAlpha = 0.3; // Adjust opacity as needed
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
  }
};

export function ImageEditor({ image, isOpen, onClose, onSave }: ImageEditorProps) {
  const [activeTab, setActiveTab] = useState("crop");

  // Crop states
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Filter states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [overlayColor, setOverlayColor] = useState("#ffffff");
  const [useOverlay, setUseOverlay] = useState(false);

  // Preview states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyChanges = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        return image; // Return original image on server side
      }

      // First handle cropping and rotation
      let processedImage = image.src;

      if (croppedAreaPixels) {
        processedImage = await getCroppedImg(
          image.src,
          croppedAreaPixels,
          rotation,
          { horizontal: false, vertical: false }
        );
      }

      // Then handle filters
      const tempImage = await createImage(processedImage);
      const canvas = document.createElement("canvas");
      canvas.width = tempImage.width;
      canvas.height = tempImage.height;

      applyFilter(canvas, tempImage, {
        brightness,
        contrast,
        saturation,
        blur,
        overlay: useOverlay ? overlayColor : undefined
      });

      const finalImageUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPreviewUrl(finalImageUrl);

      // Get dimensions of the processed image
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.src = finalImageUrl;
      });

      // Return edited image data
      return {
        ...image,
        src: finalImageUrl,
        width: dimensions.width,
        height: dimensions.height,
      };
    } catch (error) {
      console.error("Error applying image edits:", error);
      return image;
    }
  }, [image, croppedAreaPixels, rotation, brightness, contrast, saturation, blur, overlayColor, useOverlay]);

  const handleSave = async () => {
    const editedImage = await applyChanges();
    onSave(editedImage);
    onClose();
  };

  const handlePreview = async () => {
    await applyChanges();
  };

  const resetEdits = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setUseOverlay(false);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="crop" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="crop" className="flex items-center gap-2">
              <Crop className="h-4 w-4" />
              <span>Crop & Rotate</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Filters</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crop" className="mt-0">
            <div className="relative h-[400px] overflow-hidden rounded-md border">
              <Cropper
                image={previewUrl || image.src}
                crop={crop}
                zoom={zoom}
                aspect={image.width / image.height}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                rotation={rotation}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Zoom</label>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setZoom(value[0])}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rotation</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRotation((prev) => prev - 90)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Slider
                    value={[rotation]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={(value) => setRotation(value[0])}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRotation((prev) => prev + 90)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="filters" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brightness</label>
                  <Slider
                    value={[brightness]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setBrightness(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>{brightness}%</span>
                    <span>200%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contrast</label>
                  <Slider
                    value={[contrast]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setContrast(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>{contrast}%</span>
                    <span>200%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Saturation</label>
                  <Slider
                    value={[saturation]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setSaturation(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>{saturation}%</span>
                    <span>200%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Blur</label>
                  <Slider
                    value={[blur]}
                    min={0}
                    max={10}
                    step={0.1}
                    onValueChange={(value) => setBlur(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0px</span>
                    <span>{blur.toFixed(1)}px</span>
                    <span>10px</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useOverlay}
                      onChange={(e) => setUseOverlay(e.target.checked)}
                      id="use-overlay"
                    />
                    <label htmlFor="use-overlay" className="text-sm font-medium">
                      Color Overlay
                    </label>
                  </div>

                  {useOverlay && (
                    <div className="mt-2">
                      <HexColorPicker color={overlayColor} onChange={setOverlayColor} />
                      <div
                        className="mt-2 h-8 rounded-md border"
                        style={{ backgroundColor: overlayColor }}
                      />
                    </div>
                  )}
                </div>

                <Button className="w-full mt-4" onClick={handlePreview}>
                  Preview Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="flex justify-center border rounded-md overflow-hidden">
              <div className="relative w-full h-[400px]">
                <Image
                  src={previewUrl || image.src}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="text-center mt-2 text-sm text-muted-foreground">
              This is a preview of your edited image.
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetEdits}>
              Reset All
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
          <Button onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
