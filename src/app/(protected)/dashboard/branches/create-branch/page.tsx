"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createBranch } from "@/services/apiBranchQR";
import { uploadBranchImage } from "@/services/apiUpload";
import toast from "react-hot-toast";
import {
  compressImage,
  needsCompression,
  formatFileSize,
} from "../../../../../lib/image-compression";
import dynamic from "next/dynamic";

// Load GoogleMapPicker dynamically to avoid SSR issues
const GoogleMapPicker = dynamic(
  () => import("../../../../../components/GoogleMapPicker"),
  { ssr: false }
);

type FormData = {
  name_ar: string;
  name_en: string;
  address_ar: string;
  address_en: string;
  phone: string;
  email?: string;
  google_map?: string;
  lat?: number;
  lng?: number;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function CreateBranch() {
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>();

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(
        "نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP"
      );
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى هو 50 ميجابايت");
      return;
    }

    try {
      // فحص ما إذا كانت الصورة تحتاج ضغط
      if (needsCompression(file, 600)) {
        toast(`جاري ضغط الصورة ${file.name}...`, { icon: "ℹ️" });

        const compressionResult = await compressImage(file, {
          maxSizeKB: 600,
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1080,
        });

        // عرض معلومات الضغط
        toast.success(
          `تم ضغط الصورة بنجاح! الحجم الأصلي: ${formatFileSize(
            compressionResult.originalSize
          )} → الحجم الجديد: ${formatFileSize(
            compressionResult.compressedSize
          )} (تم توفير ${compressionResult.compressionRatio}%)`
        );

        // Cleanup previous preview URL
        if (previewImage) {
          URL.revokeObjectURL(previewImage);
        }

        setSelectedImage(compressionResult.compressedFile);
        setPreviewImage(URL.createObjectURL(compressionResult.compressedFile));
      } else {
        // الصورة لا تحتاج ضغط
        // Cleanup previous preview URL
        if (previewImage) {
          URL.revokeObjectURL(previewImage);
        }

        setSelectedImage(file);
        setPreviewImage(URL.createObjectURL(file));
      }
    } catch {
      toast.error("حدث خطأ أثناء ضغط الصورة، سيتم استخدام الصورة الأصلية");

      // Cleanup previous preview URL
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }

      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      let imageUrl: string | undefined = undefined;

      // Upload image first if selected
      if (selectedImage) {
        try {
          toast("جاري رفع الصورة...", { icon: "📤" });
          const uploadResponse = await uploadBranchImage(selectedImage);
          imageUrl = uploadResponse.imageUrl;
          toast.success("تم رفع الصورة بنجاح");
        } catch {
          toast.error("فشل في رفع الصورة، سيتم إنشاء الفرع بدون صورة");
          // Continue without image
        }
      }

      // Create branch with all required fields
      const branchData = {
        name_ar: data.name_ar,
        name_en: data.name_en,
        address_ar: data.address_ar,
        address_en: data.address_en,
        phone: data.phone,
        email: data.email || undefined,
        lat: data.lat || 0,
        lng: data.lng || 0,
        image_url: imageUrl,
      };

      await createBranch(branchData);

      reset();
      setSelectedImage(null);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(null);
      toast.success("تم إنشاء فرع بنجاح");
      router.push("/dashboard/branches");
    } catch {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="gap-[25px]">
        <div className="xl:col-span-3 2xl:col-span-2">
          <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <div className="trezo-card-title">
                <h5 className="!mb-0">إنشاء فرع</h5>
              </div>
            </div>

            <div className="trezo-card-content sm:grid sm:grid-cols-2 sm:gap-[25px]">
              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  اسم الفرع (ar)
                </label>
                <input
                  {...register("name_ar", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.name_ar && (
                  <p className="text-red-500 mt-1">{errors.name_ar.message}</p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  اسم الفرع (en)
                </label>
                <input
                  {...register("name_en", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.name_en && (
                  <p className="text-red-500 mt-1">{errors.name_en.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  اختر موقع الفرع على الخريطة
                </label>
                <GoogleMapPicker
                  onLocationSelect={(lat, lng) => {
                    setValue("lat", lat);
                    setValue("lng", lng);
                    toast.success(
                      `تم تحديد الموقع: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
                    );
                  }}
                  initialLat={watch("lat")}
                  initialLng={watch("lng")}
                />
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  خط العرض - Latitude (يمكن التعديل)
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("lat", { valueAsNumber: true })}
                  placeholder="24.7136"
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                {errors.lat && (
                  <p className="text-red-500 mt-1">{errors.lat.message}</p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  خط الطول - Longitude (يمكن التعديل)
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("lng", { valueAsNumber: true })}
                  placeholder="46.6753"
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                {errors.lng && (
                  <p className="text-red-500 mt-1">{errors.lng.message}</p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  العنوان(ar)
                </label>
                <input
                  {...register("address_ar", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.address_ar && (
                  <p className="text-red-500 mt-1">
                    {errors.address_ar.message}
                  </p>
                )}
              </div>
              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  العنوان (en)
                </label>
                <input
                  {...register("address_en", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.address_en && (
                  <p className="text-red-500 mt-1">
                    {errors.address_en.message}
                  </p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  رقم الهاتف
                </label>
                <input
                  {...register("phone", {
                    minLength: {
                      value: 3,
                      message: "رقم الهاتف يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  placeholder=""
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.phone && (
                  <p className="text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  اختر الصوره (اختياري)
                </label>
                <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[65px] px-[20px] border border-gray-200 dark:border-[#172036]">
                  <div className="flex items-center justify-center">
                    <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                      <i className="ri-upload-2-line"></i>
                    </div>
                    <p className="text-black dark:text-white">
                      <strong>اضغط لرفع الصورة</strong>
                      <br /> JPG, PNG, WEBP (الحد الأقصى 50 ميجابايت)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>

                {previewImage && (
                  <div className="mt-[10px] flex flex-wrap gap-2">
                    <div className="relative w-[50px] h-[50px]">
                      <Image
                        src={previewImage}
                        alt="preview"
                        width={50}
                        height={50}
                        className="rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                        onClick={() => {
                          setSelectedImage(null);
                          if (previewImage) {
                            URL.revokeObjectURL(previewImage);
                          }
                          setPreviewImage(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-[20px] sm:mt-[25px]">
              <button
                type="submit"
                disabled={loading}
                className="font-medium inline-block transition-all rounded-md 2xl:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50"
              >
                {loading ? "جارٍ الإرسال..." : "إنشاء"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
