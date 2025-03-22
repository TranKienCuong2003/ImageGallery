"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageUp, X } from 'lucide-react';
import { ImageData } from '@/data/images';
import { processImageUpload } from '@/lib/image-utils';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUploaded: (image: ImageData) => void;
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file dragging events - use useCallback to prevent unnecessary re-renders
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFile = useCallback(async (file: File) => {
    // Reset any previous errors
    setError(null);

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setIsProcessing(true);

    try {
      // Create URL for the image file
      const imageUrl = URL.createObjectURL(file);
      setFilePreview(imageUrl);
      setDraggedFile(file);

      // Process the image and get image data
      const newImage = await processImageUpload(file);

      // Pass the new image data to the parent component
      onImageUploaded(newImage);

      // Reset the uploader
      setDraggedFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try again with a different image.');
    } finally {
      setIsProcessing(false);
    }
  }, [onImageUploaded]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleCancel = useCallback(() => {
    setDraggedFile(null);
    setFilePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Card className="w-full p-4 mb-6">
      <div className="text-xl font-bold mb-4">Add New Image</div>

      {!filePreview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <ImageUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            <span className="font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            PNG, JPG, GIF up to 10MB
          </p>

          {error && (
            <p className="text-sm text-red-500 mt-2">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="w-full rounded-lg overflow-hidden relative aspect-video bg-muted">
            {filePreview && (
              <Image
                src={filePreview}
                alt="Preview"
                fill
                className="object-contain"
                onLoadingComplete={() => {}}
              />
            )}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <div className="text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto"></div>
                  <p className="mt-3">Processing image...</p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {draggedFile && (
        <div className="mt-4">
          <p className="font-medium truncate">{draggedFile.name}</p>
          <p className="text-sm text-muted-foreground">
            {Math.round(draggedFile.size / 1024)} KB
          </p>
        </div>
      )}

      {isProcessing && (
        <div className="mt-3 text-sm text-muted-foreground">
          This may take a moment depending on the image size...
        </div>
      )}
    </Card>
  );
}
