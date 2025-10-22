/**
 * مكتبة ضغط الصور
 * تقوم بضغط الصور إلى حجم محدد مع الحفاظ على الجودة
 */

export interface CompressionOptions {
  maxSizeKB: number; // الحد الأقصى للحجم بالكيلوبايت
  quality: number; // جودة الصورة (0.1 - 1.0)
  maxWidth?: number; // العرض الأقصى
  maxHeight?: number; // الارتفاع الأقصى
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * ضغط صورة واحدة
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {
    maxSizeKB: 600,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
  }
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      try {
        // حساب الأبعاد الجديدة مع الحفاظ على النسبة
        const { width, height } = calculateDimensions(
          img.width,
          img.height,
          options.maxWidth || 1920,
          options.maxHeight || 1080
        );

        // تعيين أبعاد الكانفاس
        canvas.width = width;
        canvas.height = height;

        // رسم الصورة على الكانفاس
        ctx?.drawImage(img, 0, 0, width, height);

        // ضغط الصورة
        compressToTargetSize(canvas, file, options)
          .then((result) => resolve(result))
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("فشل في تحميل الصورة"));
    };

    // تحميل الصورة
    img.src = URL.createObjectURL(file);
  });
}

/**
 * حساب الأبعاد الجديدة مع الحفاظ على النسبة
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // إذا كانت الصورة أكبر من الحد الأقصى، قم بتصغيرها
  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;

    if (width > height) {
      width = maxWidth;
      height = width / aspectRatio;
    } else {
      height = maxHeight;
      width = height * aspectRatio;
    }
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * ضغط الصورة إلى الحجم المطلوب
 */
async function compressToTargetSize(
  canvas: HTMLCanvasElement,
  originalFile: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const targetSizeBytes = options.maxSizeKB * 1024;
  let quality = options.quality;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const blob = await canvasToBlob(canvas, originalFile.type, quality);

    if (!blob) {
      throw new Error("فشل في تحويل الكانفاس إلى blob");
    }

    // إذا كان الحجم مناسب أو وصلنا للحد الأدنى من الجودة
    if (blob.size <= targetSizeBytes || quality <= 0.1) {
      const compressedFile = new File([blob], originalFile.name, {
        type: originalFile.type,
        lastModified: Date.now(),
      });

      return {
        compressedFile,
        originalSize: originalFile.size,
        compressedSize: blob.size,
        compressionRatio: Math.round(
          ((originalFile.size - blob.size) / originalFile.size) * 100
        ),
      };
    }

    // تقليل الجودة للضغط أكثر
    quality -= 0.1;
    attempts++;
  }

  // إذا فشلنا في الوصول للحجم المطلوب، نعيد الصورة بأقل جودة
  const finalBlob = await canvasToBlob(canvas, originalFile.type, 0.1);
  if (!finalBlob) {
    throw new Error("فشل في ضغط الصورة");
  }

  const compressedFile = new File([finalBlob], originalFile.name, {
    type: originalFile.type,
    lastModified: Date.now(),
  });

  return {
    compressedFile,
    originalSize: originalFile.size,
    compressedSize: finalBlob.size,
    compressionRatio: Math.round(
      ((originalFile.size - finalBlob.size) / originalFile.size) * 100
    ),
  };
}

/**
 * تحويل الكانفاس إلى blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

/**
 * ضغط عدة صور
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (const file of files) {
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch {
      // في حالة الفشل، نعيد الصورة الأصلية
      results.push({
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
      });
    }
  }

  return results;
}

/**
 * فحص ما إذا كانت الصورة تحتاج ضغط
 */
export function needsCompression(file: File, maxSizeKB: number = 600): boolean {
  return file.size > maxSizeKB * 1024;
}

/**
 * تنسيق حجم الملف للعرض
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
