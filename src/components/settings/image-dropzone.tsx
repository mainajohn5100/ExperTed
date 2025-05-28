
'use client';

import { useState, useCallback, type DragEvent, type ChangeEvent, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageDropzoneProps {
  currentImageUrl?: string | null;
  onFileSelected: (file: File | null) => void;
  className?: string;
  imageClassName?: string;
  disabled?: boolean;
}

export function ImageDropzone({
  currentImageUrl,
  onFileSelected,
  className,
  imageClassName = "h-32 w-32 rounded-full object-cover",
  disabled = false,
}: ImageDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setDragOver(false);
  }, [disabled]);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) return;
      setDragOver(false);
      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          setPreviewUrl(URL.createObjectURL(file));
          onFileSelected(file);
        } else {
          // Handle invalid file type
          alert('Please drop an image file.');
          onFileSelected(null);
        }
      }
    },
    [onFileSelected, disabled]
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          setPreviewUrl(URL.createObjectURL(file));
          onFileSelected(file);
        } else {
          // Handle invalid file type
          alert('Please select an image file.');
          onFileSelected(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
          }
        }
      } else {
        onFileSelected(null); // No file selected
      }
    },
    [onFileSelected, disabled]
  );

  const handleRemoveImage = () => {
    if (disabled) return;
    setPreviewUrl(null);
    onFileSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };
  
  // Update preview if currentImageUrl prop changes externally
  useState(() => {
    setPreviewUrl(currentImageUrl || null);
  });


  return (
    <div className={cn('relative group', className)}>
      <div
        className={cn(
          'border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer transition-colors',
          dragOver && !disabled && 'border-primary bg-primary/10',
          'hover:border-muted-foreground/70',
          disabled && 'cursor-not-allowed opacity-60'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        {previewUrl ? (
          <div className="relative w-fit mx-auto">
            <Image
              src={previewUrl}
              alt="Avatar preview"
              width={128}
              height={128}
              className={cn(imageClassName, "border-2 border-border shadow-sm")}
              data-ai-hint="user avatar"
            />
             {!disabled && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering file input
                    handleRemoveImage();
                    }}
                    title="Remove image"
                >
                    <XCircle className="h-4 w-4" />
                </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
            <UploadCloud className="h-12 w-12" />
            <p className="text-sm">Drag & drop an image here, or click to select</p>
            <p className="text-xs">(Max 2MB, JPG, PNG, GIF)</p>
          </div>
        )}
      </div>
    </div>
  );
}
