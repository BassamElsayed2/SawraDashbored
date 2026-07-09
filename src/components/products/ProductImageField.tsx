"use client";

import Image from "next/image";
import { getImageUrl } from "@/lib/image-url";

interface ProductImageFieldProps {
  previewImage: string | null;
  selectedImage: File | null;
  serverImage?: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSelected: () => void;
  onClearServer?: () => void;
  imageError?: string;
  requireImage?: boolean;
}

export function ProductImageField({
  previewImage,
  selectedImage,
  serverImage,
  onFileChange,
  onClearSelected,
  onClearServer,
  imageError,
  requireImage = false,
}: ProductImageFieldProps) {
  return (
    <div className="sm:col-span-2 mb-[20px] sm:mb-0">
      <label className="mb-[10px] text-black dark:text-white font-medium block">
        صورة المنتج
        {requireImage && <span className="text-red-500"> *</span>}
      </label>

      <div id="fileUploader">
        <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
          <div className="flex items-center justify-center">
            <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
              <i className="ri-upload-2-line"></i>
            </div>
            <p className="leading-[1.5]">
              <strong className="text-black dark:text-white">اضغط لرفع</strong>
              <br /> صورة المنتج من هنا
            </p>
          </div>
          <input
            type="file"
            id="image"
            accept="image/*"
            className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
            onChange={onFileChange}
          />
        </div>
        {imageError && (
          <span className="text-red-700 text-sm">{imageError}</span>
        )}

        <div className="mt-[10px] flex flex-wrap gap-2">
          {serverImage && (
            <div className="relative w-[50px] h-[50px]">
              <Image
                src={getImageUrl(serverImage)}
                alt="server-img"
                width={50}
                height={50}
                className="rounded-md object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
              {onClearServer && (
                <button
                  type="button"
                  className="absolute top-[-5px] right-[-5px] bg-red-600 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                  onClick={onClearServer}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {selectedImage && previewImage && (
            <div className="relative w-[50px] h-[50px]">
              <Image
                src={previewImage}
                alt="selected-img"
                width={50}
                height={50}
                className="rounded-md object-cover w-full h-full"
              />
              <button
                type="button"
                className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                onClick={onClearSelected}
              >
                ✕
              </button>
            </div>
          )}

          {selectedImage && previewImage && !serverImage && (
            <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
              {selectedImage.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
