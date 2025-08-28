'use client';

import { useState, useRef } from 'react';
import { Upload, X, Camera, Eye } from 'lucide-react';
import { heicTo, isHeic } from 'heic-to';

interface ImageUploadARProps {
  onImageUpload: (imageUrl: string) => void;
  onRemoveImage: () => void;
  uploadedImage?: string;
  onPreview?: () => void;
}

export default function ImageUploadAR({ onImageUpload, onRemoveImage, uploadedImage, onPreview }: ImageUploadARProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        let fileToProcess = file;
        
        // Check if the file is HEIC and convert it to JPEG
        if (await isHeic(file)) {
          console.log('HEIC file detected, converting to JPEG...');
          const jpegBlob = await heicTo({
            blob: file,
            type: 'image/jpeg',
            quality: 0.8
          });
          fileToProcess = new File([jpegBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
            type: 'image/jpeg'
          });
          console.log('HEIC converted to JPEG successfully');
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          onImageUpload(imageUrl);
        };
        reader.readAsDataURL(fileToProcess);
      } catch (error) {
        console.error('Error processing image file:', error);
        // Fallback to original file processing
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          onImageUpload(imageUrl);
        };
        reader.readAsDataURL(file);
      }
     }
   };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (uploadedImage) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Background image uploaded</span>
          </div>
          <div className="flex items-center space-x-2">
            {onPreview && (
              <button
                onClick={onPreview}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            )}
            <button
              onClick={onRemoveImage}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Background Image (Optional)
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          <span className="font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, GIF up to 10MB
        </p>
      </div>
    </div>
  );
}