"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  compressImage,
  needsCompression,
  formatFileSize,
  type CompressionOptions,
} from "@/lib/image-compression";

export const DEFAULT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeKB: 600,
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
};

export interface UseImageUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  compression?: CompressionOptions;
  showCompressionToast?: boolean;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    maxSizeBytes = DEFAULT_MAX_FILE_SIZE,
    allowedTypes = DEFAULT_IMAGE_TYPES,
    compression = DEFAULT_COMPRESSION_OPTIONS,
    showCompressionToast = true,
  } = options;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const clearImage = useCallback(() => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setSelectedImage(null);
    setPreviewImage(null);
  }, [previewImage]);

  const setPreviewFromUrl = useCallback((url: string | null) => {
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(url);
  }, [previewImage]);

  const handleImageSelect = useCallback(
    async (file: File) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP"
        );
        return;
      }

      if (file.size > maxSizeBytes) {
        toast.error("حجم الصورة كبير جداً. الحد الأقصى هو 50 ميجابايت");
        return;
      }

      setIsCompressing(true);

      try {
        let processedFile = file;

        if (needsCompression(file, compression.maxSizeKB)) {
          if (showCompressionToast) {
            toast(`جاري ضغط الصورة ${file.name}...`, { icon: "ℹ️" });
          }

          const result = await compressImage(file, compression);

          if (showCompressionToast) {
            toast.success(
              `تم ضغط الصورة بنجاح! الحجم الأصلي: ${formatFileSize(
                result.originalSize
              )} → الحجم الجديد: ${formatFileSize(
                result.compressedSize
              )} (تم توفير ${result.compressionRatio}%)`
            );
          }

          processedFile = result.compressedFile;
        }

        if (previewImage && previewImage.startsWith("blob:")) {
          URL.revokeObjectURL(previewImage);
        }

        setSelectedImage(processedFile);
        setPreviewImage(URL.createObjectURL(processedFile));
      } catch {
        toast.error("حدث خطأ أثناء ضغط الصورة، سيتم استخدام الصورة الأصلية");

        if (previewImage && previewImage.startsWith("blob:")) {
          URL.revokeObjectURL(previewImage);
        }

        setSelectedImage(file);
        setPreviewImage(URL.createObjectURL(file));
      } finally {
        setIsCompressing(false);
      }
    },
    [allowedTypes, compression, maxSizeBytes, previewImage, showCompressionToast]
  );

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleImageSelect(file);
      }
      e.target.value = "";
    },
    [handleImageSelect]
  );

  return {
    selectedImage,
    previewImage,
    isCompressing,
    setSelectedImage,
    setPreviewImage: setPreviewFromUrl,
    handleImageSelect,
    handleFileInputChange,
    clearImage,
  };
}
