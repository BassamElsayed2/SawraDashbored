"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormSetValue,
} from "react-hook-form";
import type { Branch, BranchFormData } from "./types";

const GoogleMapPicker = dynamic(
  () => import("@/components/GoogleMapPicker"),
  { ssr: false }
);

interface BranchEditModalProps {
  branch: Branch;
  previewImage: string | null;
  loading: boolean;
  register: UseFormRegister<BranchFormData>;
  errors: FieldErrors<BranchFormData>;
  setValue: UseFormSetValue<BranchFormData>;
  onSubmit: ReturnType<UseFormHandleSubmit<BranchFormData>>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onClose: () => void;
}

export function BranchEditModal({
  branch,
  previewImage,
  loading,
  register,
  errors,
  setValue,
  onSubmit,
  onFileChange,
  onClearImage,
  onClose,
}: BranchEditModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#0c1427] p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            تعديل الفرع
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-medium text-black dark:text-white">
                اسم الفرع (ar)
              </label>
              <input
                {...register("name_ar", {
                  required: true,
                  minLength: { value: 3, message: "الاسم يجب أن يكون 3 أحرف على الأقل" },
                })}
                className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
              />
              {errors.name_ar && (
                <p className="text-red-500 mt-1">{errors.name_ar.message || "مطلوب"}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-medium text-black dark:text-white">
                اسم الفرع (en)
              </label>
              <input
                {...register("name_en", {
                  required: true,
                  minLength: { value: 3, message: "الاسم يجب أن يكون 3 أحرف على الأقل" },
                })}
                className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
              />
              {errors.name_en && (
                <p className="text-red-500 mt-1">{errors.name_en.message || "مطلوب"}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-medium text-black dark:text-white">
                العنوان (ar)
              </label>
              <input
                {...register("address_ar", {
                  required: true,
                  minLength: { value: 3, message: "العنوان يجب أن يكون 3 أحرف على الأقل" },
                })}
                className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
              />
              {errors.address_ar && (
                <p className="text-red-500 mt-1">{errors.address_ar.message || "مطلوب"}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-medium text-black dark:text-white">
                العنوان (en)
              </label>
              <input
                {...register("address_en", {
                  required: true,
                  minLength: { value: 3, message: "العنوان يجب أن يكون 3 أحرف على الأقل" },
                })}
                className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
              />
              {errors.address_en && (
                <p className="text-red-500 mt-1">{errors.address_en.message || "مطلوب"}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-medium text-black dark:text-white">
                رقم الهاتف
              </label>
              <input
                {...register("phone", {
                  required: true,
                  minLength: { value: 3, message: "رقم الهاتف يجب أن يكون 3 أحرف على الأقل" },
                })}
                className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
              />
              {errors.phone && (
                <p className="text-red-500 mt-1">{errors.phone.message || "مطلوب"}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block font-medium text-black dark:text-white">
                اختر موقع الفرع على الخريطة
              </label>
              <GoogleMapPicker
                onLocationSelect={(lat, lng) => {
                  setValue("lat", lat);
                  setValue("lng", lng);
                  toast.success(`تم تحديد الموقع: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }}
                initialLat={branch.lat || 24.7136}
                initialLng={branch.lng || 46.6753}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-black dark:text-white">
                خط العرض - Latitude
              </label>
              <input
                type="number"
                step="any"
                {...register("lat", { valueAsNumber: true })}
                placeholder="24.7136"
                className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-black dark:text-white">
                خط الطول - Longitude
              </label>
              <input
                type="number"
                step="any"
                {...register("lng", { valueAsNumber: true })}
                placeholder="46.6753"
                className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block font-medium text-black dark:text-white">
                الموقع الجغرافي (google map) - اختياري
              </label>
              <input
                {...register("google_map")}
                placeholder="رابط خريطة جوجل"
                className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block font-medium text-black dark:text-white">
                الصورة
              </label>
              <div className="relative flex items-center justify-center overflow-hidden rounded-md py-8 px-4 border border-gray-200 dark:border-[#172036]">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-3 rtl:ml-3">
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
                  onChange={onFileChange}
                />
              </div>

              {previewImage && (
                <div className="mt-2 flex flex-wrap gap-2">
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
                      onClick={onClearImage}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
